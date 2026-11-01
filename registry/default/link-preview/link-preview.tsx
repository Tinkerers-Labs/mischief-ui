"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

export type LinkPreviewData = {
  title: string
  description?: string
  /** An image or screenshot of the page. */
  image?: string
  /** Defaults to the link's host name. */
  domain?: string
}

export interface LinkPreviewProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> {
  href: string
  /** Preview data the host already has. */
  preview?: LinkPreviewData
  /** Fetches the preview on first hover or focus. Results are kept per href. */
  loadPreview?: (href: string) => Promise<LinkPreviewData>
  /** How long a pointer or focus rests on the link before the card opens. */
  openDelay?: number
  /** How long the card waits for the pointer to come back. */
  closeDelay?: number
  loadingLabel?: string
  unavailableLabel?: string
}

type Loaded =
  | { href: string; status: "loading" }
  | { href: string; status: "ready"; data: LinkPreviewData }
  | { href: string; status: "error" }

const cache = new Map<string, Promise<LinkPreviewData>>()

function load(
  href: string,
  loader: (href: string) => Promise<LinkPreviewData>
) {
  let pending = cache.get(href)
  if (!pending) {
    pending = loader(href)
    cache.set(href, pending)
    pending.catch(() => cache.delete(href))
  }
  return pending
}

function hostOf(href: string) {
  try {
    return new URL(href, "http://localhost").hostname.replace(/^www\./, "")
  } catch {
    return href
  }
}

const EDGE = 8
const POINTER_FOCUS_GRACE = 800

/**
 * An inline link that shows where it leads before you follow it. The card is
 * a description of the link, never a replacement for it: the link keeps its
 * own click, its own focus, and its own behavior on touch.
 */
