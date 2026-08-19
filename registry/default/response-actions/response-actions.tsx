"use client"

import * as React from "react"
import { Check, Clipboard, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react"

import { cn } from "@/lib/utils"

export type ResponseFeedback = "up" | "down" | null

export type ResponseActionsProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Copies this text. The copy control is absent without it. */
  copyText?: string
  onRetry?: () => void
  retryLabel?: string
  /** Turns the rating controls on. Omit to leave them out. */
  onFeedbackChange?: (feedback: ResponseFeedback) => void
  feedback?: ResponseFeedback
  defaultFeedback?: ResponseFeedback
  label?: string
}

export function ResponseActions({
  copyText,
  onRetry,
  retryLabel = "Try again",
  onFeedbackChange,
  feedback,
  defaultFeedback = null,
  label = "Response actions",
  children,
  className,
  ...rootProps
}: ResponseActionsProps) {
  const [copyState, setCopyState] = React.useState<"idle" | "copied" | "error">(
    "idle"
  )
  const [ownFeedback, setOwnFeedback] =
    React.useState<ResponseFeedback>(defaultFeedback)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const controlled = feedback !== undefined
  const current = controlled ? feedback : ownFeedback
  const rateable = onFeedbackChange !== undefined || controlled

  async function copy() {
    if (copyText === undefined) return
    try {
      await navigator.clipboard.writeText(copyText)
      setCopyState("copied")
    } catch {
      // Denied permission, an insecure context, or a sandboxed frame.
      setCopyState("error")
    }
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopyState("idle"), 1400)
  }

  function rate(next: Exclude<ResponseFeedback, null>) {
    const value = current === next ? null : next
    if (!controlled) setOwnFeedback(value)
    onFeedbackChange?.(value)
  }

  const button =
    "text-muted-foreground hover:bg-muted hover:text-foreground aria-pressed:text-foreground inline-flex size-8 items-center justify-center rounded-md transition-colors duration-150 motion-reduce:transition-none"

  return (
    <div
      data-slot="response-actions"
      role="group"
      aria-label={label}
      className={cn("flex items-center gap-0.5", className)}
      {...rootProps}
    >
      {copyText !== undefined ? (
        <button
          type="button"
          data-slot="response-actions-copy"
          aria-label={copyState === "copied" ? "Copied" : "Copy response"}
          className={button}
          onClick={copy}
        >
          {copyState === "copied" ? (
            <Check aria-hidden="true" size={14} />
          ) : (
            <Clipboard aria-hidden="true" size={14} />
          )}
        </button>
      ) : null}

      {onRetry ? (
        <button
          type="button"
          aria-label={retryLabel}
          className={button}
          onClick={onRetry}
        >
          <RotateCcw aria-hidden="true" size={14} />
        </button>
      ) : null}

      {rateable ? (
        <>
          <button
            type="button"
            aria-label="Good response"
            aria-pressed={current === "up"}
            className={cn(button, current === "up" && "bg-muted")}
            onClick={() => rate("up")}
          >
            <ThumbsUp aria-hidden="true" size={14} />
          </button>
          <button
            type="button"
            aria-label="Bad response"
            aria-pressed={current === "down"}
            className={cn(button, current === "down" && "bg-muted")}
            onClick={() => rate("down")}
          >
            <ThumbsDown aria-hidden="true" size={14} />
          </button>
        </>
      ) : null}

      {children}

      <span aria-live="polite" className="sr-only">
        {copyState === "copied"
          ? "Response copied to clipboard."
          : copyState === "error"
            ? "Response could not be copied."
            : ""}
      </span>
    </div>
  )
}
