"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type StreamGlowProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Whether anything is arriving. */
  active?: boolean
  /** Nought to one. Faster arrival breathes faster and reaches further. */
  rate?: number
  color?: string
  /** Thickness of the glow in pixels. */
  spread?: number
}

/**
 * An edge that breathes along a region while tokens land in it. It says only
 * that something is arriving, so it belongs beside a stop control and a
 * written status rather than in place of either.
 */
export function StreamGlow({
  active = false,
  rate = 0.5,
  color = "--primary",
  spread = 22,
  className,
  style,
  children,
  ...rootProps
}: StreamGlowProps) {
  const level = Math.min(1, Math.max(0, rate))

  return (
    <div
      data-slot="stream-glow"
      data-active={active ? "" : undefined}
      className={cn("relative isolate", className)}
      style={
        {
          "--glow-color": color.startsWith("--") ? `var(${color})` : color,
          "--glow-spread": `${spread}px`,
          "--glow-duration": `${(2.4 - level * 1.6).toFixed(2)}s`,
          "--glow-peak": (0.35 + level * 0.45).toFixed(2),
          ...style,
        } as React.CSSProperties
      }
      {...rootProps}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500",
          "shadow-[inset_0_0_var(--glow-spread)_color-mix(in_oklch,var(--glow-color)_70%,transparent)]",
          "data-active:animate-pulse data-active:opacity-[var(--glow-peak)]",
          "motion-reduce:animate-none"
        )}
        data-active={active ? "" : undefined}
        style={{ animationDuration: "var(--glow-duration)" }}
      />
      {children}
    </div>
  )
}
