"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type NumberTickerProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "children"
> & {
  value: number
  /** Where it counts from the first time. Defaults to zero. */
  from?: number
  duration?: number
  /** Passed straight to Intl.NumberFormat, so currency and percent work. */
  format?: Intl.NumberFormatOptions
  locale?: string
  /** Waits until it is on screen before counting. */
  startOnView?: boolean
}

const ease = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Counts to a number rather than replacing it. The final value is what the
 * element is labelled with throughout, so nothing reads out a blur of
 * intermediate numbers.
 */
export function NumberTicker({
  value,
  from = 0,
  duration = 1400,
  format,
  locale,
  startOnView = true,
  className,
  ...rootProps
}: NumberTickerProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const previous = React.useRef(from)
  const [display, setDisplay] = React.useState(from)
  const [armed, setArmed] = React.useState(!startOnView)

  const formatter = React.useMemo(
    () => new Intl.NumberFormat(locale, format),
    [format, locale]
  )

  React.useEffect(() => {
    if (armed) return
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setArmed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [armed])

  React.useEffect(() => {
    if (!armed) return

    const start = previous.current
    previous.current = value

    if (
      start === value ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(value)
      return
    }

    let raf = 0
    let began = 0

    const step = (timestamp: number) => {
      if (began === 0) began = timestamp
      const t = Math.min(1, (timestamp - began) / Math.max(duration, 1))

      setDisplay(start + (value - start) * ease(t))
      if (t < 1) raf = window.requestAnimationFrame(step)
    }

    raf = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(raf)
  }, [armed, duration, value])

  return (
    <span
      ref={ref}
      data-slot="number-ticker"
      aria-label={formatter.format(value)}
      className={cn("tabular-nums", className)}
      {...rootProps}
    >
      <span aria-hidden="true">{formatter.format(display)}</span>
    </span>
  )
}
