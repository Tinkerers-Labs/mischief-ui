"use client"

import * as React from "react"
import {
  RenderSurface,
  useThemeColors,
  type SurfaceColor,
} from "@/registry/default/render-surface/render-surface"
import { cn } from "@/lib/utils"

export type ConstellationFieldProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Points per 10,000 CSS pixels of area, so the density survives a resize. */
  density?: number
  speed?: number
  /** Points closer together than this are joined by a line. */
  linkDistance?: number
  /** How far the pointer reaches, in pixels. Zero turns the reaction off. */
  pointerRadius?: number
  color?: string
  paused?: boolean
  surfaceClassName?: string
}

type Point = { x: number; y: number; vx: number; vy: number; r: number }

type Field = {
  points: Point[]
  pointer: { x: number; y: number; active: boolean }
}

function rgba([r, g, b]: SurfaceColor, alpha: number) {
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`
}

export function ConstellationField({
  density = 5,
  speed = 1,
  linkDistance = 120,
  pointerRadius = 160,
  color = "--foreground",
  paused,
  className,
  surfaceClassName,
  children,
  ...rootProps
}: ConstellationFieldProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const pointer = React.useRef({ x: 0, y: 0, active: false })

  const tokens = React.useMemo(
    () => (color.startsWith("--") ? [color] : []),
    [color]
  )

  React.useEffect(() => {
    if (pointerRadius <= 0) return

    const move = (event: PointerEvent) => {
      const box = rootRef.current?.getBoundingClientRect()
      if (!box) return

      const x = event.clientX - box.left
      const y = event.clientY - box.top

      pointer.current.active =
        x >= 0 && x <= box.width && y >= 0 && y <= box.height
      pointer.current.x = x
      pointer.current.y = y
    }

    window.addEventListener("pointermove", move, { passive: true })
    return () => window.removeEventListener("pointermove", move)
  }, [pointerRadius])

  const resolved = useThemeColors(rootRef, tokens)
  const ink = color.startsWith("--") ? resolved[color] : undefined
  const ready = ink !== undefined

  const setup = React.useCallback(
    ({ size }: { size: { width: number; height: number } }) => {
      const total = Math.round((size.width * size.height * density) / 10000)

      const points: Point[] = []
      for (let index = 0; index < total; index += 1) {
        const angle = (index * 2.399) % (Math.PI * 2)
        points.push({
          x: Math.random() * size.width,
          y: Math.random() * size.height,
          vx: Math.cos(angle) * (6 + (index % 7)),
          vy: Math.sin(angle) * (6 + (index % 5)),
          r: 0.8 + ((index * 0.37) % 1.4),
        })
      }

      return { points, pointer: pointer.current } satisfies Field
    },
    [density]
  )

  const draw = React.useCallback(
    ({
      context,
      size,
      state,
      delta,
    }: {
      context: CanvasRenderingContext2D
      size: { width: number; height: number; dpr: number }
      state: Field
      delta: number
    }) => {
      if (!ink) return

      const { width, height, dpr } = size
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)

      const step = delta * speed
      const reach = pointerRadius * pointerRadius

      for (const point of state.points) {
        point.x += point.vx * step
        point.y += point.vy * step

        if (point.x < 0) point.x += width
        if (point.x > width) point.x -= width
        if (point.y < 0) point.y += height
        if (point.y > height) point.y -= height
      }

      context.lineWidth = 1

      for (let a = 0; a < state.points.length; a += 1) {
        const first = state.points[a]!

        for (let b = a + 1; b < state.points.length; b += 1) {
          const second = state.points[b]!
          const dx = first.x - second.x
          const dy = first.y - second.y
          const distance = Math.hypot(dx, dy)

          if (distance > linkDistance) continue

          context.strokeStyle = rgba(ink, 0.18 * (1 - distance / linkDistance))
          context.beginPath()
          context.moveTo(first.x, first.y)
          context.lineTo(second.x, second.y)
          context.stroke()
        }

        let glow = 0
        if (state.pointer.active && pointerRadius > 0) {
          const dx = first.x - state.pointer.x
          const dy = first.y - state.pointer.y
          const squared = dx * dx + dy * dy
          if (squared < reach) glow = 1 - squared / reach
        }

        context.fillStyle = rgba(ink, 0.45 + glow * 0.55)
        context.beginPath()
        context.arc(first.x, first.y, first.r + glow * 1.6, 0, Math.PI * 2)
        context.fill()
      }
    },
    [ink, linkDistance, pointerRadius, speed]
  )

  return (
    <div
      ref={rootRef}
      data-slot="constellation-field"
      className={cn("relative isolate overflow-hidden", className)}
      {...rootProps}
    >
      {ready && (
        <RenderSurface<Field, "2d">
          setup={setup}
          draw={draw}
          paused={paused}
          className={cn(
            "pointer-events-none absolute inset-0 -z-10",
            surfaceClassName
          )}
        />
      )}
      {children}
    </div>
  )
}
