"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type StatusIslandTaskStatus = "running" | "done" | "error"

export interface StatusIslandTask {
  id: string
  label: string
  /** From 0 to 1. Leave it out while the size of the work is unknown. */
  progress?: number
  status: StatusIslandTaskStatus
  /** A second line, such as the reason a task failed. */
  detail?: string
}

export type StatusIslandState = "hidden" | "running" | "error" | "done"

export interface StatusIslandProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  tasks: StatusIslandTask[]
  /** Omit it and running tasks have no Cancel button. */
  onCancel?: (id: string) => void
  /** Omit it and failed tasks have no Retry button. */
  onRetry?: (id: string) => void
  /** The accessible name of the island and its list. */
  label?: string
  doneLabel?: string
  failedLabel?: string
  cancelLabel?: string
  retryLabel?: string
  /** How long "Done" stays up before the island leaves, in milliseconds. */
  doneDuration?: number
}

const SPRING =
  "transition-[width,height,border-radius,opacity,transform] duration-300 ease-[cubic-bezier(0.3,1.3,0.5,1)] motion-reduce:transition-none"

function percent(progress: number) {
  return Math.round(Math.min(Math.max(progress, 0), 1) * 100)
}

function Ring({ task }: { task: StatusIslandTask }) {
  const known = task.status === "running" && task.progress !== undefined
  const value = known ? percent(task.progress ?? 0) : 0

  return (
    <span aria-hidden="true" className="relative size-5 shrink-0">
      {task.status === "error" ? (
        <span className="bg-destructive text-background absolute inset-0.5 grid place-items-center rounded-full text-[10px] leading-none font-bold">
          !
        </span>
      ) : task.status === "done" ? (
        <svg className="absolute inset-0" fill="none" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" className="fill-primary" />
          <path
            d="M6.5 10.5 9 13l4.5-5.5"
            className="stroke-primary-foreground"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      ) : (
        <svg
          className={cn(
            "absolute inset-0 -rotate-90",
            !known && "animate-spin motion-reduce:animate-none"
          )}
          fill="none"
          viewBox="0 0 20 20"
        >
          <circle
            cx="10"
            cy="10"
            r="8"
            className="stroke-foreground/15"
            strokeWidth="2.5"
          />
          <circle
            cx="10"
            cy="10"
            r="8"
            pathLength={100}
            className="stroke-primary transition-[stroke-dashoffset] duration-300 ease-out motion-reduce:transition-none"
            strokeDasharray={100}
            strokeDashoffset={known ? 100 - value : 70}
            strokeLinecap="round"
            strokeWidth="2.5"
          />
        </svg>
      )}
    </span>
  )
}

function lead(tasks: StatusIslandTask[]) {
  return (
    tasks.find((task) => task.status === "error") ??
    tasks.find((task) => task.status === "running") ??
    tasks[tasks.length - 1]
  )
}

