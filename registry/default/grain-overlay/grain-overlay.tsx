"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type GrainOverlayProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Higher is finer. Around 0.65 reads as film, 0.2 as coarse paper. */
  frequency?: number
  opacity?: number
  blend?: "overlay" | "soft-light" | "multiply" | "screen" | "normal"
  /** Shifts the grain a few times a second the way projected film does. */
  animated?: boolean
}

function noiseUrl(frequency: number, seed: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="${frequency}" numOctaves="3" seed="${seed}" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="160" height="160" filter="url(#n)"/></svg>`

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

/**
 * A film grain layer for any positioned box. It sits above the content and
 * ignores the pointer, so it can be dropped into a card or a hero without
 * changing anything underneath it.
 */
export function GrainOverlay({
  frequency = 0.65,
  opacity = 0.22,
  blend = "overlay",
  animated = false,
  className,
  style,
  ...rootProps
}: GrainOverlayProps) {
  const frames = React.useMemo(
    () => [2, 7, 13, 23].map((seed) => noiseUrl(frequency, seed)),
    [frequency]
  )

  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    if (!animated) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % frames.length),
      120
    )

    return () => window.clearInterval(timer)
  }, [animated, frames.length])

  return (
    <div
      data-slot="grain-overlay"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 bg-repeat",
        className
      )}
      style={{
        backgroundImage: frames[index],
        mixBlendMode: blend,
        opacity,
        ...style,
      }}
      {...rootProps}
    />
  )
}
