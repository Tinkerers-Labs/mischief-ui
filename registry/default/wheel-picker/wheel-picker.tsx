"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type WheelPickerOption = {
  value: string
  label: string
}

export type WheelPickerProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue" | "children"
> & {
  options: readonly WheelPickerOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** The accessible name, such as Hour or Shoe size. */
  label: string
  /** Runs past the last option back to the first, like the minutes on a clock. */
  loop?: boolean
  /** Rows on screen at once. Odd, so one sits in the middle. */
  visibleCount?: number
  itemHeight?: number
  disabled?: boolean
  /** Submits the chosen value with a form under this name. */
  name?: string
}

export type WheelPickerGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  /** The accessible name for the set, such as Start time. */
  label: string
  /** Shared by every wheel inside, so their rows line up. */
  visibleCount?: number
  itemHeight?: number
}

type GroupContext = { visibleCount?: number; itemHeight?: number }

const WheelGroupContext = React.createContext<GroupContext | null>(null)

const SETTLE_DELAY = 120
const TYPEAHEAD_RESET = 700

const mod = (value: number, size: number) => ((value % size) + size) % size

const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)")
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

const readReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * A spinning list for one value out of a long ordered set: an hour, a year, a
 * shoe size. Scrolling is the browser's own, snapped to rows, so a flick on a
 * phone or a trackpad carries the momentum people expect.
 */
