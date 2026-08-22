"use client"

import * as React from "react"
import {
  RenderSurface,
  useThemeColors,
  type SurfaceColor,
} from "@/registry/default/render-surface/render-surface"
import { cn } from "@/lib/utils"

export type CursorTrailProps = React.HTMLAttributes<HTMLDivElement> & {
  color?: string
  /** Widest the trail gets, in pixels. */
  size?: number
  /** Seconds a mark takes to fade. */
  life?: number
  surfaceClassName?: string
}

type Mark = { x: number; y: number; age: number }

/**
 * Leaves a fading mark behind the pointer inside its own box. It draws only
 * while the pointer is over it, so it costs nothing on the rest of the page.
 */
export function CursorTrail({
  color = "--primary",
  size = 26,
  life = 0.7,
  className,
  surfaceClassName,
  children,
  ...rootProps
}: CursorTrailProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const marks = React.useRef<Mark[]>([])
  const pointer = React.useRef({ x: 0, y: 0, down: false })
  const [drawing, setDrawing] = React.useState(false)

  const tokens = React.useMemo(
    () => (color.startsWith("--") ? [color] : []),
    [color]
  )

  const resolved = useThemeColors(rootRef, tokens)
  const ink = color.startsWith("--") ? resolved[color] : undefined

  const setup = React.useCallback(() => null, [])

  const draw = React.useCallback(
    ({
      context,
      size: box,
      delta,
    }: {
      context: CanvasRenderingContext2D
      size: { width: number; height: number; dpr: number }
      delta: number
    }) => {
      if (!ink) return

      context.setTransform(box.dpr, 0, 0, box.dpr, 0, 0)
      context.clearRect(0, 0, box.width, box.height)

      const living: Mark[] = []

      for (const mark of marks.current) {
        mark.age += delta
        if (mark.age >= life) continue
        living.push(mark)

        const remaining = 1 - mark.age / life
        const radius = (size / 2) * remaining
        const [r, g, b] = ink as SurfaceColor

        context.fillStyle = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${remaining * 0.5})`
        context.beginPath()
        context.arc(mark.x, mark.y, Math.max(radius, 0.5), 0, Math.PI * 2)
        context.fill()
      }

      marks.current = living
      if (living.length === 0 && !pointer.current.down) setDrawing(false)
    },
    [ink, life, size]
  )

  return (
    <div
      ref={rootRef}
      data-slot="cursor-trail"
      className={cn("relative isolate overflow-hidden", className)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        pointer.current.x = event.clientX - rect.left
        pointer.current.y = event.clientY - rect.top
        pointer.current.down = true

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          return
        }

        marks.current.push({
          x: pointer.current.x,
          y: pointer.current.y,
          age: 0,
        })

        setDrawing(true)
      }}
      onPointerLeave={() => {
        pointer.current.down = false
      }}
      {...rootProps}
    >
      {ink !== undefined && (
        <RenderSurface<null, "2d">
          setup={setup}
          draw={draw}
          paused={!drawing}
          className={cn(
            "pointer-events-none absolute inset-0 z-10",
            surfaceClassName
          )}
        />
      )}
      {children}
    </div>
  )
}
