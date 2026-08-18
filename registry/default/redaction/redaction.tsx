"use client"

import * as React from "react"
import { Eye, EyeOff, Trash2, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

export type RedactionRegion = {
  id: string
  x: number
  y: number
  width: number
  height: number
  reason?: string
}

export type RedactionRect = Pick<
  RedactionRegion,
  "x" | "y" | "width" | "height"
>

export type RedactionProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> & {
  src: string
  alt: string
  regions: RedactionRegion[]
  onCreate?: (rect: RedactionRect) => void
  onDelete?: (id: string) => void
  revealed?: boolean
  defaultRevealed?: boolean
  onRevealedChange?: (revealed: boolean) => void
  readOnly?: boolean
  minSize?: number
  label?: string
  renderImage?: (props: {
    src: string
    alt: string
    className: string
  }) => React.ReactNode
}

type Draft = { startX: number; startY: number; x: number; y: number }

function clamp(value: number) {
  return Math.max(0, Math.min(1, value))
}

function toPercent(value: number) {
  return `${clamp(value) * 100}%`
}

function rectOf(draft: Draft): RedactionRect {
  return {
    x: Math.min(draft.startX, draft.x),
    y: Math.min(draft.startY, draft.y),
    width: Math.abs(draft.x - draft.startX),
    height: Math.abs(draft.y - draft.startY),
  }
}

export function Redaction({
  src,
  alt,
  regions,
  onCreate,
  onDelete,
  revealed,
  defaultRevealed = false,
  onRevealedChange,
  readOnly = false,
  minSize = 0.01,
  label = "Redactions",
  renderImage,
  className,
  ...rootProps
}: RedactionProps) {
  const surfaceRef = React.useRef<HTMLDivElement>(null)
  const [draft, setDraft] = React.useState<Draft | null>(null)
  const [uncontrolledRevealed, setUncontrolledRevealed] =
    React.useState(defaultRevealed)

  const showing = revealed ?? uncontrolledRevealed
  const drawable = !readOnly && Boolean(onCreate)

  const toggleReveal = () => {
    const next = !showing
    if (revealed === undefined) setUncontrolledRevealed(next)
    onRevealedChange?.(next)
  }

  const pointFrom = (event: React.PointerEvent) => {
    const bounds = surfaceRef.current?.getBoundingClientRect()
    if (!bounds || bounds.width === 0) return null

    return {
      x: clamp((event.clientX - bounds.left) / bounds.width),
      y: clamp((event.clientY - bounds.top) / bounds.height),
    }
  }

  const imageClassName = "block h-auto w-full select-none"

  return (
    <section
      data-slot="redaction"
      data-revealed={showing || undefined}
      aria-label={label}
      className={cn("grid gap-3", className)}
      {...rootProps}
    >
      <div
        ref={surfaceRef}
        data-slot="redaction-surface"
        className={cn(
          "border-border bg-muted relative overflow-hidden rounded-[var(--radius)] border",
          drawable && "cursor-crosshair"
        )}
        onPointerDown={(event) => {
          if (!drawable || event.button !== 0) return
          const point = pointFrom(event)
          if (!point) return

          event.currentTarget.setPointerCapture(event.pointerId)
          setDraft({ startX: point.x, startY: point.y, ...point })
        }}
        onPointerMove={(event) => {
          if (!draft) return
          const point = pointFrom(event)
          if (!point) return

          setDraft((current) => (current ? { ...current, ...point } : current))
        }}
        onPointerUp={() => {
          if (!draft) return

          const rect = rectOf(draft)
          setDraft(null)
          if (rect.width < minSize || rect.height < minSize) return

          onCreate?.(rect)
        }}
        onPointerCancel={() => setDraft(null)}
      >
        {renderImage ? (
          renderImage({ src, alt, className: imageClassName })
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={alt}
            className={imageClassName}
            src={src}
            draggable={false}
          />
        )}

        <ul className="absolute inset-0 m-0 list-none p-0">
          {regions.map((region, index) => (
            <li
              key={region.id}
              data-slot="redaction-region"
              data-revealed={showing || undefined}
              className={cn(
                "absolute",
                showing
                  ? "border-destructive bg-destructive/15 border-2 border-dashed"
                  : "bg-foreground"
              )}
              style={{
                left: toPercent(region.x),
                top: toPercent(region.y),
                width: toPercent(region.width),
                height: toPercent(region.height),
              }}
            >
              <span className="sr-only">
                Redaction {index + 1}
                {region.reason ? `: ${region.reason}` : ""}
                {showing ? ", currently revealed for review" : ""}
              </span>
            </li>
          ))}
        </ul>

        {draft ? (
          <div
            aria-hidden="true"
            className="border-foreground bg-foreground/20 pointer-events-none absolute border-2 border-dashed"
            style={{
              left: toPercent(rectOf(draft).x),
              top: toPercent(rectOf(draft).y),
              width: toPercent(rectOf(draft).width),
              height: toPercent(rectOf(draft).height),
            }}
          />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <p
          data-slot="redaction-count"
          className="text-muted-foreground text-sm"
        >
          {regions.length} {regions.length === 1 ? "redaction" : "redactions"}
        </p>

        <button
          type="button"
          data-slot="redaction-reveal"
          aria-pressed={showing}
          className="border-border hover:bg-muted focus-visible:ring-ring ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
          onClick={toggleReveal}
        >
          {showing ? (
            <EyeOff aria-hidden="true" size={13} />
          ) : (
            <Eye aria-hidden="true" size={13} />
          )}
          {showing ? "Hide again" : "Reveal for review"}
        </button>
      </div>

      {showing ? (
        <p
          role="status"
          className="text-destructive flex items-center gap-2 text-xs"
        >
          <TriangleAlert aria-hidden="true" size={13} className="shrink-0" />
          Revealed for review. These regions are only covered visually here, so
          redact the source file before sharing it.
        </p>
      ) : null}

      {regions.length > 0 && onDelete && !readOnly ? (
        <ul data-slot="redaction-list" className="grid gap-1">
          {regions.map((region, index) => (
            <li
              key={region.id}
              className="border-border flex items-center gap-2 rounded-[calc(var(--radius)-0.25rem)] border px-3 py-1.5 text-sm"
            >
              <span className="text-muted-foreground font-[family-name:var(--font-mono),monospace] text-xs tabular-nums">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate">
                {region.reason ?? "No reason given"}
              </span>
              <button
                type="button"
                className="text-muted-foreground hover:text-destructive focus-visible:ring-ring -my-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
                onClick={() => onDelete(region.id)}
              >
                <span className="sr-only">Remove redaction {index + 1}</span>
                <Trash2 aria-hidden="true" size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
