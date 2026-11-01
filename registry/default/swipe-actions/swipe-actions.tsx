"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

export type SwipeActionTone = "neutral" | "primary" | "destructive"

export type SwipeAction = {
  label: string
  icon?: React.ReactNode
  tone?: SwipeActionTone
  onSelect: () => void
}

export interface SwipeActionsProps extends React.HTMLAttributes<HTMLUListElement> {
  /** The accessible name of the list. */
  label: string
}

export interface SwipeActionsItemProps extends Omit<
  React.HTMLAttributes<HTMLLIElement>,
  "children"
> {
  /** Revealed by swiping right. The first one sits at the edge. */
  leading?: readonly SwipeAction[]
  /** Revealed by swiping left. The first one sits at the edge. */
  trailing?: readonly SwipeAction[]
  /** A swipe most of the way across runs the edge action. Defaults to true. */
  fullSwipe?: boolean
  /** Names the row in the More actions button. */
  label: string
  moreLabel?: string
  children: React.ReactNode
}

type Side = "leading" | "trailing"

const ACTION_WIDTH = 76
const SLOP = 6
const RESISTANCE = 0.3
const SETTLE_MS = 220

type ListContextValue = {
  open: { id: string; side: Side } | null
  setOpen: (open: { id: string; side: Side } | null) => void
}

const ListContext = React.createContext<ListContextValue | null>(null)

const reducedQuery = "(prefers-reduced-motion: reduce)"

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia(reducedQuery)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

function useReducedMotion() {
  return React.useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(reducedQuery).matches,
    () => false
  )
}

const tones: Record<SwipeActionTone, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  primary: "bg-primary text-primary-foreground",
  destructive: "bg-destructive text-white",
}

/**
 * A list whose rows swipe aside to reveal what can be done with them, the way
 * a mail inbox does. Only one row is open at a time, and every action is also
 * in a menu, because a swipe is invisible to a keyboard and to a screen reader.
 */
export function SwipeActions({
  label,
  className,
  children,
  ...rootProps
}: SwipeActionsProps) {
  const [open, setOpen] = React.useState<ListContextValue["open"]>(null)
  const value = React.useMemo(() => ({ open, setOpen }), [open])

  return (
    <ListContext.Provider value={value}>
      <ul
        aria-label={label}
        data-slot="swipe-actions"
        className={cn(
          "border-border bg-background divide-border divide-y overflow-hidden rounded-[var(--radius)] border",
          className
        )}
        {...rootProps}
      >
        {children}
      </ul>
    </ListContext.Provider>
  )
}

function rubber(distance: number, limit: number, reduced: boolean) {
  const size = Math.abs(distance)
  if (size <= limit) return distance
  if (reduced) return Math.sign(distance) * limit
  return Math.sign(distance) * (limit + (size - limit) * RESISTANCE)
}

