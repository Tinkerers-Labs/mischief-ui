"use client"

import * as React from "react"
import {
  Check,
  ChevronRight,
  Loader,
  Circle,
  TriangleAlert,
  Wrench,
} from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ToolCallStatus = "pending" | "running" | "success" | "error"

export type ToolCallProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "input"
> & {
  name: string
  status?: ToolCallStatus
  input?: unknown
  output?: React.ReactNode
  error?: string
  startedAt?: number
  durationMs?: number
  icon?: React.ReactNode
  inputLabel?: string
  outputLabel?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const statusText: Record<ToolCallStatus, string> = {
  pending: "Queued",
  running: "Running",
  success: "Done",
  error: "Failed",
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${Math.round(ms)}ms`

  const seconds = ms / 1000
  if (seconds < 60)
    return `${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)}s`

  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${Math.round(seconds - minutes * 60)}s`
}

function formatInput(value: unknown) {
  if (typeof value === "string") return value

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function StatusIcon({ status }: { status: ToolCallStatus }) {
  if (status === "running") {
    return (
      <Loader
        aria-hidden="true"
        size={15}
        className="text-muted-foreground animate-spin motion-reduce:animate-none"
      />
    )
  }

  if (status === "success") {
    return <Check aria-hidden="true" size={15} className="text-accent" />
  }

  if (status === "error") {
    return (
      <TriangleAlert
        aria-hidden="true"
        size={15}
        className="text-destructive"
      />
    )
  }

  return (
    <Circle aria-hidden="true" size={15} className="text-muted-foreground" />
  )
}

export function ToolCall({
  name,
  status = "pending",
  input,
  output,
  error,
  startedAt,
  durationMs,
  icon,
  inputLabel = "Input",
  outputLabel = "Output",
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  ...rootProps
}: ToolCallProps) {
  const reactId = React.useId()
  const panelId = `${reactId}-panel`
  const isRunning = status === "running"

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isOpen = open ?? uncontrolledOpen

  const setOpen = (next: boolean) => {
    if (open === undefined) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  const [tick, setTick] = React.useState(() => Date.now())

  React.useEffect(() => {
    if (!isRunning || startedAt == null) return

    const timer = window.setInterval(() => setTick(Date.now()), 100)

    return () => window.clearInterval(timer)
  }, [isRunning, startedAt])

  const duration =
    durationMs ??
    (isRunning && startedAt != null ? Math.max(0, tick - startedAt) : undefined)

  const hasPanel = input !== undefined || output !== undefined || error != null

  return (
    <div
      data-slot="tool-call"
      data-status={status}
      className={cn(
        "border-border bg-card text-card-foreground rounded-[var(--radius)] border",
        className
      )}
      {...rootProps}
    >
      <div
        data-slot="tool-call-header"
        className="flex items-center gap-2.5 px-3.5 py-2.5"
      >
        <span aria-hidden="true" className="text-muted-foreground shrink-0">
          {icon ?? <Wrench size={15} />}
        </span>

        <span
          data-slot="tool-call-name"
          className="font-[family-name:var(--font-mono),monospace] text-sm font-semibold"
        >
          {name}
        </span>

        <span className="ml-auto flex items-center gap-2">
          {duration != null ? (
            <span
              data-slot="tool-call-duration"
              className="text-muted-foreground font-[family-name:var(--font-mono),monospace] text-xs tabular-nums"
            >
              {formatDuration(duration)}
            </span>
          ) : null}

          <StatusIcon status={status} />
          <span className="sr-only" role="status">
            {name} {statusText[status].toLowerCase()}
          </span>

          {hasPanel ? (
            <button
              type="button"
              data-slot="tool-call-trigger"
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-xs font-semibold focus-visible:ring-2 focus-visible:outline-none"
              onClick={() => setOpen(!isOpen)}
            >
              <span className="sr-only">
                {isOpen ? "Hide" : "Show"} details for {name}
              </span>
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
        </span>
      </div>

      {hasPanel ? (
        <div
          id={panelId}
          data-slot="tool-call-panel"
          hidden={!isOpen}
          className="border-border grid gap-3 border-t px-3.5 py-3"
        >
          {input !== undefined ? (
            <div data-slot="tool-call-input">
              <p className="text-muted-foreground text-xs font-bold tracking-[0.08em] uppercase">
                {inputLabel}
              </p>
              <pre className="bg-muted/60 mt-1.5 overflow-x-auto rounded-[calc(var(--radius)-0.25rem)] p-2.5 font-[family-name:var(--font-mono),monospace] text-xs leading-relaxed">
                {formatInput(input)}
              </pre>
            </div>
          ) : null}

          {output !== undefined ? (
            <div data-slot="tool-call-output">
              <p className="text-muted-foreground text-xs font-bold tracking-[0.08em] uppercase">
                {outputLabel}
              </p>
              <div className="mt-1.5 text-sm leading-relaxed">{output}</div>
            </div>
          ) : null}

          {error != null ? (
            <p data-slot="tool-call-error" className="text-destructive text-sm">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
