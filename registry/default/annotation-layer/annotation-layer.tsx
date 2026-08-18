"use client"

import * as React from "react"
import { MessageSquare, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type Annotation = {
  id: string
  x: number
  y: number
  width: number
  height: number
  note?: string
  author?: string
}

export type AnnotationRect = Pick<Annotation, "x" | "y" | "width" | "height">

export type AnnotationLayerProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onSelect"
> & {
  src: string
  alt: string
  annotations: Annotation[]
  activeId?: string | null
  defaultActiveId?: string | null
  onActiveChange?: (id: string | null) => void
  onCreate?: (rect: AnnotationRect) => void
  onDelete?: (id: string) => void
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

function rectOf(draft: Draft): AnnotationRect {
  return {
    x: Math.min(draft.startX, draft.x),
    y: Math.min(draft.startY, draft.y),
    width: Math.abs(draft.x - draft.startX),
    height: Math.abs(draft.y - draft.startY),
  }
}

export function AnnotationLayer({
  src,
  alt,
  annotations,
  activeId,
  defaultActiveId = null,
  onActiveChange,
  onCreate,
  onDelete,
  readOnly = false,
  minSize = 0.01,
  label = "Annotations",
  renderImage,
  className,
  ...rootProps
}: AnnotationLayerProps) {
  const surfaceRef = React.useRef<HTMLDivElement>(null)
  const [draft, setDraft] = React.useState<Draft | null>(null)
  const [uncontrolled, setUncontrolled] = React.useState(defaultActiveId)

  const selected = activeId === undefined ? uncontrolled : activeId
  const drawable = !readOnly && Boolean(onCreate)

  const select = (id: string | null) => {
    if (activeId === undefined) setUncontrolled(id)
    onActiveChange?.(id)
  }

  const pointFrom = (event: React.PointerEvent) => {
    const bounds = surfaceRef.current?.getBoundingClientRect()
    if (!bounds || bounds.width === 0) return null

    return {
      x: clamp((event.clientX - bounds.left) / bounds.width),
      y: clamp((event.clientY - bounds.top) / bounds.height),
    }
  }

  const active = annotations.find((entry) => entry.id === selected)
  const imageClassName = "block h-auto w-full select-none"

  return (
    <div
      data-slot="annotation-layer"
      className={cn("grid gap-3", className)}
      {...rootProps}
    >
      <div
        ref={surfaceRef}
        data-slot="annotation-surface"
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

          // A click that never moved is a deselect, not a new annotation.
          if (rect.width < minSize || rect.height < minSize) {
            select(null)
            return
          }

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

        <ul aria-label={label} className="absolute inset-0 m-0 list-none p-0">
          {annotations.map((annotation, index) => {
            const isActive = annotation.id === selected

            return (
              <li
                key={annotation.id}
                className="absolute"
                style={{
                  left: toPercent(annotation.x),
                  top: toPercent(annotation.y),
                  width: toPercent(annotation.width),
                  height: toPercent(annotation.height),
                }}
              >
                <button
                  type="button"
                  data-slot="annotation"
                  data-active={isActive || undefined}
                  aria-pressed={isActive}
                  className={cn(
                    "focus-visible:ring-ring size-full rounded-[3px] border-2 focus-visible:ring-2 focus-visible:outline-none",
                    isActive
                      ? "border-primary bg-primary/20"
                      : "border-primary/60 bg-primary/10 hover:bg-primary/20 transition-colors duration-150 motion-reduce:transition-none"
                  )}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => select(isActive ? null : annotation.id)}
                >
                  <span className="sr-only">
                    Note {index + 1}
                    {annotation.note ? `: ${annotation.note}` : ""}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {draft ? (
          <div
            aria-hidden="true"
            data-slot="annotation-draft"
            className="border-primary bg-primary/10 pointer-events-none absolute border-2 border-dashed"
            style={{
              left: toPercent(rectOf(draft).x),
              top: toPercent(rectOf(draft).y),
              width: toPercent(rectOf(draft).width),
              height: toPercent(rectOf(draft).height),
            }}
          />
        ) : null}
      </div>

      <div
        data-slot="annotation-detail"
        aria-live="polite"
        className="text-muted-foreground min-h-9 text-sm"
      >
        {active ? (
          <div className="border-border bg-card flex items-start gap-2.5 rounded-[var(--radius)] border px-3 py-2">
            <MessageSquare
              aria-hidden="true"
              size={14}
              className="mt-0.5 shrink-0"
            />
            <p className="text-foreground min-w-0 flex-1">
              {active.note ?? "No note yet."}
              {active.author ? (
                <span className="text-muted-foreground">
                  {" "}
                  — {active.author}
                </span>
              ) : null}
            </p>

            {onDelete && !readOnly ? (
              <button
                type="button"
                className="hover:text-destructive focus-visible:ring-ring -my-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
                onClick={() => {
                  onDelete(active.id)
                  select(null)
                }}
              >
                <span className="sr-only">Delete this note</span>
                <Trash2 aria-hidden="true" size={14} />
              </button>
            ) : null}
          </div>
        ) : (
          <p>
            {drawable
              ? "Drag on the page to add a note."
              : "Select a highlighted region to read its note."}
          </p>
        )}
      </div>
    </div>
  )
}
