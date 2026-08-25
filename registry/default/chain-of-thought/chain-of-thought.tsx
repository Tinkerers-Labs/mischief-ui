"use client"

import * as React from "react"
import { Check, ChevronRight, X } from "lucide-react"

import { cn } from "@/lib/utils"

export type ThoughtStatus = "pending" | "active" | "done" | "failed"

export type Thought = {
  id: string
  label: string
  detail?: React.ReactNode
  status?: ThoughtStatus
  /** Seconds this step took, shown beside it. */
  duration?: number
}

export type ChainOfThoughtProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  thoughts: readonly Thought[]
  /** Still working. The trace opens while this is true. */
  thinking?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function formatSeconds(seconds: number) {
  return seconds < 1
    ? `${Math.round(seconds * 1000)}ms`
    : `${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)}s`
}

/**
 * The steps an assistant went through before answering, opened while it is
 * working and folded away once it is done.
 *
 * The trace is never put in a live region. Reasoning arrives a token at a time
 * and announcing it would talk over the answer, so the summary carries the
 * state and the steps stay ordinary text to be read on purpose.
 */
export function ChainOfThought({
  thoughts,
  thinking = false,
  open,
  defaultOpen,
  onOpenChange,
  className,
  ...rootProps
}: ChainOfThoughtProps) {
  const [held, setHeld] = React.useState(defaultOpen ?? thinking)
  const touched = React.useRef(defaultOpen !== undefined)

  // Folding away on its own is right up until someone opens it to read, and
  // then closing it under them is the rudest thing this component could do.
  React.useEffect(() => {
    if (open !== undefined || touched.current) return
    setHeld(thinking)
  }, [open, thinking])

  const shown = open ?? held
  const total = thoughts.reduce((sum, step) => sum + (step.duration ?? 0), 0)

  const summary = thinking
    ? `Working on it`
    : total > 0
      ? `Thought for ${formatSeconds(total)}`
      : `Thought about it`

  const toggle = () => {
    touched.current = true
    const next = !shown
    if (open === undefined) setHeld(next)
    onOpenChange?.(next)
  }

  return (
    <div
      data-slot="chain-of-thought"
      data-thinking={thinking ? "" : undefined}
      className={cn(
        "border-border bg-muted/30 w-full rounded-xl border",
        className
      )}
      {...rootProps}
    >
      <button
        type="button"
        aria-expanded={shown}
        onClick={toggle}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
      >
        <ChevronRight
          aria-hidden="true"
          size={15}
          className={cn(
            "shrink-0 transition-transform duration-150 motion-reduce:transition-none",
            shown && "rotate-90"
          )}
        />
        <span
          className={cn(thinking && "animate-pulse motion-reduce:animate-none")}
        >
          {summary}
        </span>
        <span className="ms-auto text-xs opacity-70">
          {thoughts.length} {thoughts.length === 1 ? "step" : "steps"}
        </span>
      </button>

      {shown ? (
        <ol data-slot="chain-of-thought-steps" className="space-y-1 px-3 pb-3">
          {thoughts.map((step) => {
            const status = step.status ?? "done"

            return (
              <li
                key={step.id}
                data-status={status}
                className="border-border/70 relative ps-5 text-sm before:absolute before:start-[5px] before:top-6 before:bottom-0 before:w-px before:bg-current before:opacity-20 last:before:hidden"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute start-0 top-1.5 flex size-[11px] items-center justify-center rounded-full",
                    status === "active" && "bg-primary",
                    status === "done" && "bg-muted-foreground/40",
                    status === "failed" && "bg-destructive",
                    status === "pending" && "border-muted-foreground/40 border"
                  )}
                >
                  {status === "done" ? (
                    <Check size={7} className="text-background" />
                  ) : status === "failed" ? (
                    <X size={7} className="text-background" />
                  ) : null}
                </span>

                <p className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      status === "pending"
                        ? "text-muted-foreground"
                        : "text-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                  {step.duration !== undefined ? (
                    <span className="text-muted-foreground shrink-0 font-mono text-[0.6875rem] tabular-nums">
                      {formatSeconds(step.duration)}
                    </span>
                  ) : null}
                  <span className="sr-only">
                    {status === "failed"
                      ? ", failed"
                      : status === "pending"
                        ? ", not started"
                        : status === "active"
                          ? ", running"
                          : ", done"}
                  </span>
                </p>

                {step.detail ? (
                  <div className="text-muted-foreground mt-1 text-[0.8125rem] leading-relaxed">
                    {step.detail}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ol>
      ) : null}

      <span aria-live="polite" className="sr-only">
        {summary}
      </span>
    </div>
  )
}
