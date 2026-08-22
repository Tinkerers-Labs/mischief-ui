"use client"

import * as React from "react"
import {
  RenderSurface,
  useThemeColors,
  type SurfaceColor,
} from "@/registry/default/render-surface/render-surface"
import { cn } from "@/lib/utils"

export type AuroraFieldProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Theme custom properties or plain CSS colours. Fewer entries than blobs is
   * the usual case: the rest are derived by rotating the hue of these.
   */
  colors?: readonly string[]
  blobs?: number
  speed?: number
  /** How much of the box each blob covers, as a fraction of its longest edge. */
  spread?: number
  opacity?: number
  paused?: boolean
  surfaceClassName?: string
}

const SPREAD_DEGREES = 44

type Blob = {
  color: SurfaceColor
  radius: number
  ax: number
  ay: number
  fx: number
  fy: number
  px: number
  py: number
}

function rotateHue([r, g, b]: SurfaceColor, degrees: number): SurfaceColor {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lightness = (max + min) / 2
  const range = max - min

  if (range === 0) return [r, g, b]

  const saturation =
    lightness > 0.5 ? range / (2 - max - min) : range / (max + min)

  let hue: number
  if (max === r) hue = (g - b) / range + (g < b ? 6 : 0)
  else if (max === g) hue = (b - r) / range + 2
  else hue = (r - g) / range + 4

  hue = (hue / 6 + degrees / 360 + 1) % 1

  const q =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation
  const p = 2 * lightness - q

  const channel = (offset: number) => {
    let value = hue + offset
    if (value < 0) value += 1
    if (value > 1) value -= 1
    if (value < 1 / 6) return p + (q - p) * 6 * value
    if (value < 1 / 2) return q
    if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6
    return p
  }

  return [channel(1 / 3), channel(0), channel(-1 / 3)]
}

function rgba([r, g, b]: SurfaceColor, alpha: number) {
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`
}

export function AuroraField({
  colors = ["--primary"],
  blobs = 5,
  speed = 1,
  spread = 0.55,
  opacity = 0.85,
  paused,
  className,
  surfaceClassName,
  children,
  ...rootProps
}: AuroraFieldProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const tokens = React.useMemo(
    () => colors.filter((entry) => entry.startsWith("--")),
    [colors]
  )

  const resolved = useThemeColors(rootRef, tokens)

  const palette = React.useMemo(() => {
    const base = colors.map((entry) =>
      entry.startsWith("--") ? resolved[entry] : undefined
    )

    return base.filter((entry): entry is SurfaceColor => entry !== undefined)
  }, [colors, resolved])

  const count = Math.max(1, Math.round(blobs))
  const ready = palette.length > 0

  const setup = React.useCallback(() => {
    const made: Blob[] = []

    for (let index = 0; index < count; index += 1) {
      const source = palette[index % palette.length] ?? ([0, 0, 0] as const)

      // Derived shades stay in a narrow band around the colour they came from.
      // Spread any wider and a single tomato token produces a rainbow, which is
      // the opposite of inheriting the theme.
      const offset =
        index < palette.length
          ? 0
          : (index / Math.max(count - 1, 1) - 0.5) * SPREAD_DEGREES

      made.push({
        color: offset === 0 ? source : rotateHue(source, offset),
        radius: spread * (0.7 + ((index * 0.37) % 0.6)),
        ax: 0.18 + ((index * 0.23) % 0.22),
        ay: 0.16 + ((index * 0.31) % 0.2),
        fx: 0.07 + index * 0.017,
        fy: 0.055 + index * 0.021,
        px: index * 1.7,
        py: index * 2.3,
      })
    }

    return made
  }, [count, palette, spread])

  const draw = React.useCallback(
    ({
      context,
      size,
      state,
      time,
    }: {
      context: CanvasRenderingContext2D
      size: { width: number; height: number; dpr: number }
      state: Blob[]
      time: number
    }) => {
      const { width, height, dpr } = size
      const longest = Math.max(width, height)

      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)

      for (const blob of state) {
        const t = time * speed
        const x =
          width * (0.5 + blob.ax * Math.sin(t * blob.fx * 6.28 + blob.px))
        const y =
          height * (0.5 + blob.ay * Math.cos(t * blob.fy * 6.28 + blob.py))
        const radius = longest * blob.radius

        const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
        gradient.addColorStop(0, rgba(blob.color, opacity))
        gradient.addColorStop(1, rgba(blob.color, 0))

        context.fillStyle = gradient
        context.fillRect(0, 0, width, height)
      }
    },
    [opacity, speed]
  )

  return (
    <div
      ref={rootRef}
      data-slot="aurora-field"
      className={cn(
        "bg-background relative isolate overflow-hidden",
        className
      )}
      {...rootProps}
    >
      {ready && (
        <RenderSurface<Blob[], "2d">
          setup={setup}
          draw={draw}
          paused={paused}
          maxDpr={1}
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 scale-125 blur-3xl",
            surfaceClassName
          )}
        />
      )}
      {children}
    </div>
  )
}
