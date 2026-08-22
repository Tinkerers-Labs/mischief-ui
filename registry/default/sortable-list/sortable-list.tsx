"use client"

import * as React from "react"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

export type SortableListProps<TItem> = Omit<
  React.HTMLAttributes<HTMLOListElement>,
  "children"
> & {
  items: readonly TItem[]
  getKey: (item: TItem) => string
  onReorder: (items: TItem[]) => void
  renderItem: (item: TItem, index: number) => React.ReactNode
  /** Names the item in announcements and on its handle. */
  getLabel?: (item: TItem) => string
  label?: string
  disabled?: boolean
}

function moved<TItem>(items: readonly TItem[], from: number, to: number) {
  const next = [...items]
  const [lifted] = next.splice(from, 1)
  if (lifted !== undefined) next.splice(to, 0, lifted)
  return next
}

/**
 * A list reordered by dragging a handle, or from the keyboard without one.
 * Every move is announced, because a list that silently rearranges itself is
 * unusable to anyone who is not watching it.
 */
export function SortableList<TItem>({
  items,
  getKey,
  onReorder,
  renderItem,
  getLabel,
  label = "Sortable list",
  disabled,
  className,
  ...rootProps
}: SortableListProps<TItem>) {
  const listRef = React.useRef<HTMLOListElement>(null)
  const [dragging, setDragging] = React.useState<string | null>(null)
  const [lifted, setLifted] = React.useState<string | null>(null)
  const [message, setMessage] = React.useState("")
  const origin = React.useRef<readonly TItem[]>(items)

  const nameOf = (item: TItem, index: number) =>
    getLabel?.(item) ?? `Item ${index + 1}`

  const announce = (item: TItem, from: number, to: number) => {
    setMessage(
      `${nameOf(item, from)} moved to position ${to + 1} of ${items.length}`
    )
  }

  const rowsOf = () =>
    Array.from(
      listRef.current?.querySelectorAll<HTMLLIElement>(
        "[data-slot='sortable-list-item']"
      ) ?? []
    )

  const moveTo = (from: number, to: number) => {
    if (to < 0 || to >= items.length || to === from) return
    const item = items[from]
    if (item === undefined) return

    onReorder(moved(items, from, to))
    announce(item, from, to)
  }

  return (
    <>
      <ol
        ref={listRef}
        data-slot="sortable-list"
        aria-label={label}
        className={cn("grid gap-2", className)}
        {...rootProps}
      >
        {items.map((item, index) => {
          const key = getKey(item)
          const isDragging = dragging === key
          const isLifted = lifted === key

          return (
            <li
              key={key}
              data-slot="sortable-list-item"
              data-dragging={isDragging ? "" : undefined}
              data-lifted={isLifted ? "" : undefined}
              className={cn(
                "border-border bg-card flex items-center gap-2 rounded-[var(--radius)] border p-2",
                "transition-[box-shadow,transform] duration-150 motion-reduce:transition-none",
                isDragging && "shadow-lg",
                isLifted && "ring-ring ring-2"
              )}
            >
              <button
                type="button"
                disabled={disabled}
                aria-label={`Reorder ${nameOf(item, index)}`}
                aria-pressed={isLifted}
                data-slot="sortable-list-handle"
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed"
                onPointerDown={(event) => {
                  if (disabled || event.button !== 0) return
                  event.preventDefault()
                  event.currentTarget.setPointerCapture(event.pointerId)
                  origin.current = items
                  setDragging(key)
                }}
                onPointerMove={(event) => {
                  if (dragging !== key) return

                  const rows = rowsOf()
                  const at = items.findIndex(
                    (candidate) => getKey(candidate) === key
                  )

                  const target = rows.findIndex((row) => {
                    const rect = row.getBoundingClientRect()
                    return event.clientY < rect.top + rect.height / 2
                  })

                  const next = target === -1 ? items.length - 1 : target
                  if (next !== at) moveTo(at, next)
                }}
                onPointerUp={() => setDragging(null)}
                onPointerCancel={() => setDragging(null)}
                onKeyDown={(event) => {
                  const at = index

                  if (event.key === " " || event.key === "Enter") {
                    event.preventDefault()

                    if (isLifted) {
                      setLifted(null)
                      setMessage(`${nameOf(item, at)} dropped`)
                    } else {
                      origin.current = items
                      setLifted(key)
                      setMessage(
                        `${nameOf(item, at)} lifted. Use the arrow keys to move it, then press space to drop it.`
                      )
                    }
                    return
                  }

                  if (!isLifted) return

                  if (event.key === "ArrowUp") {
                    event.preventDefault()
                    moveTo(at, at - 1)
                  }

                  if (event.key === "ArrowDown") {
                    event.preventDefault()
                    moveTo(at, at + 1)
                  }

                  if (event.key === "Escape") {
                    event.preventDefault()
                    onReorder([...origin.current])
                    setLifted(null)
                    setMessage("Move cancelled")
                  }
                }}
              >
                <GripVertical aria-hidden="true" size={16} />
              </button>

              <div className="min-w-0 flex-1">{renderItem(item, index)}</div>
            </li>
          )
        })}
      </ol>

      <span className="sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </>
  )
}
