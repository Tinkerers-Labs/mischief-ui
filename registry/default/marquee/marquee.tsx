"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type MarqueeProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Which way the content travels. */
  direction?: "left" | "right" | "up" | "down"
  /** Seconds for one full pass. Longer content wants longer. */
  duration?: number
  /** Pixels between the items, and between one repeat and the next. */
  gap?: number
  /** Holds still while the pointer is over it. */
  pauseOnHover?: boolean
  /** How many times the children repeat. Two is enough to hide the seam. */
  copies?: number
  /** Softens both ends, so items arrive and leave rather than pop. */
  fade?: boolean
}

/**
 * A row that runs on its own. The children are repeated so the loop has no
 * visible seam, and every repeat after the first is hidden from assistive
 * technology rather than read out again.
 *
 * With reduced motion it stops being a marquee: the repeats go, the animation
 * goes, and what is left scrolls, so the content is all still reachable rather
 * than being moved past somebody who asked for none of it.
 */
export function Marquee({
  direction = "left",
  duration = 20,
  gap = 16,
  pauseOnHover = false,
  copies = 2,
  fade = false,
  className,
  style,
  children,
  ...rootProps
}: MarqueeProps) {
  const vertical = direction === "up" || direction === "down"
  const reversed = direction === "right" || direction === "down"

  // Two copies is the least that can hide the seam; one would tear.
  const repeats = Math.max(2, Math.trunc(copies))

  // Each copy carries its own trailing gap, so every copy occupies exactly the
  // same length. That is what makes one copy's worth of travel seamless.
  const shift = `-${100 / repeats}%`
  const edge = vertical ? "to bottom" : "to right"

  return (
    <div
      data-slot="marquee"
      data-direction={direction}
      className={cn(
        "group/marquee relative flex overflow-hidden",
        vertical
          ? "flex-col motion-reduce:overflow-y-auto"
          : "flex-row motion-reduce:overflow-x-auto",
        className
      )}
      style={{
        ...(fade
          ? {
              maskImage: `linear-gradient(${edge}, transparent, black 8%, black 92%, transparent)`,
            }
          : null),
        ...style,
      }}
      {...rootProps}
    >
      <div
        className={cn(
          "flex shrink-0",
          vertical ? "h-max flex-col" : "w-max flex-row",
          vertical
            ? "motion-safe:animate-[mischief-marquee-y_var(--marquee-duration)_linear_infinite]"
            : "motion-safe:animate-[mischief-marquee-x_var(--marquee-duration)_linear_infinite]",
          reversed && "[animation-direction:reverse]",
          pauseOnHover && "group-hover/marquee:[animation-play-state:paused]"
        )}
        style={
          {
            "--marquee-duration": `${duration}s`,
            "--marquee-shift": shift,
          } as React.CSSProperties
        }
      >
        {Array.from({ length: repeats }, (_, copy) => (
          <div
            key={copy}
            // The first copy is the content. The rest exist to hide the seam,
            // and are not content a screen reader should meet again.
            aria-hidden={copy > 0 ? "true" : undefined}
            className={cn(
              "flex shrink-0 items-center",
              vertical ? "flex-col" : "flex-row",
              copy > 0 && "motion-reduce:hidden"
            )}
            style={{
              gap: `${gap}px`,
              ...(vertical
                ? { paddingBottom: `${gap}px` }
                : { paddingInlineEnd: `${gap}px` }),
            }}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  )
}
