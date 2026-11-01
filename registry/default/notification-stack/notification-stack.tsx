"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface NotificationStackItem {
  id: string
  title: string
  description?: React.ReactNode
  /** A short time, such as "2m ago". */
  time?: string
  icon?: React.ReactNode
}

export interface NotificationStackProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> {
  items: NotificationStackItem[]
  onDismiss: (id: string) => void
  /** Omit it and no Clear all button is drawn. */
  onClearAll?: () => void
  /** The heading, and the accessible name of the stack. */
  label?: string
  emptyMessage?: string
  dismissLabel?: string
  clearLabel?: string
  /** How many cards show behind the first while the stack is closed. */
  visibleCount?: number
}

const PEEK = 10
const GAP = 8
const SWIPE = 80
const LEAVE_MS = 200

const SPRING =
  "duration-300 ease-[cubic-bezier(0.3,1.25,0.5,1)] motion-reduce:transition-none"

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export const NotificationStack = React.forwardRef<
  HTMLElement,
  NotificationStackProps
>(function NotificationStack(
  {
    className,
    clearLabel = "Clear all",
    dismissLabel = "Dismiss",
    emptyMessage = "No notifications",
    items,
    label = "Notifications",
    onBlur,
    onClearAll,
    onClick,
    onDismiss,
    onFocus,
    onPointerEnter,
    onPointerLeave,
    visibleCount = 3,
    ...rootProps
  },
  forwardedRef
) {
  const headingId = React.useId()
  const rootRef = React.useRef<HTMLElement | null>(null)
  const listRef = React.useRef<HTMLOListElement | null>(null)
  const dismissRefs = React.useRef(new Map<string, HTMLButtonElement>())
  const focusIndexRef = React.useRef<number | null>(null)
  const dragRef = React.useRef<{
    id: string
    x: number
    pointer: number
  } | null>(null)

  const [hovered, setHovered] = React.useState(false)
  const [focusWithin, setFocusWithin] = React.useState(false)
  const [pinned, setPinned] = React.useState(false)
  const [heights, setHeights] = React.useState<Record<string, number>>({})
  const [leaving, setLeaving] = React.useState<Record<string, number>>({})
  const [drag, setDrag] = React.useState<{ id: string; dx: number } | null>(
    null
  )

  const [known, setKnown] = React.useState(() => items.map((item) => item.id))
  const [announcement, setAnnouncement] = React.useState("")
  const ids = items.map((item) => item.id)
  if (ids.join() !== known.join()) {
    const arrived = items.filter((item) => !known.includes(item.id))
    setKnown(ids)
    if (arrived.length) {
      setAnnouncement(arrived.map((item) => item.title).join(". "))
    }
  }

  const expanded = (hovered || focusWithin || pinned) && items.length > 1
  const shown = Math.max(visibleCount, 1)

  React.useEffect(() => {
    const list = listRef.current
    if (!list || typeof ResizeObserver === "undefined") return

    const observer = new ResizeObserver((entries) => {
      setHeights((current) => {
        const next = { ...current }
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.measure
          if (id) next[id] = (entry.target as HTMLElement).offsetHeight
        }
        return next
      })
    })
    for (const node of list.querySelectorAll("[data-measure]")) {
      observer.observe(node)
    }
    return () => observer.disconnect()
  }, [items])

  React.useEffect(() => {
    if (!pinned) return

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setPinned(false)
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [pinned])

  React.useEffect(() => {
    const index = focusIndexRef.current
    if (index === null) return
    focusIndexRef.current = null

    const target = items[Math.min(index, items.length - 1)]
    const button = target ? dismissRefs.current.get(target.id) : null
    if (button) button.focus()
    else rootRef.current?.focus()
  }, [items])

  function dismiss(id: string, direction = 1) {
    if (leaving[id]) return
    const index = items.findIndex((item) => item.id === id)
    const root = rootRef.current
    if (root && root.contains(document.activeElement)) {
      focusIndexRef.current = index
    }

    if (reducedMotion()) {
      onDismiss(id)
      return
    }
    setLeaving((current) => ({ ...current, [id]: direction }))
    setTimeout(() => {
      setLeaving((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
      onDismiss(id)
    }, LEAVE_MS)
  }

  const front = items[0] ? (heights[items[0].id] ?? 0) : 0
  const offsets: number[] = []
  let total = 0
  for (const item of items) {
    offsets.push(total)
    total += (heights[item.id] ?? 0) + GAP
  }
  const height = expanded
    ? Math.max(total - GAP, 0)
    : front + PEEK * (Math.min(items.length, shown) - 1)

  return (
    <section
      {...rootProps}
      ref={(node) => {
        rootRef.current = node
        if (typeof forwardedRef === "function") forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      }}
      tabIndex={-1}
      aria-labelledby={headingId}
      data-slot="notification-stack"
      data-state={expanded ? "expanded" : "collapsed"}
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        if (event.pointerType === "mouse") setHovered(true)
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        setHovered(false)
      }}
      onFocus={(event) => {
        onFocus?.(event)
        if (event.target !== event.currentTarget) setFocusWithin(true)
      }}
      onBlur={(event) => {
        onBlur?.(event)
        const next = event.relatedTarget
        if (!next || next === event.currentTarget) setFocusWithin(false)
        else if (!event.currentTarget.contains(next)) setFocusWithin(false)
      }}
      onClick={(event) => {
        onClick?.(event)
        if ((event.target as HTMLElement).closest("button")) return
        if (listRef.current?.contains(event.target as Node)) setPinned(true)
      }}
      className={cn("w-full max-w-sm outline-none", className)}
    >
      <div className="flex min-h-9 items-center gap-2 px-1 pb-2">
        <p id={headingId} className="text-sm font-semibold">
          {label}
        </p>
        {items.length ? (
          <span className="bg-muted text-muted-foreground rounded-full px-1.5 text-xs tabular-nums">
            {items.length}
          </span>
        ) : null}
        {onClearAll && items.length ? (
          <button
            type="button"
            onClick={() => {
              focusIndexRef.current = 0
              onClearAll()
            }}
            className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring ml-auto min-h-8 rounded-full px-3 text-xs transition-colors duration-150 outline-none focus-visible:ring-2 motion-reduce:transition-none"
          >
            {clearLabel}
          </button>
        ) : null}
      </div>

      {items.length ? (
        <ol
          ref={listRef}
          className={cn("relative transition-[height]", SPRING)}
          style={{ height: height || undefined }}
        >
          {items.map((item, index) => {
            const depth = Math.min(index, shown - 1)
            const back = !expanded && index > 0
            const hidden = !expanded && index >= shown
            const gone = leaving[item.id]
            const dx = drag?.id === item.id ? drag.dx : 0
            const y = expanded ? offsets[index] : depth * PEEK
            const scale = expanded ? 1 : 1 - depth * 0.05

            return (
              <li
                key={item.id}
                data-state={gone ? "leaving" : undefined}
                aria-hidden={hidden || undefined}
                className={cn(
                  "absolute inset-x-0 top-0 origin-bottom touch-pan-y transition-[transform,opacity,height]",
                  drag?.id === item.id ? "transition-none" : SPRING,
                  hidden && "pointer-events-none"
                )}
                style={{
                  zIndex: items.length - index,
                  height: back && front ? front : undefined,
                  opacity: gone || hidden ? 0 : 1 - Math.abs(dx) / (SWIPE * 3),
                  transform: `translate3d(${gone ? `${gone * 100}%` : `${dx}px`}, ${y}px, 0) scale(${scale})`,
                }}
                onPointerDown={(event) => {
                  if (event.pointerType === "mouse") return
                  if ((event.target as HTMLElement).closest("button")) return
                  dragRef.current = {
                    id: item.id,
                    x: event.clientX,
                    pointer: event.pointerId,
                  }
                }}
                onPointerMove={(event) => {
                  const start = dragRef.current
                  if (!start || start.pointer !== event.pointerId) return
                  const next = event.clientX - start.x
                  if (!drag && Math.abs(next) < 8) return
                  if (!drag)
                    event.currentTarget.setPointerCapture(event.pointerId)
                  setDrag({ id: item.id, dx: next })
                }}
                onPointerUp={(event) => {
                  const start = dragRef.current
                  dragRef.current = null
                  if (!start || start.pointer !== event.pointerId) return
                  const distance = drag?.id === item.id ? drag.dx : 0
                  setDrag(null)
                  if (Math.abs(distance) > SWIPE) {
                    dismiss(item.id, Math.sign(distance))
                  }
                }}
                onPointerCancel={() => {
                  dragRef.current = null
                  setDrag(null)
                }}
              >
                <div
                  className={cn(
                    "border-border bg-background text-foreground h-full overflow-hidden rounded-[var(--radius)] border shadow-sm",
                    back && "shadow-none"
                  )}
                >
                  <div
                    data-measure={item.id}
                    className={cn(
                      "flex items-start gap-3 p-3 transition-opacity duration-200 motion-reduce:transition-none",
                      back ? "opacity-0" : "opacity-100"
                    )}
                  >
                    {item.icon ? (
                      <span
                        aria-hidden="true"
                        className="bg-muted text-muted-foreground grid size-8 shrink-0 place-items-center rounded-full"
                      >
                        {item.icon}
                      </span>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <p className="min-w-0 flex-1 truncate text-sm font-medium">
                          {item.title}
                        </p>
                        {item.time ? (
                          <span className="text-muted-foreground shrink-0 text-xs">
                            {item.time}
                          </span>
                        ) : null}
                      </div>
                      {item.description ? (
                        <div className="text-muted-foreground mt-0.5 text-sm">
                          {item.description}
                        </div>
                      ) : null}
                    </div>
                    <button
                      ref={(node) => {
                        if (node) dismissRefs.current.set(item.id, node)
                        else dismissRefs.current.delete(item.id)
                      }}
                      type="button"
                      aria-label={`${dismissLabel}: ${item.title}`}
                      tabIndex={hidden ? -1 : undefined}
                      onClick={() => dismiss(item.id)}
                      className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring -my-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-full outline-none focus-visible:ring-2"
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
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="text-muted-foreground border-border rounded-[var(--radius)] border border-dashed px-3 py-6 text-center text-sm">
          {emptyMessage}
        </p>
      )}

      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </section>
  )
})