export function SwipeActionsItem({
  leading = [],
  trailing = [],
  fullSwipe = true,
  label,
  moreLabel = "More actions",
  className,
  children,
  ...itemProps
}: SwipeActionsItemProps) {
  const list = React.useContext(ListContext)
  const id = React.useId()
  const reduced = useReducedMotion()
  const rowRef = React.useRef<HTMLLIElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const moreRef = React.useRef<HTMLButtonElement>(null)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const gesture = React.useRef<{
    pointerId: number
    x: number
    y: number
    base: number
    axis: "x" | "y" | null
    lastX: number
    lastT: number
    velocity: number
  } | null>(null)
  const swallowClick = React.useRef(false)
  const snapTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const commitTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const [localOpen, setLocalOpen] = React.useState<Side | null>(null)
  const [drag, setDrag] = React.useState<number | null>(null)
  const [armed, setArmed] = React.useState<Side | null>(null)
  const [snapping, setSnapping] = React.useState(false)
  const [committing, setCommitting] = React.useState<{
    side: Side
    distance: number
  } | null>(null)
  const [menu, setMenu] = React.useState<React.CSSProperties | null>(null)
  const menuOpen = menu !== null

  const openSide = list
    ? list.open?.id === id
      ? list.open.side
      : null
    : localOpen
  const setOpenSide = React.useCallback(
    (side: Side | null) => {
      if (list) list.setOpen(side ? { id, side } : null)
      else setLocalOpen(side)
    },
    [id, list]
  )

  React.useEffect(
    () => () => {
      if (snapTimer.current) clearTimeout(snapTimer.current)
      if (commitTimer.current) clearTimeout(commitTimer.current)
    },
    []
  )

  React.useEffect(() => {
    if (!openSide) return
    function closeOutside(event: PointerEvent) {
      if (!rowRef.current?.contains(event.target as Node)) setOpenSide(null)
    }
    document.addEventListener("pointerdown", closeOutside)
    return () => document.removeEventListener("pointerdown", closeOutside)
  }, [openSide, setOpenSide])

  React.useEffect(() => {
    if (!menuOpen) return
    function closeOutside(event: Event) {
      const target = event.target as Node
      if (
        !menuRef.current?.contains(target) &&
        !moreRef.current?.contains(target)
      ) {
        setMenu(null)
      }
    }
    function close() {
      setMenu(null)
    }
    document.addEventListener("pointerdown", closeOutside)
    window.addEventListener("resize", close)
    window.addEventListener("scroll", closeOutside, true)
    menuRef.current?.querySelector<HTMLElement>("[role='menuitem']")?.focus()
    return () => {
      document.removeEventListener("pointerdown", closeOutside)
      window.removeEventListener("resize", close)
      window.removeEventListener("scroll", closeOutside, true)
    }
  }, [menuOpen])

  const actionsFor = (side: Side) => (side === "leading" ? leading : trailing)
  const extentOf = (side: Side) => actionsFor(side).length * ACTION_WIDTH
  const sideOf = (distance: number): Side =>
    distance > 0 ? "leading" : "trailing"
  const widthOf = () => contentRef.current?.offsetWidth ?? 0
  const thresholdOf = (side: Side) =>
    Math.max(widthOf() * 0.6, extentOf(side) + 72)

  const run = (action: SwipeAction | undefined) => {
    setOpenSide(null)
    action?.onSelect()
  }

  const commit = (side: Side) => {
    const action = actionsFor(side)[0]
    setDrag(null)
    setArmed(null)
    if (reduced) {
      run(action)
      return
    }
    setCommitting({
      side,
      distance: Math.max(contentRef.current?.offsetWidth ?? 0, 480),
    })
    commitTimer.current = setTimeout(() => {
      setCommitting(null)
      run(action)
    }, SETTLE_MS)
  }

  const restingOffset = (side: Side | null) =>
    side === "leading"
      ? extentOf("leading")
      : side === "trailing"
        ? -extentOf("trailing")
        : 0

  const offset =
    drag ??
    (committing
      ? (committing.side === "leading" ? 1 : -1) * committing.distance
      : restingOffset(openSide))

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return
    if (
      (event.target as HTMLElement).closest("[data-slot='swipe-actions-more']")
    )
      return
    if (committing) return
    swallowClick.current = false
    if (list && list.open && list.open.id !== id) list.setOpen(null)
    gesture.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      base: restingOffset(openSide),
      axis: null,
      lastX: event.clientX,
      lastT: event.timeStamp,
      velocity: 0,
    }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = gesture.current
    if (!current || current.pointerId !== event.pointerId) return
    const dx = event.clientX - current.x
    const dy = event.clientY - current.y

    if (current.axis === null) {
      if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return
      if (Math.abs(dy) > Math.abs(dx)) {
        gesture.current = null
        return
      }
      current.axis = "x"
      event.currentTarget.setPointerCapture(event.pointerId)
    }

    const elapsed = event.timeStamp - current.lastT
    if (elapsed > 0)
      current.velocity = (event.clientX - current.lastX) / elapsed
    current.lastX = event.clientX
    current.lastT = event.timeStamp

    const raw = current.base + dx
    const side = sideOf(raw)
    const extent = extentOf(side)
    const canArm = fullSwipe && extent > 0
    const nextArmed = canArm && Math.abs(raw) >= thresholdOf(side) ? side : null

    if (nextArmed !== armed) {
      setArmed(nextArmed)
      if (!reduced) {
        setSnapping(true)
        if (snapTimer.current) clearTimeout(snapTimer.current)
        snapTimer.current = setTimeout(() => setSnapping(false), 160)
      }
      if (nextArmed) navigator.vibrate?.(8)
    }

    setDrag(nextArmed ? raw : rubber(raw, extent, reduced))
  }

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = gesture.current
    gesture.current = null
    if (!current || current.axis !== "x" || drag === null) return
    swallowClick.current = event.type === "pointerup"
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (armed && event.type === "pointerup") {
      commit(armed)
      return
    }

    setArmed(null)
    setDrag(null)
    const side = sideOf(drag)
    const extent = extentOf(side)
    const flick =
      Math.abs(current.velocity) > 0.5 &&
      Math.sign(current.velocity) === Math.sign(drag)
    const opened = extent > 0 && (Math.abs(drag) > extent / 2 || flick)
    setOpenSide(opened && event.type === "pointerup" ? side : null)
  }

  const handleClickCapture = (event: React.MouseEvent) => {
    if (
      (event.target as HTMLElement).closest("[data-slot='swipe-actions-more']")
    )
      return
    // A drag ends with a click on whatever was under it. That click belongs to
    // the swipe, and so does the tap that closes an open row.
    if (swallowClick.current) {
      swallowClick.current = false
      event.preventDefault()
      event.stopPropagation()
      return
    }
    if (openSide) {
      event.preventDefault()
      event.stopPropagation()
      setOpenSide(null)
    }
  }

  const all = [...leading, ...trailing]
  const menuItems = () =>
    Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>("[role='menuitem']") ?? []
    )

  const closeMenu = (refocus: boolean) => {
    setMenu(null)
    if (refocus) moreRef.current?.focus()
  }

  const openMenu = () => {
    const rect = moreRef.current?.getBoundingClientRect()
    if (!rect) return
    setOpenSide(null)
    const right = document.documentElement.clientWidth - rect.right
    const roomBelow = window.innerHeight - rect.bottom
    setMenu(
      roomBelow < (leading.length + trailing.length) * 40 + 24
        ? { bottom: window.innerHeight - rect.top + 4, right }
        : { top: rect.bottom + 4, right }
    )
  }

  const handleMenuKeyDown = (event: React.KeyboardEvent) => {
    const items = menuItems()
    const at = items.indexOf(document.activeElement as HTMLElement)
    const focusAt = (index: number) =>
      items[(index + items.length) % items.length]?.focus()

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        focusAt(at + 1)
        break
      case "ArrowUp":
        event.preventDefault()
        focusAt(at - 1)
        break
      case "Home":
        event.preventDefault()
        focusAt(0)
        break
      case "End":
        event.preventDefault()
        focusAt(items.length - 1)
        break
      case "Escape":
        event.preventDefault()
        event.stopPropagation()
        closeMenu(true)
        break
      case "Tab":
        closeMenu(false)
        break
    }
  }

  const settling = drag === null || snapping
  const transition =
    settling && !reduced
      ? "transform 220ms cubic-bezier(0.2, 0.9, 0.3, 1.15), width 220ms cubic-bezier(0.2, 0.9, 0.3, 1.15)"
      : "none"
  const revealed = Math.abs(offset)
  const visibleSide = offset > 0 ? "leading" : offset < 0 ? "trailing" : null
  const menuId = `${id}-menu`

  const renderPanel = (side: Side) => {
    const actions = actionsFor(side)
    if (actions.length === 0) return null
    const shown = visibleSide === side
    const ordered = side === "leading" ? actions : [...actions].reverse()
    const edgeIndex = side === "leading" ? 0 : ordered.length - 1
    const takesOver = armed === side || committing?.side === side

    return (
      <div
        aria-hidden={openSide !== side || undefined}
        data-slot="swipe-actions-panel"
        data-side={side}
        className={cn(
          "absolute inset-y-0 flex overflow-hidden",
          side === "leading" ? "left-0" : "right-0"
        )}
        style={{ width: shown ? revealed : 0, transition }}
      >
        {ordered.map((action, index) => {
          const edge = index === edgeIndex
          return (
            <button
              key={action.label}
              type="button"
              tabIndex={openSide === side ? 0 : -1}
              data-slot="swipe-actions-action"
              data-edge={edge ? "" : undefined}
              className={cn(
                "focus-visible:ring-ring flex min-w-0 flex-col items-center justify-center gap-1 overflow-hidden px-2 text-xs font-medium whitespace-nowrap focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
                "transition-[flex-grow] duration-150 motion-reduce:transition-none",
                tones[action.tone ?? "neutral"],
                side === "leading"
                  ? edge
                    ? "items-start pl-5"
                    : ""
                  : edge
                    ? "items-end pr-5"
                    : ""
              )}
              style={{ flexGrow: takesOver ? (edge ? 1 : 0) : 1, flexBasis: 0 }}
              onClick={() => run(action)}
            >
              {action.icon ? (
                <span aria-hidden="true" className="[&_svg]:size-5">
                  {action.icon}
                </span>
              ) : null}
              <span className="truncate">{action.label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <li
      ref={rowRef}
      data-slot="swipe-actions-item"
      data-state={openSide ? "open" : committing ? "committing" : "closed"}
      data-side={openSide ?? undefined}
      className={cn("group/swipe relative", className)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && openSide) {
          event.preventDefault()
          setOpenSide(null)
        }
      }}
      {...itemProps}
    >
      <div className="relative overflow-hidden">
        {renderPanel("leading")}
        {renderPanel("trailing")}

        <div
          ref={contentRef}
          data-slot="swipe-actions-content"
          className="bg-background relative flex touch-pan-y items-center select-none"
          style={{ transform: `translate3d(${offset}px, 0, 0)`, transition }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onClickCapture={handleClickCapture}
          onDragStart={(event) => event.preventDefault()}
        >
          <div className="min-w-0 flex-1">{children}</div>
          {all.length > 0 ? (
            <button
              ref={moreRef}
              type="button"
              aria-label={`${moreLabel} for ${label}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={menuOpen ? menuId : undefined}
              data-slot="swipe-actions-more"
              className={cn(
                "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring mr-2 inline-flex size-8 shrink-0 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none",
                "transition-opacity duration-150 motion-reduce:transition-none",
                menuOpen
                  ? "opacity-100"
                  : "opacity-0 group-hover/swipe:opacity-100 focus-visible:opacity-100"
              )}
              onClick={() => (menuOpen ? closeMenu(false) : openMenu())}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" && !menuOpen) {
                  event.preventDefault()
                  openMenu()
                }
              }}
            >
              <MoreHorizontal aria-hidden="true" size={16} />
            </button>
          ) : null}
        </div>
      </div>

      {menu
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label={`${moreLabel} for ${label}`}
              data-slot="swipe-actions-menu"
              className="bg-popover text-popover-foreground border-border fixed z-50 grid min-w-40 gap-0.5 rounded-md border p-1 shadow-lg"
              style={menu}
              onKeyDown={handleMenuKeyDown}
            >
              {all.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  className={cn(
                    "hover:bg-muted focus-visible:bg-muted flex min-h-9 items-center gap-2 rounded-sm px-2 text-left text-sm focus-visible:outline-none [&_svg]:size-4",
                    action.tone === "destructive" && "text-destructive"
                  )}
                  onClick={() => {
                    closeMenu(true)
                    action.onSelect()
                  }}
                >
                  {action.icon ? (
                    <span aria-hidden="true">{action.icon}</span>
                  ) : null}
                  {action.label}
                </button>
              ))}
            </div>,
            document.body
          )
        : null}
    </li>
  )
}
