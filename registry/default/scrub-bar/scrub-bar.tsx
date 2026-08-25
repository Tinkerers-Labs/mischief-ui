"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type ScrubBarProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> & {
  /** Seconds. */
  duration: number
  value?: number
  defaultValue?: number
  onValueChange?: (seconds: number) => void
  /** Called once, when the drag ends. */
  onCommit?: (seconds: number) => void
  /** How far arrow keys move, in seconds. */
  step?: number
  /** Already downloaded, in seconds. Drawn behind the played part. */
  buffered?: number
  label?: string
  disabled?: boolean
}

function clock(seconds: number) {
  const whole = Math.max(0, Math.round(seconds))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`
}

/**
 * The seek control on its own: a slider that happens to be a timeline. It is a
 * real slider to the keyboard and to assistive technology, announced in
 * minutes and seconds rather than as a number between nought and one.
 */
export function ScrubBar({
  duration,
  value,
  defaultValue = 0,
  onValueChange,
  onCommit,
  step = 5,
  buffered,
  label = "Seek",
  disabled = false,
  className,
  ...rootProps
}: ScrubBarProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const at = Math.min(Math.max(value ?? uncontrolled, 0), duration)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const dragging = React.useRef(false)

  const set = (seconds: number, commit = false) => {
    const next = Math.min(Math.max(seconds, 0), duration)
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
    if (commit) onCommit?.(next)
  }

  const secondsAt = (clientX: number) => {
    const track = trackRef.current
    if (!track) return at

    const box = track.getBoundingClientRect()
    if (box.width === 0) return at

    return ((clientX - box.left) / box.width) * duration
  }

  const portion = duration > 0 ? at / duration : 0
  const ready =
    buffered === undefined ? undefined : Math.min(buffered, duration)

  return (
    <div
      data-slot="scrub-bar"
      className={cn("flex items-center gap-3", className)}
      {...rootProps}
    >
      <span className="text-muted-foreground shrink-0 font-mono text-xs tabular-nums">
        {clock(at)}
      </span>

      <div
        ref={trackRef}
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(at)}
        aria-valuetext={`${clock(at)} of ${clock(duration)}`}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        className="focus-visible:ring-ring group relative h-6 min-w-0 flex-1 cursor-pointer touch-none focus-visible:ring-2 focus-visible:outline-none"
        onPointerDown={(event) => {
          if (disabled) return
          dragging.current = true
          event.currentTarget.setPointerCapture(event.pointerId)
          set(secondsAt(event.clientX))
        }}
        onPointerMove={(event) => {
          if (!dragging.current) return
          set(secondsAt(event.clientX))
        }}
        onPointerUp={(event) => {
          if (!dragging.current) return
          dragging.current = false
          event.currentTarget.releasePointerCapture(event.pointerId)
          set(secondsAt(event.clientX), true)
        }}
        onKeyDown={(event) => {
          if (disabled) return
          const jump: Record<string, number> = {
            ArrowLeft: -step,
            ArrowRight: step,
            ArrowDown: -step,
            ArrowUp: step,
          }

          if (event.key in jump) {
            event.preventDefault()
            set(at + jump[event.key]!, true)
            return
          }
          if (event.key === "Home") {
            event.preventDefault()
            set(0, true)
          }
          if (event.key === "End") {
            event.preventDefault()
            set(duration, true)
          }
        }}
      >
        <div className="bg-muted absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full">
          {ready !== undefined ? (
            <div
              className="bg-muted-foreground/25 absolute inset-y-0 left-0"
              style={{ width: `${(ready / duration) * 100}%` }}
            />
          ) : null}
          <div
            className="bg-primary absolute inset-y-0 left-0"
            style={{ width: `${portion * 100}%` }}
          />
        </div>

        <span
          aria-hidden="true"
          className="bg-primary absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
          style={{ left: `${portion * 100}%` }}
        />
      </div>

      <span className="text-muted-foreground shrink-0 font-mono text-xs tabular-nums">
        {clock(duration)}
      </span>
    </div>
  )
}
