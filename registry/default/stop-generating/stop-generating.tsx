"use client"

import * as React from "react"
import { Square } from "lucide-react"

import { cn } from "@/lib/utils"

export type StopGeneratingProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick"
> & {
  onStop: () => void
  /** Renders nothing while false. Defaults to true. */
  running?: boolean
  label?: string
  /** Epoch milliseconds. Drives the live elapsed reading. */
  startedAt?: number
  showElapsed?: boolean
  /** Stop on Escape as well as on click. Defaults to true. */
  shortcut?: boolean
}

function useElapsed(startedAt: number | undefined, running: boolean) {
  const [clock, setClock] = React.useState({ startedAt, now: startedAt ?? 0 })

  // A new run resets the reading in the same render that introduced it, so the
  // old run's elapsed time is never shown against the new one's start.
  if (clock.startedAt !== startedAt) {
    setClock({ startedAt, now: startedAt ?? 0 })
  }

  React.useEffect(() => {
    if (startedAt === undefined || !running) return

    const timer = setInterval(
      () => setClock({ startedAt, now: Date.now() }),
      100
    )

    return () => clearInterval(timer)
  }, [startedAt, running])

  if (startedAt === undefined) return undefined

  return Math.max(0, clock.now - startedAt)
}

export function StopGenerating({
  onStop,
  running = true,
  label = "Stop generating",
  startedAt,
  showElapsed = true,
  shortcut = true,
  className,
  ...buttonProps
}: StopGeneratingProps) {
  const elapsed = useElapsed(startedAt, running)

  const stop = React.useRef(onStop)

  React.useEffect(() => {
    stop.current = onStop
  }, [onStop])

  React.useEffect(() => {
    if (!shortcut || !running) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") stop.current()
    }

    window.addEventListener("keydown", onKeyDown)

    return () => window.removeEventListener("keydown", onKeyDown)
  }, [shortcut, running])

  if (!running) return null

  return (
    <button
      type="button"
      data-slot="stop-generating"
      className={cn(
        "border-border text-muted-foreground hover:text-foreground hover:bg-muted inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs transition-colors duration-150 motion-reduce:transition-none",
        className
      )}
      onClick={() => onStop()}
      {...buttonProps}
    >
      <Square aria-hidden="true" size={11} className="fill-current" />
      {label}
      {showElapsed && elapsed !== undefined ? (
        <span className="text-muted-foreground/70 tabular-nums">
          {(elapsed / 1000).toFixed(1)}s
        </span>
      ) : null}
    </button>
  )
}
