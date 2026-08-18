"use client"

import * as React from "react"
import {
  ChevronLeft,
  ChevronRight,
  TriangleAlert,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type PdfPageHandle = {
  width: number
  height: number
  render: (canvas: HTMLCanvasElement, scale: number) => Promise<void>
}

export type PdfDocumentHandle = {
  pageCount: number
  getPage: (pageNumber: number) => Promise<PdfPageHandle>
  destroy?: () => void
}

export type PdfLoader = (
  source: string | ArrayBuffer
) => Promise<PdfDocumentHandle>

export type PdfViewerProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> & {
  source?: string | ArrayBuffer
  document?: PdfDocumentHandle
  loader?: PdfLoader
  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void
  defaultScale?: number
  minScale?: number
  maxScale?: number
  label?: string
  loadingLabel?: React.ReactNode
  workerSrc?: string
}

/** Hold the loading state back so a fast result never flashes it. */
const LOADING_DELAY_MS = 120

const MISSING_PDFJS =
  'PdfViewer needs the "pdfjs-dist" package, or a `loader` prop that returns a document handle.'

async function loadWithPdfjs(
  source: string | ArrayBuffer,
  workerSrc?: string
): Promise<PdfDocumentHandle> {
  let pdfjs: typeof import("pdfjs-dist")

  try {
    pdfjs = await import("pdfjs-dist")
  } catch {
    throw new Error(MISSING_PDFJS)
  }

  if (workerSrc) pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

  const task = pdfjs.getDocument(
    typeof source === "string"
      ? { url: source }
      : { data: new Uint8Array(source) }
  )
  const pdf = await task.promise

  return {
    pageCount: pdf.numPages,
    destroy: () => void task.destroy(),
    async getPage(pageNumber) {
      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 1 })

      return {
        width: viewport.width,
        height: viewport.height,
        async render(canvas, scale) {
          const scaled = page.getViewport({ scale })
          const context = canvas.getContext("2d")
          if (!context) return

          canvas.width = scaled.width
          canvas.height = scaled.height

          await page.render({
            canvas,
            canvasContext: context,
            viewport: scaled,
          }).promise
        },
      }
    },
  }
}

export function PdfViewer({
  source,
  document: controlledDocument,
  loader,
  page,
  defaultPage = 1,
  onPageChange,
  defaultScale = 1,
  minScale = 0.5,
  maxScale = 3,
  label = "PDF document",
  loadingLabel = "Opening the document…",
  workerSrc,
  className,
  ...rootProps
}: PdfViewerProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = React.useState<PdfDocumentHandle | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [scale, setScale] = React.useState(defaultScale)
  const [uncontrolledPage, setUncontrolledPage] = React.useState(defaultPage)

  const current = page ?? uncontrolledPage
  const handle = controlledDocument ?? loaded
  const pageCount = handle?.pageCount ?? 0

  const load = React.useRef(loader)
  React.useEffect(() => {
    load.current = loader
  })

  React.useEffect(() => {
    if (controlledDocument || source == null) return

    const controller = new AbortController()
    const spinner = window.setTimeout(() => setLoading(true), LOADING_DELAY_MS)
    let opened: PdfDocumentHandle | null = null

    void (async () => {
      try {
        const open =
          load.current ??
          ((input: string | ArrayBuffer) => loadWithPdfjs(input, workerSrc))
        opened = await open(source)
        if (controller.signal.aborted) return
        setLoaded(opened)
        setError(null)
      } catch (cause) {
        if (controller.signal.aborted) return
        setError(cause instanceof Error ? cause.message : String(cause))
      } finally {
        window.clearTimeout(spinner)
        if (!controller.signal.aborted) setLoading(false)
      }
    })()

    return () => {
      controller.abort()
      window.clearTimeout(spinner)
      opened?.destroy?.()
    }
  }, [source, controlledDocument, workerSrc])

  React.useEffect(() => {
    if (!handle || !canvasRef.current) return

    const controller = new AbortController()
    const canvas = canvasRef.current

    void (async () => {
      try {
        const target = await handle.getPage(current)
        if (controller.signal.aborted) return
        await target.render(canvas, scale)
      } catch (cause) {
        if (controller.signal.aborted) return
        setError(cause instanceof Error ? cause.message : String(cause))
      }
    })()

    return () => controller.abort()
  }, [handle, current, scale])

  const goTo = (next: number) => {
    const clamped = Math.min(Math.max(next, 1), Math.max(pageCount, 1))
    if (page === undefined) setUncontrolledPage(clamped)
    onPageChange?.(clamped)
  }

  if (error) {
    return (
      <section
        data-slot="pdf-viewer"
        data-state="error"
        className={cn(
          "border-border bg-card text-destructive flex items-center gap-2 rounded-[var(--radius)] border px-4 py-3 text-sm",
          className
        )}
        {...rootProps}
      >
        <TriangleAlert aria-hidden="true" size={15} className="shrink-0" />
        <p role="alert">{error}</p>
      </section>
    )
  }

  return (
    <section
      data-slot="pdf-viewer"
      data-state={loading ? "loading" : "ready"}
      aria-label={label}
      aria-busy={loading || undefined}
      className={cn(
        "border-border bg-card text-card-foreground overflow-hidden rounded-[var(--radius)] border",
        className
      )}
      {...rootProps}
    >
      <div
        data-slot="pdf-viewer-toolbar"
        className="border-border flex flex-wrap items-center gap-2 border-b px-3 py-2"
      >
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={current <= 1}
            className="hover:bg-muted focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-full transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40 motion-reduce:transition-none"
            onClick={() => goTo(current - 1)}
          >
            <ChevronLeft aria-hidden="true" size={15} />
          </button>

          <p
            aria-live="polite"
            className="font-[family-name:var(--font-mono),monospace] text-xs tabular-nums"
          >
            {pageCount > 0 ? `${current} / ${pageCount}` : "—"}
          </p>

          <button
            type="button"
            aria-label="Next page"
            disabled={pageCount === 0 || current >= pageCount}
            className="hover:bg-muted focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-full transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40 motion-reduce:transition-none"
            onClick={() => goTo(current + 1)}
          >
            <ChevronRight aria-hidden="true" size={15} />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label="Zoom out"
            disabled={scale <= minScale}
            className="hover:bg-muted focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-full transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40 motion-reduce:transition-none"
            onClick={() =>
              setScale((value) => Math.max(value - 0.25, minScale))
            }
          >
            <ZoomOut aria-hidden="true" size={15} />
          </button>

          <p className="text-muted-foreground w-12 text-center font-[family-name:var(--font-mono),monospace] text-xs tabular-nums">
            {Math.round(scale * 100)}%
          </p>

          <button
            type="button"
            aria-label="Zoom in"
            disabled={scale >= maxScale}
            className="hover:bg-muted focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-full transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40 motion-reduce:transition-none"
            onClick={() =>
              setScale((value) => Math.min(value + 0.25, maxScale))
            }
          >
            <ZoomIn aria-hidden="true" size={15} />
          </button>
        </div>
      </div>

      <div className="bg-muted max-h-[30rem] overflow-auto p-4">
        {loading && !handle ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            {loadingLabel}
          </p>
        ) : null}

        <canvas
          ref={canvasRef}
          data-slot="pdf-viewer-canvas"
          role="img"
          aria-label={`${label}, page ${current}`}
          className="mx-auto block max-w-full shadow-sm"
        />
      </div>
    </section>
  )
}
