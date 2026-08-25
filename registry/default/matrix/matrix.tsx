"use client"

import * as React from "react"

import {
  RenderSurface,
  useThemeColors,
  type SurfaceColor,
} from "@/registry/default/render-surface/render-surface"
import { cn } from "@/lib/utils"

export type MatrixProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Cells across. Rows are worked out from the box. */
  columns?: number
  /** Nought to one. Lights the grid from the middle out. */
  level?: number
  /** Keeps moving with nothing to show, at a low idle. */
  idle?: boolean
  color?: string
  gap?: number
  label?: string
}

type Cell = { x: number; y: number; seed: number }

/**
 * A grid of cells lit by a level: an equaliser that reads as hardware rather
 * than as a chart. Loud lights the middle rows outward, quiet leaves a low
 * shimmer along the floor.
 */
export function Matrix({
  columns = 24,
  level = 0,
  idle = true,
  color = "--primary",
  gap = 2,
  label,
  className,
  ...rootProps
}: MatrixProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const tokens = React.useMemo(
    () => (color.startsWith("--") ? [color] : []),
    [color]
  )
  const resolved = useThemeColors(rootRef, tokens)
  const ink = color.startsWith("--") ? resolved[color] : undefined

  const live = React.useRef({ level, idle })
  React.useEffect(() => {
    live.current = { level, idle }
  })

  const setup = React.useCallback(
    ({ size }: { size: { width: number; height: number } }): Cell[] => {
      const step = size.width / Math.max(columns, 1)
      const rows = Math.max(1, Math.round(size.height / step))
      const made: Cell[] = []

      for (let x = 0; x < columns; x += 1) {
        for (let y = 0; y < rows; y += 1) {
          made.push({ x, y, seed: (x * 7 + y * 13) % 17 })
        }
      }

      return made
    },
    [columns]
  )

  const draw = React.useCallback(
    ({
      context,
      size: box,
      state: cells,
      time,
    }: {
      context: CanvasRenderingContext2D
      size: { width: number; height: number; dpr: number }
      state: Cell[]
      time: number
    }) => {
      if (!ink) return

      context.setTransform(box.dpr, 0, 0, box.dpr, 0, 0)
      context.clearRect(0, 0, box.width, box.height)

      const step = box.width / Math.max(columns, 1)
      const rows = Math.max(1, Math.round(box.height / step))
      const size = Math.max(step - gap, 1)
      const [r, g, b] = ink as SurfaceColor
      const rgb = `${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}`

      const loud = Math.min(Math.max(live.current.level, 0), 1)
      const floor = live.current.idle ? 0.12 : 0

      for (const cell of cells) {
        // Height from the bottom, so the grid reads as a level meter rather
        // than as noise scattered over a rectangle.
        const column =
          Math.sin(time * 1.6 + cell.x * 0.5 + cell.seed) * 0.5 + 0.5
        const reach = Math.max(loud * (0.55 + column * 0.45), floor * column)
        const lit = 1 - cell.y / rows <= reach

        context.fillStyle = `rgba(${rgb}, ${lit ? 0.25 + reach * 0.6 : 0.06})`
        context.fillRect(
          cell.x * step + gap / 2,
          cell.y * step + gap / 2,
          size,
          size
        )
      }
    },
    [columns, gap, ink]
  )

  return (
    <div
      ref={rootRef}
      data-slot="matrix"
      className={cn("relative isolate overflow-hidden", className)}
      {...rootProps}
    >
      {ink !== undefined && (
        <RenderSurface<Cell[], "2d">
          setup={setup}
          draw={draw}
          rebuildOnResize
          className="absolute inset-0"
          label={label}
        />
      )}
    </div>
  )
}