export function WheelPicker({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  loop = false,
  visibleCount: visibleCountProp,
  itemHeight: itemHeightProp,
  disabled,
  name,
  className,
  style,
  ...rootProps
}: WheelPickerProps) {
  const group = React.useContext(WheelGroupContext)
  const visibleCount = Math.max(
    3,
    (visibleCountProp ?? group?.visibleCount ?? 5) | 1
  )
  const itemHeight = itemHeightProp ?? group?.itemHeight ?? 36
  const count = options.length

  const [uncontrolled, setUncontrolled] = React.useState(
    defaultValue ?? options[0]?.value
  )
  const selectedValue = value ?? uncontrolled
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === selectedValue)
  )
  const selected = options[selectedIndex]

  // Enough copies that a hard flick runs out of momentum before it runs out
  // of rows; the wheel is quietly moved back to the middle copy once it rests.
  const copies = loop && count > 0 ? Math.max(3, Math.ceil(90 / count)) | 1 : 1
  const middle = Math.floor(copies / 2)
  const rows = count * copies

  const reduced = React.useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false
  )

  const scroller = React.useRef<HTMLDivElement>(null)
  const items = React.useRef<(HTMLDivElement | null)[]>([])
  const painted = React.useRef(new Set<number>())
  const frame = React.useRef(0)
  const settleTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const touching = React.useRef(false)
  const drag = React.useRef<{
    startY: number
    startTop: number
    lastY: number
    lastTime: number
    velocity: number
    moved: boolean
  } | null>(null)
  const suppressClick = React.useRef(false)
  const typeahead = React.useRef({ text: "", time: 0 })

  const paint = React.useCallback(() => {
    const element = scroller.current
    if (!element) return

    const position = element.scrollTop / itemHeight
    // The drum's radius is half the window, so the last visible row sits at
    // ninety degrees and the wheel never shows its back.
    const step = 2 / visibleCount
    const radius = (visibleCount * itemHeight) / 2
    const reach = Math.ceil(Math.PI / 2 / step) + 1
    const first = Math.max(0, Math.floor(position) - reach)
    const last = Math.min(rows - 1, Math.ceil(position) + reach)
    const next = new Set<number>()

    for (let index = first; index <= last; index++) {
      const item = items.current[index]
      if (!item) continue
      next.add(index)

      const offset = index - position
      const distance = Math.abs(offset)

      if (reduced) {
        item.style.transform = ""
        item.style.visibility = ""
        item.style.opacity = String(Math.max(0.25, 1 - distance * 0.3))
        continue
      }

      const angle = offset * step
      if (Math.abs(angle) >= Math.PI / 2) {
        item.style.visibility = "hidden"
        continue
      }

      const lift = radius * Math.sin(angle) - offset * itemHeight
      const depth = radius * (Math.cos(angle) - 1)
      item.style.visibility = ""
      item.style.opacity = String(Math.max(0.2, Math.cos(angle) ** 1.5))
      item.style.transform = `translateY(${lift}px) translateZ(${depth}px) rotateX(${-angle}rad)`
    }

    for (const index of painted.current) {
      if (next.has(index)) continue
      const item = items.current[index]
      if (item) item.style.visibility = "hidden"
    }

    painted.current = next
  }, [itemHeight, reduced, rows, visibleCount])

  const rowFor = React.useCallback(
    (index: number) => (loop ? middle * count + index : index),
    [count, loop, middle]
  )

  const scrollToRow = React.useCallback(
    (row: number, behavior: ScrollBehavior) => {
      scroller.current?.scrollTo({ top: row * itemHeight, behavior })
      if (behavior === "instant") paint()
    },
    [itemHeight, paint]
  )

  const commit = (index: number) => {
    const option = options[index]
    if (!option || option.value === selectedValue) return
    if (value === undefined) setUncontrolled(option.value)
    onValueChange?.(option.value)
  }

  const settle = () => {
    const element = scroller.current
    if (!element || touching.current || drag.current || count === 0) return

    element.style.scrollSnapType = ""
    const row = Math.min(
      rows - 1,
      Math.max(0, Math.round(element.scrollTop / itemHeight))
    )
    const index = mod(row, count)

    if (loop && row !== rowFor(index)) scrollToRow(rowFor(index), "instant")
    commit(index)
  }

  const scheduleSettle = () => {
    if (settleTimer.current) clearTimeout(settleTimer.current)
    settleTimer.current = setTimeout(settle, SETTLE_DELAY)
  }

  React.useLayoutEffect(() => {
    const element = scroller.current
    if (!element || count === 0) return

    const current = Math.round(element.scrollTop / itemHeight)
    if (mod(current, count) !== selectedIndex || current >= rows) {
      scrollToRow(rowFor(selectedIndex), "instant")
    } else {
      paint()
    }
  }, [count, itemHeight, paint, rowFor, rows, scrollToRow, selectedIndex])

  React.useEffect(
    () => () => {
      cancelAnimationFrame(frame.current)
      if (settleTimer.current) clearTimeout(settleTimer.current)
    },
    []
  )

  const moveTo = (index: number) => {
    if (count === 0) return
    scrollToRow(rowFor(index), "instant")
    commit(index)
  }

  const findByText = (typed: string) => {
    const now = Date.now()
    const state = typeahead.current
    state.text = now - state.time > TYPEAHEAD_RESET ? typed : state.text + typed
    state.time = now

    const query = state.text.toLowerCase()
    const repeated = [...query].every((character) => character === query[0])
    // Pressing the same letter again walks through everything that starts
    // with it, the way a native select does.
    const needle = repeated ? query[0]! : query
    const start = repeated ? selectedIndex + 1 : selectedIndex

    for (let offset = 0; offset < count; offset++) {
      const index = mod(start + offset, count)
      if (options[index]!.label.toLowerCase().startsWith(needle)) return index
    }
    return -1
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    const page = visibleCount
    const moves: Record<string, number> = {
      ArrowUp: selectedIndex - 1,
      ArrowDown: selectedIndex + 1,
      PageUp: selectedIndex - page,
      PageDown: selectedIndex + page,
      Home: 0,
      End: count - 1,
    }

    if (event.key in moves) {
      event.preventDefault()
      const target = moves[event.key]!
      const wraps = loop && event.key.startsWith("Arrow")
      moveTo(
        wraps ? mod(target, count) : Math.min(count - 1, Math.max(0, target))
      )
      return
    }

    if (
      event.key.length === 1 &&
      event.key !== " " &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey
    ) {
      const index = findByText(event.key)
      if (index >= 0) {
        event.preventDefault()
        moveTo(index)
      }
    }
  }

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    suppressClick.current = false
    if (disabled || event.pointerType !== "mouse" || event.button !== 0) return
    const element = scroller.current
    if (!element) return

    drag.current = {
      startY: event.clientY,
      startTop: element.scrollTop,
      lastY: event.clientY,
      lastTime: event.timeStamp,
      velocity: 0,
      moved: false,
    }
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current
    const element = scroller.current
    if (!state || !element) return

    const travelled = event.clientY - state.startY
    if (!state.moved && Math.abs(travelled) < 4) return

    if (!state.moved) {
      state.moved = true
      element.setPointerCapture(event.pointerId)
      // Snapping would pull every assigned scrollTop back to a row, which
      // turns a drag into a stutter. It comes back once the wheel rests.
      element.style.scrollSnapType = "none"
    }

    const elapsed = Math.max(1, event.timeStamp - state.lastTime)
    state.velocity = (event.clientY - state.lastY) / elapsed
    state.lastY = event.clientY
    state.lastTime = event.timeStamp
    element.scrollTop = state.startTop - travelled
  }

  const onPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current
    const element = scroller.current
    drag.current = null
    if (!state || !element || !state.moved) return

    suppressClick.current = true
    // A flick carries on a little, never more than one window of rows.
    const reach = visibleCount * itemHeight
    const held = event.timeStamp - state.lastTime > 80
    const carry = held
      ? 0
      : Math.max(-reach, Math.min(reach, state.velocity * 120))
    const thrown = element.scrollTop - carry
    const row = Math.min(rows - 1, Math.max(0, Math.round(thrown / itemHeight)))
    scrollToRow(row, reduced ? "instant" : "smooth")
    scheduleSettle()
  }

  return (
    <div
      data-slot="wheel-picker"
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "has-[:focus-visible]:ring-ring relative min-w-14 rounded-md select-none has-[:focus-visible]:ring-2 data-disabled:opacity-50",
        group && "flex-1",
        className
      )}
      style={{ height: visibleCount * itemHeight, ...style }}
      {...rootProps}
    >
      {group ? null : (
        <div
          aria-hidden="true"
          data-slot="wheel-picker-band"
          className="bg-muted pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-md"
          style={{ height: itemHeight }}
        />
      )}

      <div
        ref={scroller}
        role="spinbutton"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={Math.max(0, count - 1)}
        aria-valuenow={selectedIndex}
        aria-valuetext={selected?.label}
        aria-disabled={disabled || undefined}
        data-slot="wheel-picker-scroller"
        className={cn(
          "relative h-full snap-y snap-mandatory [scrollbar-width:none] overflow-y-scroll overscroll-contain outline-none [&::-webkit-scrollbar]:hidden",
          disabled ? "pointer-events-none overflow-hidden" : "cursor-grab"
        )}
        style={{
          paddingBlock: ((visibleCount - 1) / 2) * itemHeight,
          perspective: visibleCount * itemHeight * 3,
          maskImage:
            "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
        }}
        onKeyDown={onKeyDown}
        onScroll={() => {
          cancelAnimationFrame(frame.current)
          frame.current = requestAnimationFrame(paint)
          scheduleSettle()
        }}
        onTouchStart={() => {
          touching.current = true
        }}
        onTouchEnd={() => {
          touching.current = false
          scheduleSettle()
        }}
        onTouchCancel={() => {
          touching.current = false
          scheduleSettle()
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <div aria-hidden="true">
          {Array.from({ length: rows }, (_, row) => {
            const option = options[row % count]!
            return (
              <div
                key={row}
                ref={(node) => {
                  items.current[row] = node
                }}
                data-slot="wheel-picker-item"
                data-selected={row % count === selectedIndex ? "" : undefined}
                className="text-foreground flex snap-center items-center justify-center px-3 text-base tabular-nums [backface-visibility:hidden] data-selected:font-semibold"
                style={{ height: itemHeight }}
                onClick={() => {
                  if (suppressClick.current || disabled) return
                  scrollToRow(row, reduced ? "instant" : "smooth")
                  scheduleSettle()
                }}
              >
                {option.label}
              </div>
            )
          })}
        </div>
      </div>

      {name ? (
        <input type="hidden" name={name} value={selected?.value ?? ""} />
      ) : null}
    </div>
  )
}

