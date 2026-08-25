"use client"

import * as React from "react"
import { CircleAlert, Hand, RotateCw, Timer } from "lucide-react"

import { cn } from "@/lib/utils"

export type StoppedReason = "stopped" | "error" | "limit" | "timeout"

export type StoppedRunProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  reason?: StoppedReason
  /** What arrived before it ended. Kept, not thrown away. */
  children?: React.ReactNode
  /** Replaces the default sentence for the reason. */
  message?: string
  /** Seconds it ran for. */
  elapsed?: number
  onRetry?: () => void
  onResume?: () => void
  retryLabel?: string
  resumeLabel?: string
}

const wording: Record<StoppedReason, string> = {
  stopped: "You stopped this answer.",
  error: "The answer stopped because something went wrong.",
  limit: "The answer reached its length limit.",
  timeout: "The answer took too long and was cut off.",
}

const marks: Record<StoppedReason, React.ComponentType<{ size?: number }>> = {
  stopped: Hand,
  error: CircleAlert,
  limit: CircleAlert,
  timeout: Timer,
}

function formatSeconds(seconds: number) {
  return seconds < 60
    ? `${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)}s`
    : `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`
}

/**
 * What the thread says after an answer ended early, with whatever it had
 * already written kept above the line.
 *
 * The partial text is marked as incomplete rather than left to be read as an
 * answer, because half a sentence delivered in the same voice as a finished
 * one is the failure this component exists to prevent.
 */
export function StoppedRun({
  reason = "stopped",
  children,
  message,
  elapsed,
  onRetry,
  onResume,
  retryLabel = "Try again",
  resumeLabel = "Carry on",
  className,
  ...rootProps
}: StoppedRunProps) {
  const Mark = marks[reason]
  const said = message ?? wording[reason]

  return (
    <div
      data-slot="stopped-run"
      data-reason={reason}
      className={cn("w-full", className)}
      {...rootProps}
    >
      {children ? (
        <div
          data-slot="stopped-run-partial"
          role="group"
          aria-label="Incomplete answer"
          className="text-foreground [mask-image:linear-gradient(to_bottom,black_60%,color-mix(in_oklab,black_45%,transparent))] text-sm"
        >
          {children}
        </div>
      ) : null}

      <div
        className={cn(
          "border-border text-muted-foreground mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-2 text-xs",
          reason === "error" && "text-destructive"
        )}
      >
        <Mark aria-hidden="true" size={14} />
        <span className="min-w-0">
          {said}
          {elapsed !== undefined ? (
            <span className="opacity-70">
              {" "}
              Ran for {formatSeconds(elapsed)}.
            </span>
          ) : null}
        </span>

        <span className="ms-auto flex items-center gap-1">
          {onResume ? (
            <button
              type="button"
              onClick={onResume}
              className="text-foreground hover:bg-muted focus-visible:ring-ring inline-flex min-h-8 items-center rounded-md px-2.5 font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              {resumeLabel}
            </button>
          ) : null}
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="text-foreground hover:bg-muted focus-visible:ring-ring inline-flex min-h-8 items-center gap-1.5 rounded-md px-2.5 font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              <RotateCw aria-hidden="true" size={13} />
              {retryLabel}
            </button>
          ) : null}
        </span>
      </div>

      <span aria-live="polite" className="sr-only">
        {said}
      </span>
    </div>
  )
}
