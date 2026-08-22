"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type RevealDirection = "up" | "down" | "left" | "right" | "none"

export type RevealProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Which way the content travels in from. */
  from?: RevealDirection
  /** Pixels travelled. */
  distance?: number
  /** Milliseconds before it starts. Give a list an index times a step. */
  delay?: number
  duration?: number
  /** How much has to be on screen before it starts, from nought to one. */
  threshold?: number
  /** Plays again whenever it comes back. Off by default. */
  repeat?: boolean
}

const OFFSET: Record<RevealDirection, string> = {
  up: "0, var(--reveal-distance)",
  down: "0, calc(var(--reveal-distance) * -1)",
  left: "var(--reveal-distance), 0",
  right: "calc(var(--reveal-distance) * -1), 0",
  none: "0, 0",
}

/**
 * Moves its children in when they arrive on screen. The content is present and
 * readable from the first paint either way, so this changes how something
 * arrives and never whether it is there.
 */
export function Reveal({
  from = "up",
  distance = 16,
  delay = 0,
  duration = 600,
  threshold = 0.15,
  repeat = false,
  className,
  style,
  children,
  ...rootProps
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [shown, setShown] = React.useState(false)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true)
          if (!repeat) observer.disconnect()
        } else if (repeat) {
          setShown(false)
        }
      },
      { threshold }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [repeat, threshold])

  return (
    <div
      ref={ref}
      data-slot="reveal"
      data-shown={shown ? "" : undefined}
      className={cn(
        "translate-(--reveal-offset) opacity-0 transition-[opacity,translate] ease-out",
        "data-shown:translate-none data-shown:opacity-100",
        "motion-reduce:translate-none motion-reduce:opacity-100 motion-reduce:transition-none",
        className
      )}
      style={
        {
          "--reveal-distance": `${distance}px`,
          "--reveal-offset": OFFSET[from],
          transitionDelay: `${delay}ms`,
          transitionDuration: `${duration}ms`,
          ...style,
        } as React.CSSProperties
      }
      {...rootProps}
    >
      {children}
    </div>
  )
}
