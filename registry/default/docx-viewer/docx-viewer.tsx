"use client"

import * as React from "react"
import { TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

export type DocxResult = {
  html: string
  messages?: string[]
}

export type DocxConverter = (source: ArrayBuffer) => Promise<DocxResult>

export type DocxViewerProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> & {
  source?: ArrayBuffer | Blob
  result?: DocxResult
  converter?: DocxConverter
  allowedTags?: readonly string[]
  label?: string
  loadingLabel?: React.ReactNode
  showWarnings?: boolean
}

/** Hold the loading state back so a fast result never flashes it. */
const LOADING_DELAY_MS = 120

const MISSING_MAMMOTH =
  'DocxViewer needs the "mammoth" package, or a `converter` prop that returns { html }.'

/**
 * Converted documents come from files this app did not write, so the HTML is
 * rebuilt as React elements through this allowlist rather than injected. Any
 * tag, attribute, or URL scheme not named here is dropped.
 */
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "sub",
  "sup",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "a",
  "img",
] as const

const ALLOWED_ATTRIBUTES: Record<string, readonly string[]> = {
  a: ["href", "title"],
  img: ["src", "alt", "width", "height"],
  th: ["colspan", "rowspan"],
  td: ["colspan", "rowspan"],
}

/** Tags whose contents are discarded rather than unwrapped into text. */
const DROPPED_SUBTREES = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
])

/** Tags where a stray whitespace text node is invalid HTML. */
const STRUCTURAL = new Set([
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "ul",
  "ol",
])

const REACT_ATTRIBUTE: Record<string, string> = {
  colspan: "colSpan",
  rowspan: "rowSpan",
}

/** DOMParser is browser-only, so the body is built after hydration. */
const subscribeToNothing = () => () => {}

function isSafeUrl(value: string) {
  const trimmed = value.trim().toLowerCase()

  if (trimmed.startsWith("#") || trimmed.startsWith("/")) return true
  if (trimmed.startsWith("data:image/")) return true

  return /^https?:/.test(trimmed) || /^mailto:/.test(trimmed)
}

function toElements(
  nodes: readonly ChildNode[],
  allowed: ReadonlySet<string>,
  keyPrefix = "n",
  parentTag?: string
): React.ReactNode[] {
  return nodes.flatMap((node, index) => {
    const key = `${keyPrefix}-${index}`

    if (node.nodeType === 3) {
      const text = node.textContent ?? ""
      // A table or list may not hold loose text, and the source markup is
      // usually indented, so whitespace between rows would break hydration.
      if (parentTag && STRUCTURAL.has(parentTag) && !text.trim()) return []
      return [text]
    }

    if (node.nodeType !== 1) return []

    const element = node as Element
    const tag = element.tagName.toLowerCase()

    if (DROPPED_SUBTREES.has(tag)) return []

    const children = toElements([...element.childNodes], allowed, key, tag)

    // An unknown tag loses its wrapper but keeps whatever text it held.
    if (!allowed.has(tag)) return children

    const props: Record<string, unknown> = { key }

    for (const name of ALLOWED_ATTRIBUTES[tag] ?? []) {
      const value = element.getAttribute(name)
      if (value == null) continue
      if ((name === "href" || name === "src") && !isSafeUrl(value)) continue

      props[REACT_ATTRIBUTE[name] ?? name] = value
    }

    if (tag === "a") {
      props.rel = "noreferrer noopener"
      props.target = "_blank"
    }

    if (tag === "br" || tag === "img") return [React.createElement(tag, props)]

    return [React.createElement(tag, props, ...children)]
  })
}

async function convertWithMammoth(source: ArrayBuffer): Promise<DocxResult> {
  let mammoth: typeof import("mammoth")

  try {
    mammoth = await import("mammoth")
  } catch {
    throw new Error(MISSING_MAMMOTH)
  }

  const convert = (
    "default" in mammoth ? mammoth.default : mammoth
  ) as typeof mammoth
  const result = await convert.convertToHtml({ arrayBuffer: source })

  return {
    html: result.value,
    messages: result.messages.map(
      (message: { message: string }) => message.message
    ),
  }
}

export function DocxViewer({
  source,
  result,
  converter = convertWithMammoth,
  allowedTags = ALLOWED_TAGS,
  label = "Document",
  loadingLabel = "Reading the document…",
  showWarnings = false,
  className,
  ...rootProps
}: DocxViewerProps) {
  const [converted, setConverted] = React.useState<DocxResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const output = result ?? converted

  React.useEffect(() => {
    if (result || source == null) return

    const controller = new AbortController()
    const spinner = window.setTimeout(() => setLoading(true), LOADING_DELAY_MS)

    void (async () => {
      try {
        const buffer =
          source instanceof Blob ? await source.arrayBuffer() : source
        const next = await converter(buffer)
        if (controller.signal.aborted) return
        setConverted(next)
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
    }
  }, [source, result, converter])

  const isClient = React.useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  )

  const body = React.useMemo(() => {
    if (!isClient || !output) return null

    const parsed = new DOMParser().parseFromString(output.html, "text/html")

    return toElements([...parsed.body.childNodes], new Set(allowedTags))
  }, [isClient, output, allowedTags])

  if (error) {
    return (
      <section
        data-slot="docx-viewer"
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
      data-slot="docx-viewer"
      data-state={loading ? "loading" : "ready"}
      aria-label={label}
      aria-busy={loading || undefined}
      className={cn(
        "border-border bg-card text-card-foreground rounded-[var(--radius)] border",
        className
      )}
      {...rootProps}
    >
      {loading && !output ? (
        <p className="text-muted-foreground px-5 py-6 text-sm">
          {loadingLabel}
        </p>
      ) : null}

      {body ? (
        <div
          data-slot="docx-viewer-body"
          className="max-h-[30rem] overflow-auto px-5 py-5 text-sm leading-relaxed [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-lg [&_h3]:font-semibold [&_img]:max-w-full [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
        >
          {body}
        </div>
      ) : null}

      {showWarnings && output?.messages?.length ? (
        <ul
          data-slot="docx-viewer-warnings"
          className="text-muted-foreground border-border border-t px-5 py-3 text-xs"
        >
          {output.messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
