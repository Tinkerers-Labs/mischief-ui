"use client"

import * as React from "react"
import { Check, Circle, Loader, Minus, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

export type ChecklistItemStatus =
  "pending" | "active" | "done" | "error" | "skipped"

export type AgentChecklistItem = {
  id: string
  label: React.ReactNode
  status: ChecklistItemStatus
  detail?: React.ReactNode
}

export type AgentChecklistProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> & {
  items: AgentChecklistItem[]
  title?: React.ReactNode
  announce?: boolean
  showProgress?: boolean
}

const statusText: Record<ChecklistItemStatus, string> = {
  pending: "waiting",
  active: "in progress",
  done: "done",
  error: "failed",
  skipped: "skipped",
}

function ItemIcon({ status }: { status: ChecklistItemStatus }) {
  if (status === "active") {
    return (
      <Loader
        aria-hidden="true"
        size={15}
        className="text-foreground animate-spin motion-reduce:animate-none"
      />
    )
  }

  if (status === "done") {
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

  if (status === "skipped") {
    return (
      <Minus aria-hidden="true" size={15} className="text-muted-foreground" />
    )
  }

  return (
    <Circle aria-hidden="true" size={15} className="text-muted-foreground/50" />
  )
}

function textOf(label: React.ReactNode): string {
  if (typeof label === "string" || typeof label === "number")
    return String(label)
  return ""
}

export function AgentChecklist({
  items,
  title,
  announce = true,
  showProgress = true,
  className,
  ...rootProps
}: AgentChecklistProps) {
  const settled = items.filter(
    (item) => item.status === "done" || item.status === "skipped"
  ).length

  const [previous, setPrevious] = React.useState(items)
  const [message, setMessage] = React.useState("")

  if (previous !== items) {
    setPrevious(items)

    if (announce) {
      const changed = items.flatMap((item, index) => {
        const before = previous.find((entry) => entry.id === item.id)?.status

        if (before === undefined || before === item.status) return []

        const name = textOf(item.label) || `Step ${index + 1}`
        return [`${name} ${statusText[item.status]}`]
      })

      if (changed.length > 0) {
        setMessage(
          `${changed.join(". ")}. ${settled} of ${items.length} complete.`
        )
      }
    }
  }

  return (
    <section
      data-slot="agent-checklist"
      className={cn(
        "border-border bg-card text-card-foreground rounded-[var(--radius)] border",
        className
      )}
      {...rootProps}
    >
      {title || showProgress ? (
        <div
          data-slot="agent-checklist-header"
          className="border-border flex items-center gap-3 border-b px-3.5 py-2.5"
        >
          {title ? (
            <h3
              data-slot="agent-checklist-title"
              className="text-sm font-semibold"
            >
              {title}
            </h3>
          ) : null}

          {showProgress ? (
            <span
              data-slot="agent-checklist-progress"
              className="text-muted-foreground ml-auto font-[family-name:var(--font-mono),monospace] text-xs tabular-nums"
            >
              {settled}/{items.length}
            </span>
          ) : null}
        </div>
      ) : null}

      <ol data-slot="agent-checklist-list" className="grid gap-0.5 p-2">
        {items.map((item) => (
          <li
            key={item.id}
            data-slot="agent-checklist-item"
            data-status={item.status}
            className={cn(
              "flex items-start gap-2.5 rounded-[calc(var(--radius)-0.25rem)] px-1.5 py-1.5 text-sm",
              item.status === "active" && "bg-muted/60"
            )}
          >
            <span className="mt-0.5 shrink-0">
              <ItemIcon status={item.status} />
            </span>

            <span className="min-w-0">
              <span
                className={cn(
                  "leading-snug",
                  item.status === "pending" && "text-muted-foreground",
                  item.status === "skipped" &&
                    "text-muted-foreground line-through",
                  item.status === "active" && "font-semibold"
                )}
              >
                {item.label}
              </span>
              <span className="sr-only">, {statusText[item.status]}</span>

              {item.detail ? (
                <span className="text-muted-foreground mt-0.5 block text-xs leading-relaxed">
                  {item.detail}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>

      {announce ? (
        <span aria-live="polite" className="sr-only">
          {message}
        </span>
      ) : null}
    </section>
  )
}
