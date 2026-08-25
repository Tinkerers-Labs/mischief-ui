"use client"

import * as React from "react"

import {
  RenderSurface,
  useThemeColors,
  type SurfaceColor,
} from "@/registry/default/render-surface/render-surface"
import { cn } from "@/lib/utils"

export type OrbState = "idle" | "listening" | "thinking" | "speaking"

export type OrbProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  state?: OrbState
  /** How loud it is right now, nought to one. Only read while listening or speaking. */
  level?: number
  /** A theme token, or any CSS colour. */
  color?: string
  size?: number
  /** Said aloud, since the orb itself is a drawing. */
  label?: string
}

type Ring = { phase: number; speed: number; weight: number }

const PACE: Record<OrbState, number> = {
  idle: 0.25,
  listening: 0.7,
  thinking: 1.5,
  speaking: 1.1,
}

/**
 * A sphere that says what an assistant is doing without saying it in words:
 * settled when idle, breathing while it listens, turning over while it thinks,
 * moving with the voice while it speaks.
 *
 * The drawing is decoration. What state it is in is also written down for a
 * screen reader, because a circle changing pace is not a sentence.
 */
export function Orb({
  state = "idle",
  level = 0,
  color = "--primary",
  size = 120,
  label,
  className,
  ...rootProps
}: OrbProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const tokens = React.useMemo(
    () => (color.startsWith("--") ? [color] : []),
    [color]
  )
  const resolved = useThemeColors(rootRef, tokens)
  const ink = color.startsWith("--") ? resolved[color] : undefined

  // Read in the frame loop rather than through props, so a level arriving at
  // the audio rate does not re-render the tree.
  const live = React.useRef({ state, level })
  React.useEffect(() => {
    live.current = { state, level }
  })

  const setup = React.useCallback(
    (): Ring[] =>
      Array.from({ length: 3 }, (_, index) => ({
        phase: index * 2.1,
        speed: 0.6 + index * 0.35,
        weight: 1 - index * 0.22,
      })),
    []
  )

  const draw = React.useCallback(
    ({
      context,
      size: box,
      state: rings,
      time,
    }: {
      context: CanvasRenderingContext2D
      size: { width: number; height: number; dpr: number }
      state: Ring[]
      time: number
    }) => {
      if (!ink) return

      context.setTransform(box.dpr, 0, 0, box.dpr, 0, 0)
      context.clearRect(0, 0, box.width, box.height)

      const { state: mode, level: loudness } = live.current
      const cx = box.width / 2
      const cy = box.height / 2
      // The glow has to finish inside the box. Reaching past the half width
      // leaves it cut off square at the edges instead of fading out.
      const half = Math.min(box.width, box.height) / 2
      const [r, g, b] = ink as SurfaceColor
      const rgb = `${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}`
      const t = time * PACE[mode]

      // Only the voice states follow the level; the others keep their own pace.
      const push =
        mode === "listening" || mode === "speaking"
          ? Math.min(Math.max(loudness, 0), 1) * 0.28
          : 0

      // Idle is the resting state, so it sits smaller and dimmer rather than
      // being the same orb moved slowly.
      const calm = mode === "idle" ? 0.78 : 1
      const breath = rings.reduce(
        (sum, ring) => sum + Math.sin(t * ring.speed + ring.phase) * 0.02,
        0
      )
      const radius = half * 0.46 * calm * (1 + breath + push)

      const halo = context.createRadialGradient(cx, cy, radius, cx, cy, half)
      halo.addColorStop(0, `rgba(${rgb}, ${0.26 * calm})`)
      halo.addColorStop(0.5, `rgba(${rgb}, ${0.08 * calm})`)
      halo.addColorStop(1, `rgba(${rgb}, 0)`)
      context.fillStyle = halo
      context.fillRect(0, 0, box.width, box.height)

      // Lit from above and to the left, which is what makes a filled circle
      // read as a sphere rather than a disc.
      const shade = (amount: number) =>
        `${Math.round(Math.min(255, r * 255 * amount))}, ${Math.round(
          Math.min(255, g * 255 * amount)
        )}, ${Math.round(Math.min(255, b * 255 * amount))}`

      const body = context.createRadialGradient(
        cx - radius * 0.34,
        cy - radius * 0.34,
        radius * 0.08,
        cx,
        cy,
        radius
      )
      body.addColorStop(0, `rgba(${shade(1.32)}, 1)`)
      body.addColorStop(0.45, `rgba(${rgb}, 1)`)
      body.addColorStop(0.88, `rgba(${shade(0.82)}, 1)`)
      // The last stop feathers the rim, so the edge is not a hard cut.
      body.addColorStop(1, `rgba(${shade(0.78)}, 0)`)

      context.fillStyle = body
      context.beginPath()
      context.arc(cx, cy, radius, 0, Math.PI * 2)
      context.fill()
    },
    [ink]
  )

  return (
    <div
      ref={rootRef}
      data-slot="orb"
      data-state={state}
      className={cn("relative isolate", className)}
      style={{ width: size, height: size }}
      {...rootProps}
    >
      {ink !== undefined && (
        <RenderSurface<Ring[], "2d">
          setup={setup}
          draw={draw}
          className="absolute inset-0"
        />
      )}
      <span aria-live="polite" className="sr-only">
        {label ?? state}
      </span>
    </div>
  )
}
