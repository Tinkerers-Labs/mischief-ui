"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ScrollRange = "cover" | "contain" | "enter" | "exit"

export type ScrollSceneProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onProgress"
> & {
  /**
   * Which span of scrolling maps to nought through one. Cover runs from the
   * moment the element appears to the moment it has gone.
   */
  range?: ScrollRange
  /**
   * Called on every frame the element is on screen. This is deliberately not
   * React state: a scene reading it redraws itself, and the page does not.
   */
  onProgress?: (progress: number) => void
  /** Pins the children to the viewport while the scene scrolls past them. */
  sticky?: boolean
  contentClassName?: string
}

function progressFor(
  range: ScrollRange,
  rect: DOMRect,
  viewport: number
): number {
  switch (range) {
    case "enter":
      return (viewport - rect.top) / Math.max(rect.height, 1)
    case "exit":
      return -rect.top / Math.max(rect.height, 1)
    case "contain": {
      const span = Math.abs(viewport - rect.height)
      return span === 0
        ? 0
        : (viewport - rect.top - Math.min(rect.height, viewport)) / span
    }
    default:
      return (viewport - rect.top) / Math.max(viewport + rect.height, 1)
  }
}

/**
 * Turns the scrolling of a tall element into a number between nought and one,
 * published as the `--scroll-progress` custom property and to a callback. A
 * CSS effect can read the property and a canvas can read the callback, and
 * neither of them causes a render.
 */
export function ScrollScene({
  range = "cover",
  onProgress,
  sticky = false,
  className,
  contentClassName,
  children,
  ...rootProps
}: ScrollSceneProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const report = React.useRef(onProgress)

  React.useEffect(() => {
    report.current = onProgress
  })

  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    let raf = 0
    let visible = false
    let last = -1

    const measure = () => {
      const rect = element.getBoundingClientRect()
      const progress = Math.min(
        1,
        Math.max(0, progressFor(range, rect, window.innerHeight))
      )

      if (progress !== last) {
        last = progress
        element.style.setProperty("--scroll-progress", progress.toFixed(4))
        element.dataset.scroll =
          progress <= 0 ? "before" : progress >= 1 ? "after" : "active"
        report.current?.(progress)
      }
    }

    const loop = () => {
      measure()
      raf = window.requestAnimationFrame(loop)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const next = entry?.isIntersecting ?? false
        if (next === visible) return
        visible = next

        if (visible) {
          if (raf === 0) raf = window.requestAnimationFrame(loop)
        } else {
          if (raf !== 0) window.cancelAnimationFrame(raf)
          raf = 0
          // One last reading, so a scene left behind holds an end value
          // rather than whatever it had when it went out of view.
          measure()
        }
      },
      { rootMargin: "64px" }
    )

    observer.observe(element)
    measure()

    return () => {
      observer.disconnect()
      if (raf !== 0) window.cancelAnimationFrame(raf)
    }
  }, [range])

  return (
    <div
      ref={ref}
      data-slot="scroll-scene"
      className={cn("relative", className)}
      {...rootProps}
    >
      <div
        className={cn(
          sticky && "sticky top-0 h-screen overflow-hidden",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}
