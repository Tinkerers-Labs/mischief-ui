"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type TimelineTone = "done" | "active" | "todo" | "problem"

export type TimelineEntry = {
  id: string
  title: string
  time?: string
  description?: React.ReactNode
  tone?: TimelineTone
}

export type TimelineProps = Omit<
  React.HTMLAttributes<HTMLOListElement>,
  "children"
> & {
  entries: readonly TimelineEntry[]
  label?: string
}

const DOT: Record<TimelineTone, string> = {
  done: "bg-foreground border-transparent",
  active: "bg-primary border-transparent",
  todo: "bg-background border-border",
  problem: "bg-destructive border-transparent",
}

const SAID: Record<TimelineTone, string> = {
  done: "Finished",
  active: "Happening now",
  todo: "Not started",
  problem: "Went wrong",
}

/**
 * Things that happened, in the order they happened. The state of each entry is
 * said as well as coloured, so the line is not the only thing carrying it.
 */
export function Timeline({
  entries,
  label = "Timeline",
  className,
  ...rootProps
}: TimelineProps) {
  return (
    <ol
      data-slot="timeline"
      aria-label={label}
      className={cn("relative grid", className)}
      {...rootProps}
    >
      {entries.map((entry, index) => {
        const tone = entry.tone ?? "done"
        const last = index === entries.length - 1

        return (
          <li
            key={entry.id}
            data-slot="timeline-entry"
            data-tone={tone}
            className="relative grid grid-cols-[auto_1fr] gap-x-3 pb-6 last:pb-0"
          >
            <div className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className={cn("mt-1 size-3 rounded-full border-2", DOT[tone])}
              />
              {!last && (
                <span
                  aria-hidden="true"
                  className="bg-border mt-1 w-px flex-1"
                />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-sm font-semibold">{entry.title}</p>
                {entry.time && (
                  <span className="text-muted-foreground text-xs">
                    {entry.time}
                  </span>
                )}
                <span className="sr-only">{SAID[tone]}</span>
              </div>

              {entry.description && (
                <div className="text-muted-foreground mt-1 text-sm">
                  {entry.description}
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
