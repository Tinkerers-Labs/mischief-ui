"use client"

import * as React from "react"
import {
  RenderSurface,
  useThemeColors,
  type SurfaceColor,
} from "@/registry/default/render-surface/render-surface"
import { cn } from "@/lib/utils"

export type BurstOptions = {
  /** Where the burst starts, in pixels from the top left of the box. */
  x?: number
  y?: number
  count?: number
}

export type BurstHandle = {
  fire: (options?: BurstOptions) => void
}

export type BurstProps = React.HTMLAttributes<HTMLDivElement> & {
  colors?: readonly string[]
  count?: number
  /** Pixels per second the pieces leave at. */
  velocity?: number
  gravity?: number
  /** Announced once when a burst is fired. Leave empty for pure decoration. */
  announce?: string
}

type Piece = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  spin: number
  angle: number
  size: number
  color: SurfaceColor
}

const DEFAULT_COLORS = ["--primary", "--foreground"] as const

/**
 * A short burst of pieces for the moment something completes. It covers its
 * nearest positioned ancestor, draws nothing until fired, and stops its loop
 * once the last piece has fallen out of the box.
 */
export const Burst = React.forwardRef<BurstHandle, BurstProps>(function Burst(
  {
    colors = DEFAULT_COLORS,
    count = 60,
    velocity = 420,
    gravity = 900,
    announce,
    className,
    ...rootProps
  },
  forwardedRef
) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const pieces = React.useRef<Piece[]>([])
  const [alive, setAlive] = React.useState(false)
  const [message, setMessage] = React.useState("")

  const tokens = React.useMemo(
    () => colors.filter((entry) => entry.startsWith("--")),
    [colors]
  )

  const resolved = useThemeColors(rootRef, tokens)

  const palette = React.useMemo(
    () =>
      colors
        .map((entry) => (entry.startsWith("--") ? resolved[entry] : undefined))
        .filter((entry): entry is SurfaceColor => entry !== undefined),
    [colors, resolved]
  )

  const paletteRef = React.useRef(palette)
  React.useEffect(() => {
    paletteRef.current = palette
  })

  React.useImperativeHandle(
    forwardedRef,
    () => ({
      fire: (options) => {
        const element = rootRef.current
        if (!element) return

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          if (announce) setMessage(announce)
          return
        }

        const rect = element.getBoundingClientRect()
        const shades = paletteRef.current
        if (shades.length === 0) return

        const originX = options?.x ?? rect.width / 2
        const originY = options?.y ?? rect.height / 2
        const total = options?.count ?? count

        for (let index = 0; index < total; index += 1) {
          const angle = Math.random() * Math.PI * 2
          const power = velocity * (0.45 + Math.random() * 0.55)

          pieces.current.push({
            x: originX,
            y: originY,
            vx: Math.cos(angle) * power,
            vy: Math.sin(angle) * power - velocity * 0.35,
            life: 0.9 + Math.random() * 0.8,
            spin: (Math.random() - 0.5) * 14,
            angle: Math.random() * Math.PI,
            size: 4 + Math.random() * 5,
            color: shades[index % shades.length]!,
          })
        }

        if (announce) setMessage(announce)
        setAlive(true)
      },
    }),
    [announce, count, velocity]
  )

  const setup = React.useCallback(() => pieces, [])

  const draw = React.useCallback(
    ({
      context,
      size,
      delta,
    }: {
      context: CanvasRenderingContext2D
      size: { width: number; height: number; dpr: number }
      delta: number
    }) => {
      const { width, height, dpr } = size
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)

      const living: Piece[] = []

      for (const piece of pieces.current) {
        piece.life -= delta
        if (piece.life <= 0) continue

        piece.vy += gravity * delta
        piece.vx *= 1 - 1.2 * delta
        piece.x += piece.vx * delta
        piece.y += piece.vy * delta
        piece.angle += piece.spin * delta

        if (piece.y - piece.size > height) continue
        living.push(piece)

        const [r, g, b] = piece.color
        context.save()
        context.translate(piece.x, piece.y)
        context.rotate(piece.angle)
        context.globalAlpha = Math.min(1, piece.life * 1.6)
        context.fillStyle = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
        context.fillRect(
          -piece.size / 2,
          -piece.size / 4,
          piece.size,
          piece.size / 2
        )
        context.restore()
      }

      pieces.current = living
      if (living.length === 0) setAlive(false)
    },
    [gravity]
  )

  return (
    <div
      ref={rootRef}
      data-slot="burst"
      className={cn("pointer-events-none absolute inset-0 z-50", className)}
      {...rootProps}
    >
      <RenderSurface<React.RefObject<Piece[]>, "2d">
        setup={setup}
        draw={draw}
        paused={!alive}
        className="absolute inset-0"
      />
      <span className="sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </div>
  )
})
