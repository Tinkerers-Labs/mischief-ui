"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ResizablePanelsProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onChange"
> & {
  first: React.ReactNode
  second: React.ReactNode
  direction?: "horizontal" | "vertical"
  /** Percentage of the box given to the first panel. */
  size?: number
  defaultSize?: number
  onSizeChange?: (size: number) => void
  min?: number
  max?: number
  /** Percentage points an arrow key moves. */
  step?: number
  label?: string
}

/**
 * Two panels and something to drag between them. The divider is a real
 * separator with a value, so the split can be changed from the keyboard by
 * anyone who cannot drag it.
 */
export function ResizablePanels({
  first,
  second,
  direction = "horizontal",
  size,
  defaultSize = 50,
  onSizeChange,
  min = 15,
  max = 85,
  step = 4,
  label = "Resize panels",
  className,
  ...rootProps
}: ResizablePanelsProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [uncontrolled, setUncontrolled] = React.useState(defaultSize)
  const current = Math.min(max, Math.max(min, size ?? uncontrolled))
  const horizontal = direction === "horizontal"

  const commit = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next))
    if (size === undefined) setUncontrolled(clamped)
    onSizeChange?.(clamped)
  }

  const fromPointer = (event: React.PointerEvent) => {
    const box = ref.current?.getBoundingClientRect()
    if (!box) return

    const ratio = horizontal
      ? (event.clientX - box.left) / box.width
      : (event.clientY - box.top) / box.height

    commit(ratio * 100)
  }

  return (
    <div
      ref={ref}
      data-slot="resizable-panels"
      data-direction={direction}
      className={cn("flex", horizontal ? "flex-row" : "flex-col", className)}
      {...rootProps}
    >
      <div
        data-slot="resizable-panels-first"
        className="min-h-0 min-w-0 overflow-auto"
        style={{ flexBasis: `${current}%` }}
      >
        {first}
      </div>

      <div
        role="separator"
        tabIndex={0}
        aria-label={label}
        aria-orientation={horizontal ? "vertical" : "horizontal"}
        aria-valuenow={Math.round(current)}
        aria-valuemin={min}
        aria-valuemax={max}
        data-slot="resizable-panels-divider"
        className={cn(
          "bg-border hover:bg-ring focus-visible:bg-ring group relative shrink-0 touch-none transition-colors focus-visible:outline-none motion-reduce:transition-none",
          horizontal ? "w-px cursor-col-resize" : "h-px cursor-row-resize"
        )}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            fromPointer(event)
          }
        }}
        onKeyDown={(event) => {
          const back = horizontal ? "ArrowLeft" : "ArrowUp"
          const forward = horizontal ? "ArrowRight" : "ArrowDown"

          if (event.key === back) {
            event.preventDefault()
            commit(current - step)
          }

          if (event.key === forward) {
            event.preventDefault()
            commit(current + step)
          }

          if (event.key === "Home") {
            event.preventDefault()
            commit(min)
          }

          if (event.key === "End") {
            event.preventDefault()
            commit(max)
          }
        }}
      >
        {/* A one pixel line is impossible to hit, so the grab area is wider
            than the line it moves. */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute",
            horizontal
              ? "inset-y-0 -right-2 -left-2"
              : "inset-x-0 -top-2 -bottom-2"
          )}
        />
      </div>

      <div
        data-slot="resizable-panels-second"
        className="min-h-0 min-w-0 flex-1 overflow-auto"
      >
        {second}
      </div>
    </div>
  )
}
