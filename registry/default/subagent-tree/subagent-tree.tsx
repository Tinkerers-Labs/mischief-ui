"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type AgentRunStatus = "queued" | "running" | "done" | "failed"

export type AgentRun = {
  id: string
  label: string
  status?: AgentRunStatus
  /** What it is doing, or what it found. */
  detail?: React.ReactNode
  /** Seconds it has taken. */
  duration?: number
  children?: readonly AgentRun[]
}

export type SubagentTreeProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  runs: readonly AgentRun[]
  label?: string
}

const wording: Record<AgentRunStatus, string> = {
  queued: "queued",
  running: "running",
  done: "done",
  failed: "failed",
}

function formatSeconds(seconds: number) {
  return seconds < 60
    ? `${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)}s`
    : `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`
}

function tally(runs: readonly AgentRun[]) {
  let running = 0
  let done = 0
  let failed = 0
  let total = 0

  const walk = (list: readonly AgentRun[]) => {
    for (const run of list) {
      total += 1
      const status = run.status ?? "done"
      if (status === "running") running += 1
      if (status === "done") done += 1
      if (status === "failed") failed += 1
      if (run.children) walk(run.children)
    }
  }

  walk(runs)
  return { running, done, failed, total }
}

function Branch({ runs, depth }: { runs: readonly AgentRun[]; depth: number }) {
  return (
    <ul
      className={cn(
        "space-y-1",
        depth > 0 &&
          "border-border relative ms-[7px] border-s ps-4 before:absolute before:-start-px before:top-0 before:h-2 before:w-px"
      )}
    >
      {runs.map((run) => {
        const status = run.status ?? "done"

        return (
          <li key={run.id} data-status={status}>
            <p className="flex items-baseline gap-2 text-sm">
              <span
                aria-hidden="true"
                className={cn(
                  "relative top-[3px] size-[9px] shrink-0 rounded-full",
                  status === "running" &&
                    "bg-primary animate-pulse motion-reduce:animate-none",
                  status === "done" && "bg-muted-foreground/40",
                  status === "failed" && "bg-destructive",
                  status === "queued" && "border-muted-foreground/40 border"
                )}
              />
              <span
                className={cn(
                  status === "queued"
                    ? "text-muted-foreground"
                    : "text-foreground"
                )}
              >
                {run.label}
              </span>
              <span className="sr-only">, {wording[status]}</span>
              {run.duration !== undefined ? (
                <span className="text-muted-foreground shrink-0 font-mono text-[0.6875rem] tabular-nums">
                  {formatSeconds(run.duration)}
                </span>
              ) : null}
            </p>

            {run.detail ? (
              <div className="text-muted-foreground ms-[17px] text-[0.8125rem] leading-relaxed">
                {run.detail}
              </div>
            ) : null}

            {run.children?.length ? (
              <div className="mt-1">
                <Branch runs={run.children} depth={depth + 1} />
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Several agents working at once, nested under whichever one handed the work
 * down, each with its own state and the time it has taken.
 *
 * It is nested lists rather than a tree widget. Nothing here is expanded,
 * selected or navigated, and announcing "tree, level 2" over work that is only
 * being watched buys a keyboard interaction nobody asked for.
 */
export function SubagentTree({
  runs,
  label = "Agents",
  className,
  ...rootProps
}: SubagentTreeProps) {
  const counts = tally(runs)

  const summary =
    counts.running > 0
      ? `${counts.running} of ${counts.total} agents running`
      : counts.failed > 0
        ? `${counts.total} agents finished, ${counts.failed} failed`
        : `${counts.total} agents finished`

  return (
    <div
      data-slot="subagent-tree"
      data-running={counts.running > 0 ? "" : undefined}
      className={cn(
        "border-border bg-background w-full rounded-xl border p-3",
        className
      )}
      {...rootProps}
    >
      <p className="text-muted-foreground mb-2 flex items-baseline gap-2 text-xs">
        <span className="font-medium">{label}</span>
        <span className="ms-auto tabular-nums">
          {counts.done}/{counts.total} done
          {counts.failed > 0 ? (
            <span className="text-destructive ms-2">
              {counts.failed} failed
            </span>
          ) : null}
        </span>
      </p>

      <Branch runs={runs} depth={0} />

      <span aria-live="polite" className="sr-only">
        {summary}
      </span>
    </div>
  )
}