export function LinkPreview({
  href,
  preview,
  loadPreview,
  openDelay = 500,
  closeDelay = 250,
  loadingLabel = "Loading preview",
  unavailableLabel = "No preview available",
  className,
  children,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onFocus,
  onBlur,
  ...anchorProps
}: LinkPreviewProps) {
  const id = React.useId()
  const cardId = `${id}-preview`
  const linkRef = React.useRef<HTMLAnchorElement>(null)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const openTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const pressedAt = React.useRef(0)
  const [open, setOpen] = React.useState(false)
  const [loaded, setLoaded] = React.useState<Loaded | null>(null)
  const [brokenImage, setBrokenImage] = React.useState<string | null>(null)

  const enabled = Boolean(preview || loadPreview)
  const current = loaded?.href === href ? loaded : null
  const data = preview ?? (current?.status === "ready" ? current.data : null)
  const status = preview ? "ready" : (current?.status ?? "loading")
  const domain = data?.domain ?? hostOf(href)

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    openTimer.current = null
    closeTimer.current = null
  }

  React.useEffect(() => clearTimers, [])

  const fetchPreview = () => {
    if (preview || !loadPreview) return
    if (current && current.status !== "error") return
    setLoaded({ href, status: "loading" })
    load(href, loadPreview).then(
      (result) => setLoaded({ href, status: "ready", data: result }),
      () => setLoaded({ href, status: "error" })
    )
  }

  const scheduleOpen = () => {
    if (!enabled) return
    fetchPreview()
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = null
    if (open || openTimer.current) return
    openTimer.current = setTimeout(() => {
      openTimer.current = null
      setOpen(true)
    }, openDelay)
  }

  const scheduleClose = () => {
    if (openTimer.current) clearTimeout(openTimer.current)
    openTimer.current = null
    if (!open || closeTimer.current) return
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null
      setOpen(false)
    }, closeDelay)
  }

  const close = () => {
    clearTimers()
    setOpen(false)
  }

  const place = React.useCallback(() => {
    const link = linkRef.current
    const card = cardRef.current
    if (!link || !card) return
    const rects = link.getClientRects()
    const rect = rects[0] ?? link.getBoundingClientRect()
    const last = rects[rects.length - 1] ?? rect
    const width = card.offsetWidth
    const height = card.offsetHeight
    const below =
      window.innerHeight - last.bottom >= height || rect.top < height
    const left = Math.min(
      Math.max(rect.left, EDGE),
      Math.max(EDGE, document.documentElement.clientWidth - width - EDGE)
    )
    card.dataset.side = below ? "bottom" : "top"
    card.style.left = `${left}px`
    card.style.top = `${below ? last.bottom : rect.top - height}px`
  }, [])

  React.useLayoutEffect(() => {
    if (!open) return
    place()
    let frame = 0
    const follow = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(place)
    }
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clearTimers()
        setOpen(false)
      }
    }
    window.addEventListener("scroll", follow, true)
    window.addEventListener("resize", follow)
    document.addEventListener("keydown", dismiss)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", follow, true)
      window.removeEventListener("resize", follow)
      document.removeEventListener("keydown", dismiss)
    }
  }, [open, place, status])

  const image = data?.image && data.image !== brokenImage ? data.image : null

  return (
    <>
      <a
        ref={linkRef}
        href={href}
        aria-describedby={open ? cardId : undefined}
        data-slot="link-preview"
        data-state={open ? "open" : "closed"}
        className={cn(
          "text-primary decoration-primary/40 hover:decoration-primary focus-visible:ring-ring rounded-sm underline underline-offset-4 transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
          className
        )}
        onPointerEnter={(event) => {
          onPointerEnter?.(event)
          if (event.pointerType !== "touch") scheduleOpen()
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event)
          if (event.pointerType !== "touch") scheduleClose()
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event)
          pressedAt.current = Date.now()
          if (event.pointerType === "touch") close()
        }}
        onFocus={(event) => {
          onFocus?.(event)
          // A press focuses the link on its way to following it. Hover has
          // already answered a mouse, and a tap is not a request to preview.
          if (Date.now() - pressedAt.current < POINTER_FOCUS_GRACE) return
          scheduleOpen()
        }}
        onBlur={(event) => {
          onBlur?.(event)
          close()
        }}
        {...anchorProps}
      >
        {children}
      </a>
      {open
        ? createPortal(
            <div
              ref={cardRef}
              id={cardId}
              role="tooltip"
              data-slot="link-preview-card"
              data-status={status}
              className="fixed z-50 w-80 max-w-[calc(100vw-1rem)] transition-[opacity,translate] duration-150 ease-out data-[side=bottom]:pt-2 data-[side=top]:pb-2 motion-reduce:transition-none starting:translate-y-1 starting:opacity-0"
              style={{ top: 0, left: 0 }}
              onPointerEnter={() => {
                if (closeTimer.current) clearTimeout(closeTimer.current)
                closeTimer.current = null
              }}
              onPointerLeave={scheduleClose}
            >
              <div className="bg-popover text-popover-foreground border-border overflow-hidden rounded-[var(--radius)] border shadow-lg">
                {status === "loading" ? (
                  <div aria-busy="true" className="grid gap-2 p-3">
                    <span className="sr-only">{loadingLabel}</span>
                    <div className="bg-muted aspect-[1.91/1] w-full animate-pulse rounded-md motion-reduce:animate-none" />
                    <div className="bg-muted h-4 w-3/4 animate-pulse rounded motion-reduce:animate-none" />
                    <div className="bg-muted h-3 w-full animate-pulse rounded motion-reduce:animate-none" />
                    <div className="bg-muted h-3 w-1/3 animate-pulse rounded motion-reduce:animate-none" />
                  </div>
                ) : data ? (
                  <>
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt=""
                        className="bg-muted aspect-[1.91/1] w-full object-cover"
                        onLoad={place}
                        onError={() => setBrokenImage(image)}
                      />
                    ) : null}
                    <div className="grid gap-1 p-3">
                      <p className="line-clamp-2 text-sm font-semibold">
                        {data.title}
                      </p>
                      {data.description ? (
                        <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">
                          {data.description}
                        </p>
                      ) : null}
                      <p className="text-muted-foreground truncate text-xs font-medium">
                        {domain}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="grid gap-1 p-3">
                    <p className="text-sm">{unavailableLabel}</p>
                    <p className="text-muted-foreground truncate text-xs font-medium">
                      {domain}
                    </p>
                  </div>
                )}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}
