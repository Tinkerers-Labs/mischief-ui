"use client"

import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type HoldState = "idle" | "holding" | "complete"

export interface HoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onComplete: () => void
  duration?: number
  completeLabel?: React.ReactNode
}

export const HoldButton = React.forwardRef<HTMLButtonElement, HoldButtonProps>(
  function HoldButton(
    {
      children = "Hold to confirm",
      completeLabel = "Done",
      onComplete,
      duration = 900,
      disabled,
      className,
      onClick,
      onLostPointerCapture,
      onPointerCancel,
      onPointerDown,
      onPointerUp,
      type = "button",
      ...props
    },
    forwardedRef
  ) {
    const [progress, setProgress] = React.useState(0)
    const [state, setState] = React.useState<HoldState>("idle")
    const stateRef = React.useRef<HoldState>("idle")
    const frameRef = React.useRef<number | null>(null)
    const resetTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
      null
    )
    const onCompleteRef = React.useRef(onComplete)

    React.useEffect(() => {
      onCompleteRef.current = onComplete
    }, [onComplete])

    const clearFrame = React.useCallback(() => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }, [])

    const finish = React.useCallback(() => {
      clearFrame()
      stateRef.current = "complete"
      setState("complete")
      setProgress(1)
      onCompleteRef.current()

      resetTimerRef.current = setTimeout(() => {
        stateRef.current = "idle"
        setState("idle")
        setProgress(0)
      }, 1200)
    }, [clearFrame])

    const cancel = React.useCallback(() => {
      if (stateRef.current !== "holding") return
      clearFrame()
      stateRef.current = "idle"
      setState("idle")
      setProgress(0)
    }, [clearFrame])

    const begin = React.useCallback(() => {
      if (disabled || stateRef.current !== "idle") return

      const safeDuration = Math.max(duration, 500)
      const startedAt = performance.now()
      stateRef.current = "holding"
      setState("holding")

      const tick = (now: number) => {
        const nextProgress = Math.min((now - startedAt) / safeDuration, 1)
        setProgress(nextProgress)

        if (nextProgress >= 1) {
          finish()
          return
        }

        frameRef.current = requestAnimationFrame(tick)
      }

      frameRef.current = requestAnimationFrame(tick)
    }, [disabled, duration, finish])

    React.useEffect(() => {
      return () => {
        clearFrame()
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
      }
    }, [clearFrame])

    return (
      <button
        {...props}
        data-slot="hold-button"
        data-state={state}
        ref={forwardedRef}
        type={type}
        disabled={disabled}
        onPointerDown={(event) => {
          onPointerDown?.(event)
          if (event.defaultPrevented) return
          if (event.button !== 0) return
          event.currentTarget.setPointerCapture(event.pointerId)
          begin()
        }}
        onPointerUp={(event) => {
          onPointerUp?.(event)
          if (!event.defaultPrevented) cancel()
        }}
        onPointerCancel={(event) => {
          onPointerCancel?.(event)
          if (!event.defaultPrevented) cancel()
        }}
        onLostPointerCapture={(event) => {
          onLostPointerCapture?.(event)
          if (!event.defaultPrevented) cancel()
        }}
        onClick={(event) => {
          onClick?.(event)
          if (event.defaultPrevented) return
          if (event.detail === 0 && stateRef.current === "idle") finish()
        }}
        className={cn(
          "border-destructive/30 bg-destructive text-destructive-foreground focus-visible:ring-ring/35 relative isolate inline-flex min-h-11 min-w-44 cursor-default items-center justify-center overflow-hidden rounded-[var(--radius)] border px-5 py-2.5 text-sm font-semibold shadow-sm outline-none select-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50 data-[state=holding]:scale-[0.98] motion-safe:transition-transform motion-safe:duration-150",
          className
        )}
      >
        <span
          aria-hidden="true"
          className="bg-foreground/25 absolute inset-0 -z-10 origin-left"
          style={{ transform: `scaleX(${progress})` }}
        />
        <span>{state === "complete" ? completeLabel : children}</span>
        <span className="sr-only" aria-live="polite">
          {state === "holding"
            ? `Confirmation ${Math.round(progress * 100)} percent complete`
            : state === "complete"
              ? "Action complete"
              : ""}
        </span>
      </button>
    )
  }
)
