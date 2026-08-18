"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type BoundingBoxTone = "default" | "accent" | "warning"

export type BoundingBox = {
  id: string
  label?: string
  tone?: BoundingBoxTone
  x: number
  y: number
  width: number
  height: number
}

export type BoundingBoxesProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onSelect"
> & {
  src: string
  alt: string
  boxes: BoundingBox[]
  activeId?: string | null
  defaultActiveId?: string | null
  onActiveChange?: (id: string | null) => void
  showLabels?: boolean
  groupLabel?: string
  renderImage?: (props: {
    src: string
    alt: string
    className: string
  }) => React.ReactNode
}

const toneClasses: Record<BoundingBoxTone, string> = {
  default: "border-primary bg-primary/10",
  accent: "border-accent bg-accent/10",
  warning: "border-destructive bg-destructive/10",
}

function toPercent(value: number) {
  return `${Math.max(0, Math.min(1, value)) * 100}%`
}

export function BoundingBoxes({
  src,
  alt,
  boxes,
  activeId,
  defaultActiveId = null,
  onActiveChange,
  showLabels = true,
  groupLabel = "Highlighted regions",
  renderImage,
  className,
  ...rootProps
}: BoundingBoxesProps) {
  const [uncontrolledId, setUncontrolledId] = React.useState(defaultActiveId)
  const selected = activeId === undefined ? uncontrolledId : activeId

  const select = (id: string) => {
    const next = selected === id ? null : id
    if (activeId === undefined) setUncontrolledId(next)
    onActiveChange?.(next)
  }

  const imageClassName = "block h-auto w-full select-none"

  return (
    <div
      data-slot="bounding-boxes"
      className={cn(
        "border-border bg-muted relative overflow-hidden rounded-[var(--radius)] border",
        className
      )}
      {...rootProps}
    >
      {renderImage ? (
        renderImage({ src, alt, className: imageClassName })
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={alt} className={imageClassName} src={src} />
      )}

      <ul
        data-slot="bounding-boxes-list"
        aria-label={groupLabel}
        className="absolute inset-0 m-0 list-none p-0"
      >
        {boxes.map((box) => {
          const isActive = box.id === selected
          const tone = toneClasses[box.tone ?? "default"]

          return (
            <li
              key={box.id}
              className="absolute"
              style={{
                left: toPercent(box.x),
                top: toPercent(box.y),
                width: toPercent(box.width),
                height: toPercent(box.height),
              }}
            >
              <button
                type="button"
                data-slot="bounding-box"
                data-active={isActive || undefined}
                aria-pressed={isActive}
                className={cn(
                  "focus-visible:ring-ring size-full rounded-[3px] border-2 transition-opacity duration-150 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
                  tone,
                  isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
                )}
                onClick={() => select(box.id)}
              >
                <span className="sr-only">{box.label ?? "Region"}</span>
              </button>

              {showLabels && box.label ? (
                <span
                  aria-hidden="true"
                  data-slot="bounding-box-label"
                  className={cn(
                    "bg-foreground text-background pointer-events-none absolute -top-0.5 left-0 max-w-full -translate-y-full truncate rounded-t-[3px] px-1.5 py-0.5 text-[0.65rem] font-semibold",
                    !isActive && "opacity-70"
                  )}
                >
                  {box.label}
                </span>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
