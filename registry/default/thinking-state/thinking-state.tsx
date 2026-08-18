"use client"

import * as React from "react"
import { ChevronRight, Loader, Sparkles, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

export type ThinkingStatus = "idle" | "thinking" | "done" | "error"

export type ThinkingStateProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  status?: ThinkingStatus
  label?: React.ReactNode
  doneLabel?: React.ReactNode
  errorLabel?: React.ReactNode
  startedAt?: number
  elapsedMs?: number
  showElapsed?: boolean
  reasoning?: React.ReactNode
  reasoningLabel?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function formatElapsed(ms: number) {
  const seconds = ms / 1000

  if (seconds < 60) {
    return `${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)}s`
  }

  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${Math.round(seconds - minutes * 60)}s`
}

export function ThinkingState({
  status = "thinking",
  label = "Thinking",
  doneLabel = "Thought",
  errorLabel = "Could not finish",
  startedAt,
  elapsedMs,
  showElapsed = true,
  reasoning,
  reasoningLabel = "Show reasoning",
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  ...rootProps
}: ThinkingStateProps) {
  const reactId = React.useId()
  const panelId = `${reactId}-reasoning`
  const isThinking = status === "thinking"

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isOpen = open ?? uncontrolledOpen

  const setOpen = (next: boolean) => {
    if (open === undefined) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  const [tick, setTick] = React.useState(() => Date.now())

  React.useEffect(() => {
    if (!isThinking || startedAt == null) return

    const timer = window.setInterval(() => setTick(Date.now()), 100)

    return () => window.clearInterval(timer)
  }, [isThinking, startedAt])

  const elapsed =
    elapsedMs ?? (startedAt == null ? undefined : Math.max(0, tick - startedAt))

  const statusLabel =
    status === "error" ? errorLabel : isThinking ? label : doneLabel

  const Icon =
    status === "error" ? TriangleAlert : isThinking ? Loader : Sparkles

  return (
    <div
      data-slot="thinking-state"
      data-status={status}
      aria-busy={isThinking || undefined}
      className={cn(
        "border-border bg-muted/40 text-foreground rounded-[var(--radius)] border",
        className
      )}
      {...rootProps}
    >
      <div
        data-slot="thinking-state-header"
        className="flex items-center gap-2.5 px-3.5 py-2.5"
      >
        <Icon
          aria-hidden="true"
          size={16}
          className={cn(
            "shrink-0",
            status === "error" ? "text-destructive" : "text-muted-foreground",
            isThinking && "animate-spin motion-reduce:animate-none"
          )}
        />

        <span
          data-slot="thinking-state-label"
          className={cn(
            "text-sm font-semibold",
            isThinking && "animate-pulse motion-reduce:animate-none"
          )}
        >
          {statusLabel}
        </span>

        {showElapsed && elapsed != null ? (
          <span
            data-slot="thinking-state-elapsed"
            className="text-muted-foreground font-[family-name:var(--font-mono),monospace] text-xs tabular-nums"
          >
            {formatElapsed(elapsed)}
          </span>
        ) : null}

        {reasoning ? (
          <button
            type="button"
            data-slot="thinking-state-trigger"
            aria-expanded={isOpen}
            aria-controls={panelId}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring ml-auto inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-xs font-semibold focus-visible:ring-2 focus-visible:outline-none"
            onClick={() => setOpen(!isOpen)}
          >
            {reasoningLabel}
            <ChevronRight
              aria-hidden="true"
              size={14}
              className={cn(
                "transition-transform duration-200 motion-reduce:transition-none",
                isOpen && "rotate-90"
              )}
            />
          </button>
        ) : null}
      </div>

      {reasoning ? (
        <div
          id={panelId}
          data-slot="thinking-state-reasoning"
          hidden={!isOpen}
          className="text-muted-foreground border-border border-t px-3.5 py-3 text-sm leading-relaxed"
        >
          {reasoning}
        </div>
      ) : null}
    </div>
  )
}
