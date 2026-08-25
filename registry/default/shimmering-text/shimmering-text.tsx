"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type ShimmeringTextProps = React.HTMLAttributes<HTMLSpanElement> & {
  children: React.ReactNode
  /** Seconds for one pass of the sweep. */
  duration?: number
  /** How wide the bright band is, as a fraction of the text. */
  extent?: number
  /** Stops the sweep and leaves the words as they are. */
  paused?: boolean
}

/**
 * Words with a light moving across them, for the wait between asking and the
 * first token. The text is ordinary text: the sweep is a background it is
 * clipped to, so it can be read, selected and announced whether or not the
 * animation runs.
 */
export function ShimmeringText({
  children,
  duration = 2.4,
  extent = 0.35,
  paused = false,
  className,
  style,
  ...rootProps
}: ShimmeringTextProps) {
  const band = Math.min(Math.max(extent, 0.05), 1)

  return (
    <span
      data-slot="shimmering-text"
      className={cn(
        "text-muted-foreground bg-clip-text",
        // The sweep is decoration. Without it the words keep their own colour,
        // which is why the fallback is a colour and not transparency.
        !paused &&
          "motion-safe:animate-[mischief-shimmering-text_var(--shimmer-duration)_linear_infinite] motion-safe:text-transparent",
        className
      )}
      style={
        {
          "--shimmer-duration": `${duration}s`,
          backgroundImage:
            "linear-gradient(90deg, transparent 0%, var(--foreground) 50%, transparent 100%)",
          backgroundSize: `${Math.round(band * 300)}% 100%`,
          backgroundRepeat: "no-repeat",
          ...style,
        } as React.CSSProperties
      }
      {...rootProps}
    >
      {children}
    </span>
  )
}
