"use client"

import * as React from "react"
import { GripVertical, Pencil, X } from "lucide-react"

import { cn } from "@/lib/utils"

export type QueuedMessage = {
  id: string
  text: string
}

export type MessageQueueProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  items: readonly QueuedMessage[]
  onItemsChange: (items: QueuedMessage[]) => void
  /** While true the queue waits. When it turns false the first item goes. */
  busy: boolean
  /** Receives the item being sent. It has already left `items`. */
  onRelease: (item: QueuedMessage) => void
  label?: string
}

const RELEASE_MS = 180
const SETTLE_MS = 160

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

function moved<T>(items: readonly T[], from: number, to: number) {
  const next = [...items]
  const [item] = next.splice(from, 1)
  if (item !== undefined) next.splice(to, 0, item)
  return next
}

function preview(text: string) {
  const line = text.replace(/\s+/g, " ").trim()
  return line.length > 40 ? `${line.slice(0, 40)}…` : line
}

export function MessageQueue({
  items,
  onItemsChange,
  busy,
  onRelease,
  label = "Queued messages",
  className,
  ...rootProps
}: MessageQueueProps) {
  const hintId = React.useId()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const rows = React.useRef(new Map<string, HTMLLIElement>())
  const before = React.useRef(new Map<string, number>())
  const focusAfter = React.useRef<{ id: string; slot: string } | null>(null)

  const [editing, setEditing] = React.useState<{
    id: string
    draft: string
  } | null>(null)
  const [dragging, setDragging] = React.useState<string | null>(null)
  const [spent, setSpent] = React.useState(false)
  const [message, setMessage] = React.useState("")

  // One item per idle spell. The host normally turns busy back on as soon as
  // it sends, and this keeps a host that does not from emptying the queue.
  if (busy && spent) setSpent(false)

  const head = items[0]
  const releasingId =
    !busy && !spent && !dragging && head && editing?.id !== head.id
      ? head.id
      : null

  const latest = React.useRef({ items, onItemsChange, onRelease })
  React.useEffect(() => {
    latest.current = { items, onItemsChange, onRelease }
  })

  React.useEffect(() => {
    if (!releasingId) return

    const timer = setTimeout(
      () => {
        const current = latest.current
        const item = current.items[0]
        if (item?.id !== releasingId) return
        setSpent(true)
        setMessage(`Sending: ${preview(item.text)}`)
        current.onItemsChange(current.items.slice(1))
        current.onRelease(item)
      },
      reducedMotion() ? 0 : RELEASE_MS
    )

    return () => clearTimeout(timer)
  }, [releasingId])

  const measure = () => {
    before.current = new Map(
      [...rows.current].map(([id, row]) => [
        id,
        row.getBoundingClientRect().top,
      ])
    )
  }

  React.useLayoutEffect(() => {
    const previous = before.current
    before.current = new Map()

    if (previous.size > 0 && !reducedMotion()) {
      for (const [id, row] of rows.current) {
        const top = previous.get(id)
        if (top === undefined) continue
        const shift = top - row.getBoundingClientRect().top
        if (!shift) continue

        row.style.transition = "none"
        row.style.transform = `translateY(${shift}px)`
        void row.offsetHeight
        row.style.transition = `transform ${SETTLE_MS}ms ease-out`
        row.style.transform = ""
        setTimeout(() => {
          row.style.transition = ""
        }, SETTLE_MS)
      }
    }

    const target = focusAfter.current
    if (target) {
      focusAfter.current = null
      const row = rows.current.get(target.id)
      const control = row?.querySelector<HTMLElement>(
        `[data-slot='${target.slot}']`
      )
      ;(control ?? rootRef.current)?.focus()
    }
  }, [items, editing])

  const moveTo = (from: number, to: number) => {
    const item = items[from]
    if (!item || to < 0 || to >= items.length || to === from) return

    measure()
    focusAfter.current = { id: item.id, slot: "message-queue-handle" }
    onItemsChange(moved(items, from, to))
    setMessage(
      `${preview(item.text)}, moved to position ${to + 1} of ${items.length}`
    )
  }

  const remove = (index: number) => {
    const item = items[index]
    if (!item) return

    const neighbour = items[index + 1] ?? items[index - 1]
    measure()
    focusAfter.current = neighbour
      ? { id: neighbour.id, slot: "message-queue-edit" }
      : null
    if (!neighbour) rootRef.current?.focus()
    onItemsChange(items.filter((candidate) => candidate.id !== item.id))
    setMessage(`Removed: ${preview(item.text)}`)
  }

  const commit = () => {
    if (!editing) return

    const index = items.findIndex((item) => item.id === editing.id)
    const text = editing.draft.trim()
    setEditing(null)

    if (index === -1) return
    if (!text) {
      remove(index)
      return
    }

    focusAfter.current = { id: editing.id, slot: "message-queue-edit" }
    onItemsChange(
      items.map((item) => (item.id === editing.id ? { ...item, text } : item))
    )
  }

  const cancelEdit = () => {
    if (!editing) return
    focusAfter.current = { id: editing.id, slot: "message-queue-edit" }
    setEditing(null)
  }

  const iconButton =
    "text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring inline-flex size-8 shrink-0 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none"

  return (
    <div
      className={cn("grid gap-1.5 outline-none", className)}
      data-slot="message-queue"
      data-state={items.length === 0 ? "empty" : busy ? "waiting" : "sending"}
      ref={rootRef}
      tabIndex={-1}
      {...rootProps}
    >
      {items.length > 0 ? (
        <>
          <p className="text-muted-foreground flex items-baseline justify-between gap-3 px-1 text-xs">
            <span>
              <span className="text-foreground font-medium">{label}</span>{" "}
              <span className="tabular-nums">{items.length}</span>
            </span>
            <span>
              {busy ? "Sends when the agent finishes" : "Sending the next one"}
            </span>
          </p>

          <ol aria-label={label} className="grid gap-1.5">
            {items.map((item, index) => {
              const isEditing = editing?.id === item.id
              const isReleasing = releasingId === item.id

              return (
                <li
                  className={cn(
                    "border-border bg-card text-card-foreground flex items-start gap-1 rounded-[var(--radius)] border p-1 pl-0.5 text-sm",
                    "motion-safe:transition-[opacity,translate,box-shadow] motion-safe:duration-200 motion-safe:ease-out motion-safe:starting:translate-y-1 motion-safe:starting:opacity-0",
                    isReleasing &&
                      "opacity-0 motion-safe:translate-y-2 motion-safe:duration-150 motion-safe:ease-in",
                    dragging === item.id && "ring-ring shadow-md ring-2"
                  )}
                  data-releasing={isReleasing ? "" : undefined}
                  data-slot="message-queue-item"
                  key={item.id}
                  ref={(node) => {
                    if (node) rows.current.set(item.id, node)
                    else rows.current.delete(item.id)
                  }}
                >
                  <button
                    aria-describedby={hintId}
                    aria-label={`Move ${preview(item.text)}`}
                    className={cn(iconButton, "cursor-grab touch-none")}
                    data-slot="message-queue-handle"
                    type="button"
                    onKeyDown={(event) => {
                      if (event.key === "ArrowUp") {
                        event.preventDefault()
                        moveTo(index, index - 1)
                      }
                      if (event.key === "ArrowDown") {
                        event.preventDefault()
                        moveTo(index, index + 1)
                      }
                    }}
                    onPointerCancel={() => setDragging(null)}
                    onPointerDown={(event) => {
                      if (event.button !== 0) return
                      event.preventDefault()
                      event.currentTarget.setPointerCapture(event.pointerId)
                      setDragging(item.id)
                    }}
                    onPointerMove={(event) => {
                      if (dragging !== item.id) return
                      const target = items.findIndex((candidate) => {
                        const row = rows.current.get(candidate.id)
                        if (!row) return false
                        const rect = row.getBoundingClientRect()
                        return event.clientY < rect.top + rect.height / 2
                      })
                      const next = target === -1 ? items.length - 1 : target
                      if (next !== index) moveTo(index, next)
                    }}
                    onPointerUp={() => setDragging(null)}
                  >
                    <GripVertical aria-hidden="true" size={15} />
                  </button>

                  {isEditing ? (
                    <textarea
                      aria-label="Edit queued message"
                      autoFocus
                      className="bg-background focus-visible:ring-ring min-h-8 min-w-0 flex-1 resize-none rounded-md px-2 py-1.5 leading-snug focus-visible:ring-2 focus-visible:outline-none"
                      rows={Math.min(
                        Math.max(editing.draft.split("\n").length, 1),
                        6
                      )}
                      value={editing.draft}
                      onBlur={commit}
                      onChange={(event) =>
                        setEditing({ id: item.id, draft: event.target.value })
                      }
                      onFocus={(event) => {
                        const end = event.currentTarget.value.length
                        event.currentTarget.setSelectionRange(end, end)
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          event.preventDefault()
                          cancelEdit()
                        }
                        if (
                          event.key === "Enter" &&
                          !event.shiftKey &&
                          !event.nativeEvent.isComposing
                        ) {
                          event.preventDefault()
                          commit()
                        }
                      }}
                    />
                  ) : (
                    <button
                      aria-label={`Edit ${preview(item.text)}`}
                      className="hover:bg-muted/60 focus-visible:ring-ring min-h-8 min-w-0 flex-1 cursor-text rounded-md px-2 py-1.5 text-left leading-snug break-words whitespace-pre-wrap focus-visible:ring-2 focus-visible:outline-none"
                      data-slot="message-queue-edit"
                      type="button"
                      onClick={() =>
                        setEditing({ id: item.id, draft: item.text })
                      }
                    >
                      {item.text}
                    </button>
                  )}

                  {isEditing ? null : (
                    <Pencil
                      aria-hidden="true"
                      className="text-muted-foreground mt-2.5 shrink-0"
                      size={13}
                    />
                  )}

                  <button
                    aria-label={`Remove ${preview(item.text)}`}
                    className={iconButton}
                    data-slot="message-queue-remove"
                    type="button"
                    onMouseDown={(event) => {
                      if (isEditing) event.preventDefault()
                    }}
                    onClick={() => {
                      if (isEditing) setEditing(null)
                      remove(index)
                    }}
                  >
                    <X aria-hidden="true" size={15} />
                  </button>
                </li>
              )
            })}
          </ol>

          <p className="sr-only" id={hintId}>
            Use the up and down arrow keys to change the order.
          </p>
        </>
      ) : null}

      <span aria-live="polite" className="sr-only" role="status">
        {message}
      </span>
    </div>
  )
}
