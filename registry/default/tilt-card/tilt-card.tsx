"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type TiltCardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Furthest the card leans, in degrees. */
  maxTilt?: number
  /** How far the card comes toward the pointer, in pixels. */
  lift?: number
  /** Adds a sheen that moves against the lean. */
  glare?: boolean
  perspective?: number
}

/**
 * A card that leans toward the pointer as though it were a physical object on
 * the page. The lean is written to custom properties on the element, so a grid
 * of these renders nothing while the pointer crosses it.
 */
export function TiltCard({
  maxTilt = 9,
  lift = 6,
  glare = false,
  perspective = 900,
  className,
  style,
  children,
  onPointerMove,
  onPointerLeave,
  ...rootProps
}: TiltCardProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduced = React.useRef(false)

  React.useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  }, [])

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = ref.current
    if (element && !reduced.current) {
      const rect = element.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5

      element.style.setProperty(
        "--tilt-x",
        `${(-y * maxTilt * 2).toFixed(2)}deg`
      )
      element.style.setProperty(
        "--tilt-y",
        `${(x * maxTilt * 2).toFixed(2)}deg`
      )
      element.style.setProperty("--tilt-lift", `${lift}px`)
      element.style.setProperty("--tilt-glare-x", `${(x + 0.5) * 100}%`)
      element.style.setProperty("--tilt-glare-y", `${(y + 0.5) * 100}%`)
      element.style.setProperty("--tilt-glare-on", "1")
    }

    onPointerMove?.(event)
  }

  const leave = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = ref.current
    if (element) {
      element.style.setProperty("--tilt-x", "0deg")
      element.style.setProperty("--tilt-y", "0deg")
      element.style.setProperty("--tilt-lift", "0px")
      element.style.setProperty("--tilt-glare-on", "0")
    }

    onPointerLeave?.(event)
  }

  return (
    <div
      style={{ perspective: `${perspective}px` }}
      className="[transform-style:preserve-3d]"
    >
      <div
        ref={ref}
        data-slot="tilt-card"
        onPointerMove={move}
        onPointerLeave={leave}
        className={cn(
          "border-border bg-card text-card-foreground relative isolate overflow-hidden rounded-[var(--radius)] border",
          "transition-transform duration-200 ease-out will-change-transform motion-reduce:transition-none",
          "[transform:perspective(var(--tilt-perspective))_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))_translateZ(var(--tilt-lift,0px))]",
          "motion-reduce:[transform:none]",
          glare &&
            "after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(50%_50%_at_var(--tilt-glare-x,50%)_var(--tilt-glare-y,50%),color-mix(in_oklch,var(--foreground)_14%,transparent),transparent)] after:opacity-[var(--tilt-glare-on,0)] after:transition-opacity after:duration-200 after:content-['']",
          className
        )}
        style={
          {
            "--tilt-perspective": `${perspective}px`,
            ...style,
          } as React.CSSProperties
        }
        {...rootProps}
      >
        {children}
      </div>
    </div>
  )
}