export const StatusIsland = React.forwardRef<HTMLDivElement, StatusIslandProps>(
  function StatusIsland(
    {
      className,
      doneDuration = 1600,
      doneLabel = "Done",
      cancelLabel = "Cancel",
      failedLabel = "Failed",
      label = "Background tasks",
      onBlur,
      onCancel,
      onFocus,
      onKeyDown,
      onRetry,
      retryLabel = "Retry",
      tasks,
      ...rootProps
    },
    forwardedRef
  ) {
    const listId = React.useId()
    const rootRef = React.useRef<HTMLDivElement | null>(null)
    const contentRef = React.useRef<HTMLDivElement | null>(null)
    const summaryRef = React.useRef<HTMLButtonElement | null>(null)
    const [expanded, setExpanded] = React.useState(false)
    const [focusWithin, setFocusWithin] = React.useState(false)
    const [size, setSize] = React.useState<{ w: number; h: number } | null>(
      null
    )
    const [dismissedKey, setDismissedKey] = React.useState<string | null>(null)

    const signature = tasks.map((task) => `${task.id}:${task.status}`).join()
    const [seen, setSeen] = React.useState(() =>
      Object.fromEntries(tasks.map((task) => [task.id, task.status]))
    )
    const [seenSignature, setSeenSignature] = React.useState(signature)
    const [announcement, setAnnouncement] = React.useState("")

    if (signature !== seenSignature) {
      const news = tasks
        .filter((task) => task.status !== "running")
        .filter((task) => seen[task.id] !== task.status)
        .map((task) =>
          task.status === "done"
            ? `${task.label} finished`
            : `${task.label} failed${task.detail ? `: ${task.detail}` : ""}`
        )
      setSeenSignature(signature)
      setSeen(Object.fromEntries(tasks.map((task) => [task.id, task.status])))
      if (news.length) setAnnouncement(news.join(". "))
    }

    const running = tasks.filter((task) => task.status === "running")
    const failed = tasks.filter((task) => task.status === "error")
    const settled = tasks.length > 0 && !running.length && !failed.length
    const visible = tasks.length > 0 && !(settled && dismissedKey === signature)
    const open = expanded && visible

    const state: StatusIslandState = !visible
      ? "hidden"
      : failed.length
        ? "error"
        : running.length
          ? "running"
          : "done"

    React.useEffect(() => {
      if (!settled || open || focusWithin) return
      const timer = setTimeout(() => setDismissedKey(signature), doneDuration)
      return () => clearTimeout(timer)
    }, [doneDuration, focusWithin, open, settled, signature])

    React.useEffect(() => {
      const content = contentRef.current
      if (!content || typeof ResizeObserver === "undefined") return

      const observer = new ResizeObserver(() => {
        setSize({ w: content.offsetWidth, h: content.offsetHeight })
      })
      observer.observe(content)
      return () => observer.disconnect()
    }, [])

    React.useEffect(() => {
      if (!open) return

      function onPointerDown(event: PointerEvent) {
        if (!rootRef.current?.contains(event.target as Node)) {
          setExpanded(false)
        }
      }

      document.addEventListener("pointerdown", onPointerDown)
      return () => document.removeEventListener("pointerdown", onPointerDown)
    }, [open])

    const top = lead(tasks)
    const others = running.length + failed.length - 1
    const summaryText = !top
      ? ""
      : state === "done" && tasks.length > 1
        ? `${tasks.length} tasks`
        : top.label
    const summaryValue = !top
      ? ""
      : state === "done"
        ? doneLabel
        : top.status === "error"
          ? failedLabel
          : top.progress !== undefined
            ? `${percent(top.progress)}%`
            : ""

    return (
      <>
        <div
          {...rootProps}
          ref={(node) => {
            rootRef.current = node
            if (typeof forwardedRef === "function") forwardedRef(node)
            else if (forwardedRef) forwardedRef.current = node
          }}
          role="region"
          aria-label={label}
          aria-hidden={!visible || undefined}
          inert={!visible}
          data-slot="status-island"
          data-state={state}
          data-expanded={open || undefined}
          onFocus={(event) => {
            onFocus?.(event)
            setFocusWithin(true)
          }}
          onBlur={(event) => {
            onBlur?.(event)
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setFocusWithin(false)
            }
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event)
            if (event.defaultPrevented || event.key !== "Escape" || !open) {
              return
            }
            event.preventDefault()
            setExpanded(false)
            summaryRef.current?.focus()
          }}
          className={cn(
            "fixed top-4 left-1/2 z-50 -translate-x-1/2",
            className
          )}
        >
          <div
            className={cn(
              "bg-foreground text-background overflow-hidden shadow-lg",
              SPRING,
              "rounded-[1.25rem]",
              visible ? "scale-100 opacity-100" : "scale-90 opacity-0"
            )}
            style={size ? { width: size.w, height: size.h } : undefined}
          >
            <div ref={contentRef} className="w-max">
              <button
                ref={summaryRef}
                type="button"
                aria-expanded={open}
                aria-controls={listId}
                onClick={() => setExpanded((value) => !value)}
                className={cn(
                  "focus-visible:ring-ring flex min-h-10 items-center gap-2.5 rounded-[1.25rem] py-2 pr-4 pl-2.5 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-inset",
                  open
                    ? "w-[min(22rem,calc(100vw-2rem))]"
                    : "max-w-[min(18rem,calc(100vw-2rem))]"
                )}
              >
                {top ? <Ring task={top} /> : null}
                <span className="min-w-0 flex-1 truncate font-medium">
                  {summaryText}
                </span>
                {summaryValue ? (
                  <span className="text-background/70 shrink-0 text-xs tabular-nums">
                    {summaryValue}
                  </span>
                ) : null}
                {others > 0 ? (
                  <span className="bg-background/15 shrink-0 rounded-full px-1.5 text-xs tabular-nums">
                    +{others}
                    <span className="sr-only">
                      {others === 1 ? " more task" : " more tasks"}
                    </span>
                  </span>
                ) : null}
              </button>

              <ul
                id={listId}
                hidden={!open}
                className="w-[min(22rem,calc(100vw-2rem))] space-y-1 px-2 pb-2"
              >
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    data-status={task.status}
                    className="bg-background/8 flex items-center gap-2.5 rounded-xl px-2.5 py-2"
                  >
                    <Ring task={task} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <p className="min-w-0 flex-1 truncate text-sm">
                          {task.label}
                        </p>
                        <span className="text-background/70 shrink-0 text-xs tabular-nums">
                          {task.status === "error"
                            ? failedLabel
                            : task.status === "done"
                              ? doneLabel
                              : task.progress !== undefined
                                ? `${percent(task.progress)}%`
                                : ""}
                        </span>
                      </div>
                      {task.status === "running" ? (
                        <div
                          role="progressbar"
                          aria-label={task.label}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={
                            task.progress === undefined
                              ? undefined
                              : percent(task.progress)
                          }
                          className="bg-background/15 mt-1.5 h-1 overflow-hidden rounded-full"
                        >
                          <div
                            className={cn(
                              "bg-primary h-full origin-left rounded-full transition-transform duration-300 ease-out motion-reduce:transition-none",
                              task.progress === undefined && "w-1/3"
                            )}
                            style={
                              task.progress === undefined
                                ? undefined
                                : {
                                    transform: `scaleX(${percent(task.progress) / 100})`,
                                  }
                            }
                          />
                        </div>
                      ) : task.detail ? (
                        <p className="text-background/70 mt-0.5 truncate text-xs">
                          {task.detail}
                        </p>
                      ) : null}
                    </div>
                    {task.status === "running" && onCancel ? (
                      <button
                        type="button"
                        aria-label={`${cancelLabel} ${task.label}`}
                        onClick={() => onCancel(task.id)}
                        className="hover:bg-background/15 focus-visible:ring-ring grid size-8 shrink-0 place-items-center rounded-full text-base leading-none outline-none focus-visible:ring-2"
                      >
                        <svg
                          aria-hidden="true"
                          className="size-3.5"
                          fill="none"
                          viewBox="0 0 14 14"
                        >
                          <path
                            d="m3.5 3.5 7 7m0-7-7 7"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeWidth="1.75"
                          />
                        </svg>
                      </button>
                    ) : null}
                    {task.status === "error" && onRetry ? (
                      <button
                        type="button"
                        aria-label={`${retryLabel} ${task.label}`}
                        onClick={() => onRetry(task.id)}
                        className="bg-background text-foreground focus-visible:ring-ring min-h-8 shrink-0 rounded-full px-3 text-xs font-medium outline-none focus-visible:ring-2"
                      >
                        {retryLabel}
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <span aria-live="polite" className="sr-only">
          {announcement}
        </span>
      </>
    )
  }
)
