"use client"

import * as React from "react"
import { ExternalLink, RotateCw } from "lucide-react"

import { cn } from "@/lib/utils"

export type PreviewSize = {
  id: string
  label: string
  width: number
}

export type WebPreviewProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "title"
> & {
  src: string
  /**
   * Names the frame for assistive technology. Required, because a frame with
   * no name is announced as "frame" and nothing else.
   */
  title: string
  sizes?: readonly PreviewSize[]
  defaultSize?: string
  /** Let someone type a different address. */
  editable?: boolean
  onNavigate?: (src: string) => void
  /** Replaces the default sandbox. Read the note before widening it. */
  sandbox?: string
  height?: number
}

const SIZES: PreviewSize[] = [
  { id: "phone", label: "Phone", width: 390 },
  { id: "tablet", label: "Tablet", width: 768 },
  { id: "full", label: "Full", width: 0 },
]

/**
 * Scripts and forms, but never allow-same-origin alongside allow-scripts: a
 * frame given both can reach into its own sandbox attribute and take the rest.
 */
const SANDBOX = "allow-scripts allow-forms allow-popups allow-modals"

export function WebPreview({
  src,
  title,
  sizes = SIZES,
  defaultSize,
  editable = false,
  onNavigate,
  sandbox = SANDBOX,
  height = 420,
  className,
  ...rootProps
}: WebPreviewProps) {
  // Everything hangs off src, so a new src resets the bar without an effect
  // reaching in to reset it.
  const [nav, setNav] = React.useState<{
    from: string
    address: string
    typed: string
  } | null>(null)
  const here = nav?.from === src ? nav : null
  const address = here?.address ?? src
  const typed = here?.typed ?? src
  const [size, setSize] = React.useState(defaultSize ?? sizes.at(-1)?.id ?? "")
  const [generation, setGeneration] = React.useState(0)
  const [box, setBox] = React.useState(0)
  const frameRef = React.useRef<HTMLDivElement>(null)
  const addressId = React.useId()

  React.useEffect(() => {
    const element = frameRef.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      setBox(entry?.contentRect.width ?? 0)
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const chosen = sizes.find((option) => option.id === size)
  const width = chosen?.width ?? 0
  // A narrow viewport shown inside a narrower panel is scaled down rather than
  // clipped, so a phone width stays a phone width to the page inside it.
  const scale = width > 0 && box > 0 ? Math.min(1, box / width) : 1

  const go = (next: string) => {
    setNav({ from: src, address: next, typed: next })
    setGeneration((count) => count + 1)
    onNavigate?.(next)
  }

  return (
    <div
      data-slot="web-preview"
      className={cn(
        "border-border bg-background flex w-full flex-col overflow-hidden rounded-xl border",
        className
      )}
      {...rootProps}
    >
      <div className="border-border flex items-center gap-2 border-b p-2">
        <button
          type="button"
          aria-label="Reload the preview"
          onClick={() => setGeneration((count) => count + 1)}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
        >
          <RotateCw aria-hidden="true" size={14} />
        </button>

        <label className="sr-only" htmlFor={addressId}>
          Address
        </label>
        <input
          id={addressId}
          value={typed}
          readOnly={!editable}
          onChange={(event) =>
            setNav({ from: src, address, typed: event.target.value })
          }
          onKeyDown={(event) => {
            if (event.key === "Enter" && editable) go(typed)
          }}
          className="bg-muted/50 text-muted-foreground focus-visible:ring-ring min-w-0 flex-1 truncate rounded-md px-2 py-1.5 font-mono text-xs read-only:cursor-default focus-visible:ring-2 focus-visible:outline-none"
        />

        {sizes.length > 1 ? (
          <div
            role="group"
            aria-label="Preview width"
            className="hidden shrink-0 items-center gap-0.5 sm:flex"
          >
            {sizes.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={option.id === size}
                onClick={() => setSize(option.id)}
                className="text-muted-foreground aria-pressed:bg-muted aria-pressed:text-foreground hover:text-foreground focus-visible:ring-ring inline-flex h-8 items-center rounded-md px-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}

        <a
          href={address}
          target="_blank"
          rel="noreferrer noopener"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
        >
          <ExternalLink aria-hidden="true" size={14} />
          <span className="sr-only">Open {title} in a new tab</span>
        </a>
      </div>

      <div
        ref={frameRef}
        className="bg-muted/20 flex justify-center overflow-hidden"
        style={{ height }}
      >
        <iframe
          key={generation}
          src={address}
          title={title}
          sandbox={sandbox}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="border-0 bg-white"
          style={{
            width: width > 0 ? width : "100%",
            height: width > 0 ? height / scale : "100%",
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: "top center",
          }}
        />
      </div>
    </div>
  )
}