/**
 * Wheels side by side behind one selection band, for a value made of parts:
 * hours, minutes, and AM or PM. Left and right arrows move between them.
 */
export function WheelPickerGroup({
  label,
  visibleCount = 5,
  itemHeight = 36,
  className,
  children,
  onKeyDown,
  ...rootProps
}: WheelPickerGroupProps) {
  const context = React.useMemo(
    () => ({ visibleCount: Math.max(3, visibleCount | 1), itemHeight }),
    [itemHeight, visibleCount]
  )

  return (
    <WheelGroupContext.Provider value={context}>
      <div
        role="group"
        aria-label={label}
        data-slot="wheel-picker-group"
        className={cn("relative flex items-stretch gap-1", className)}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented) return
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return

          const wheels = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              '[role="spinbutton"]:not([aria-disabled="true"])'
            )
          )
          const at = wheels.indexOf(event.target as HTMLElement)
          if (at < 0) return

          const next = wheels[at + (event.key === "ArrowRight" ? 1 : -1)]
          if (next) {
            event.preventDefault()
            next.focus()
          }
        }}
        {...rootProps}
      >
        <div
          aria-hidden="true"
          data-slot="wheel-picker-band"
          className="bg-muted pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-md"
          style={{ height: context.itemHeight }}
        />
        {children}
      </div>
    </WheelGroupContext.Provider>
  )
}
