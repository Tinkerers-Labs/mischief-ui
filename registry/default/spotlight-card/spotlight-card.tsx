"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type SpotlightCardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** A theme custom property or CSS colour for the light. */
  color?: string
  /** Radius of the light in pixels. */
  size?: number
  /** Lights every card in a group at once when they share a parent. */
  followGroup?: boolean
}

/**
 * A card whose border and surface catch a light that follows the pointer. The
 * light is written to custom properties on the element rather than to React
 * state, so moving across a grid of these does not re-render anything.
 */
export function SpotlightCard({
  color = "--primary",
  size = 320,
  followGroup = false,
  className,
  style,
  children,
  onPointerMove,
  onPointerLeave,
  ...rootProps
}: SpotlightCardProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const targets = followGroup
      ? Array.from(
          ref.current?.parentElement?.querySelectorAll<HTMLElement>(
            "[data-slot='spotlight-card']"
          ) ?? []
        )
      : [ref.current]

    for (const target of targets) {
      if (!target) continue
      const rect = target.getBoundingClientRect()
      target.style.setProperty(
        "--spotlight-x",
        `${event.clientX - rect.left}px`
      )
      target.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`)
      target.style.setProperty("--spotlight-on", "1")
    }

    onPointerMove?.(event)
  }

  const leave = (event: React.PointerEvent<HTMLDivElement>) => {
    ref.current?.style.setProperty("--spotlight-on", "0")
    onPointerLeave?.(event)
  }

  return (
    <div
      ref={ref}
      data-slot="spotlight-card"
      onPointerMove={move}
      onPointerLeave={leave}
      className={cn(
        "border-border bg-card text-card-foreground group relative isolate overflow-hidden rounded-[var(--radius)] border",
        "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:opacity-[var(--spotlight-on,0)] before:transition-opacity before:duration-300 before:content-[''] motion-reduce:before:transition-none",
        "before:bg-[radial-gradient(var(--spotlight-size)_circle_at_var(--spotlight-x,50%)_var(--spotlight-y,50%),var(--spotlight-color),transparent_70%)]",
        className
      )}
      style={
        {
          "--spotlight-size": `${size}px`,
          "--spotlight-color": color.startsWith("--")
            ? `color-mix(in oklch, var(${color}) 22%, transparent)`
            : color,
          ...style,
        } as React.CSSProperties
      }
      {...rootProps}
    >
      {children}
    </div>
  )
}
