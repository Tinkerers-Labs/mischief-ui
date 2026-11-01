"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type UndoButtonState = "idle" | "pending"

export interface UndoButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  /** Runs at once, so the host can show the action as done. */
  onAction?: () => void
  /** Runs once the grace window ends without an undo. */
  onCommit: () => void
  /** Runs when the person takes the action back. */
  onUndo?: () => void
  /** The grace window in milliseconds. */
  duration?: number
  /** The label before the action is taken. */
  children?: React.ReactNode
  undoLabel?: string
  /** Says what just happened, as in "Deleted". */
  message?: string
  undoneMessage?: string
}

export const UndoButton = React.forwardRef<HTMLButtonElement, UndoButtonProps>(
  function UndoButton(
    {
      children = "Delete",
      className,
      disabled,
      duration = 5000,
      message = "Deleted",
      onBlur,
      onClick,
      onCommit,
      onAction,
      onFocus,
      onPointerDown,
      onPointerEnter,
      onPointerLeave,
      onUndo,
      type = "button",
      undoLabel = "Undo",
      undoneMessage = "Undone",
      ...buttonProps
    },
    forwardedRef
  ) {
    const grace = Math.max(duration, 1000)
    const [pending, setPending] = React.useState(false)
    const [remaining, setRemaining] = React.useState(grace)
    const [hovered, setHovered] = React.useState(false)
    const [focused, setFocused] = React.useState(false)
    const [announcement, setAnnouncement] = React.useState("")

    const remainingRef = React.useRef(grace)
    const pendingRef = React.useRef(false)
    const pointerRef = React.useRef(false)
    const onCommitRef = React.useRef(onCommit)

    React.useEffect(() => {
      onCommitRef.current = onCommit
    }, [onCommit])

    const paused = pending && (hovered || focused)

    const commit = React.useCallback(() => {
      if (!pendingRef.current) return
      pendingRef.current = false
      setPending(false)
      setAnnouncement("")
      onCommitRef.current()
    }, [])

    React.useEffect(() => {
      if (!pending || paused) return

      const deadline = performance.now() + remainingRef.current
      let frame = requestAnimationFrame(function tick(now) {
        const left = Math.max(deadline - now, 0)
        remainingRef.current = left
        setRemaining(left)
        if (left === 0) {
          commit()
          return
        }
        frame = requestAnimationFrame(tick)
      })

      return () => {
        cancelAnimationFrame(frame)
        remainingRef.current = Math.max(deadline - performance.now(), 0)
      }
    }, [commit, paused, pending])

    // Leaving the page or the list does not take the action back: the person
    // was told it happened, so it happens.
    React.useEffect(() => () => commit(), [commit])

    const seconds = Math.ceil(remaining / 1000)

    return (
      <>
        <button
          {...buttonProps}
          ref={forwardedRef}
          type={type}
          disabled={disabled}
          data-slot="undo-button"
          data-state={pending ? "pending" : "idle"}
          data-paused={paused || undefined}
          onClick={(event) => {
            onClick?.(event)
            if (event.defaultPrevented) return

            if (pendingRef.current) {
              pendingRef.current = false
              setPending(false)
              setAnnouncement(undoneMessage)
              onUndo?.()
              return
            }

            remainingRef.current = grace
            pendingRef.current = true
            setRemaining(grace)
            setPending(true)
            onAction?.()
            setAnnouncement(
              `${message}. ${undoLabel} available for ${Math.ceil(grace / 1000)} seconds`
            )
          }}
          onPointerDown={(event) => {
            onPointerDown?.(event)
            pointerRef.current = true
          }}
          onFocus={(event) => {
            onFocus?.(event)
            // Focus that follows a click is a side effect of the pointer, not
            // someone reading the button, so it must not hold the clock.
            setFocused(!pointerRef.current)
            pointerRef.current = false
          }}
          onBlur={(event) => {
            onBlur?.(event)
            setFocused(false)
          }}
          onPointerEnter={(event) => {
            onPointerEnter?.(event)
            if (event.pointerType === "mouse") setHovered(true)
          }}
          onPointerLeave={(event) => {
            onPointerLeave?.(event)
            setHovered(false)
          }}
          className={cn(
            "border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring/50 relative isolate inline-flex min-h-10 min-w-28 items-center justify-center gap-2 overflow-hidden rounded-[var(--radius)] border px-4 text-sm font-medium transition-colors duration-150 outline-none select-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none",
            className
          )}
        >
          {pending ? (
            <>
              <span
                aria-hidden="true"
                className="bg-foreground/10 absolute inset-y-0 left-0 -z-10 w-full origin-left motion-reduce:hidden"
                style={{ transform: `scaleX(${remaining / grace})` }}
              />
              <span>{undoLabel}</span>
              <span
                aria-hidden="true"
                className="text-muted-foreground min-w-[2ch] text-xs tabular-nums"
              >
                {seconds}s
              </span>
            </>
          ) : (
            children
          )}
        </button>
        <span aria-live="polite" className="sr-only">
          {announcement}
        </span>
      </>
    )
  }
)
