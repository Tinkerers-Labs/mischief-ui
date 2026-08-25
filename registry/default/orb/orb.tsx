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
      const base = Math.min(box.width, box.height) * 0.34
      const [r, g, b] = ink as SurfaceColor
      const rgb = `${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}`
      const t = time * PACE[mode]

      // Only the voice states follow the level; the others keep their own pace.
      const push =
        mode === "listening" || mode === "speaking"
          ? Math.min(Math.max(loudness, 0), 1) * 0.28
          : 0

      const halo = context.createRadialGradient(
        cx,
        cy,
        base * 0.2,
        cx,
        cy,
        base * 1.9
      )
      halo.addColorStop(0, `rgba(${rgb}, 0.28)`)
      halo.addColorStop(1, `rgba(${rgb}, 0)`)
      context.fillStyle = halo
      context.fillRect(0, 0, box.width, box.height)

      for (const ring of rings) {
        const wobble = Math.sin(t * ring.speed + ring.phase) * 0.06
        const radius = base * (1 + wobble + push) * ring.weight

        context.beginPath()
        context.arc(cx, cy, Math.max(radius, 1), 0, Math.PI * 2)
        context.fillStyle = `rgba(${rgb}, ${0.16 * ring.weight + push * 0.3})`
        context.fill()
      }

      context.beginPath()
      context.arc(cx, cy, base * (0.52 + push * 0.5), 0, Math.PI * 2)
      context.fillStyle = `rgba(${rgb}, 0.9)`
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
