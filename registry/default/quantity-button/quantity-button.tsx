"use client"

import * as React from "react"
import { Minus, Plus, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"

export type QuantityButtonProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue" | "children"
> & {
  /** What is being counted, such as Margherita pizza. Used in every name. */
  label: string
  value?: number
  defaultValue?: number
  /**
   * A promise holds the new count as pending until it settles. A rejection
   * puts the last confirmed count back.
   */
  onValueChange?: (value: number) => void | Promise<void>
  /** The count Add jumps to, and the count where minus becomes remove. */
  min?: number
  max?: number
  addLabel?: string
  disabled?: boolean
}

const ROLL = { duration: 220, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }

function isPromise(value: unknown): value is Promise<void> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Promise<void>).then === "function"
  )
}

/**
 * An Add button that turns into a stepper in the same footprint once there is
 * something to count. Removing the last one turns it back, so a list of items
 * keeps one size whatever is in the basket.
 */
export function QuantityButton({
  label,
  value,
  defaultValue = 0,
  onValueChange,
  min = 1,
  max = Number.POSITIVE_INFINITY,
  addLabel = "Add",
  disabled,
  className,
  ...rootProps
}: QuantityButtonProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const [requested, setRequested] = React.useState<number | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const committed = value ?? uncontrolled
  const count = requested ?? committed
  const filled = count > 0
  const pending = requested !== null

  const latest = React.useRef<number | null>(null)
  const inFlight = React.useRef(false)
  const root = React.useRef<HTMLDivElement>(null)
  const addButton = React.useRef<HTMLButtonElement>(null)
  const plusButton = React.useRef<HTMLButtonElement>(null)
  const digits = React.useRef<HTMLSpanElement>(null)

  const [rolled, setRolled] = React.useState({ from: count, to: count })
  if (rolled.to !== count) setRolled({ from: rolled.to, to: count })

  const describe = (next: number) =>
    next === 0 ? `Removed ${label}` : `${label}, ${next}`

  const wait = (next: number, result: Promise<void>) => {
    inFlight.current = true
    result.then(
      () => {
        if (value === undefined) setUncontrolled(next)
        const queued = latest.current
        if (queued !== null && queued !== next) {
          wait(
            queued,
            new Promise((resolve) => resolve(onValueChange?.(queued)))
          )
          return
        }
        latest.current = null
        inFlight.current = false
        setRequested(null)
      },
      () => {
        latest.current = null
        inFlight.current = false
        setRequested(null)
        setAnnouncement(`Could not change ${label}.`)
      }
    )
  }

  const change = (raw: number) => {
    if (disabled) return
    const next = raw <= 0 ? 0 : Math.min(max, Math.max(min, raw))
    if (next === count) return

    setAnnouncement(describe(next))

    // Taps made while a change is on its way are folded into one: only the
    // newest count is sent once the current request settles.
    if (inFlight.current) {
      latest.current = next
      setRequested(next)
      return
    }

    const result = onValueChange?.(next)
    if (isPromise(result)) {
      latest.current = next
      setRequested(next)
      wait(next, result)
    } else if (value === undefined) {
      setUncontrolled(next)
    }
  }

  // Focus follows the shape only when it was already inside, so a count that
  // changes from elsewhere never pulls focus here.
  const shape = React.useRef(filled)
  React.useEffect(() => {
    if (shape.current === filled) return
    shape.current = filled
    if (!root.current?.contains(document.activeElement)) return
    ;(filled ? plusButton : addButton).current?.focus()
  }, [filled])

  React.useLayoutEffect(() => {
    const strip = digits.current
    if (!strip || rolled.from === 0 || rolled.to === 0) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const direction = rolled.to > rolled.from ? 1 : -1
    for (const place of strip.querySelectorAll<HTMLElement>("[data-changed]")) {
      place.querySelector("[data-digit=current]")?.animate?.(
        [
          { transform: `translateY(${direction * 100}%)`, opacity: 0 },
          { transform: "translateY(0)", opacity: 1 },
        ],
        ROLL
      )
      place.querySelector("[data-digit=previous]")?.animate?.(
        [
          { transform: "translateY(0)", opacity: 1 },
          { transform: `translateY(${-direction * 100}%)`, opacity: 0 },
        ],
        ROLL
      )
    }
  }, [rolled])

  // Nothing rolls in from zero or out to it: the whole count fades instead.
  const now = String(rolled.to || rolled.from)
  const before = rolled.from && rolled.to ? String(rolled.from) : now
  const places = Math.max(now.length, before.length)
  const atMin = count <= min
  const atMax = count >= max

  const part =
    "focus-visible:ring-ring relative inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-[opacity,transform] duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none aria-disabled:cursor-not-allowed aria-disabled:opacity-40"

  return (
    <div
      ref={root}
      role="group"
      aria-label={label}
      aria-busy={pending || undefined}
      data-slot="quantity-button"
      data-state={filled ? "filled" : "empty"}
      data-pending={pending ? "" : undefined}
      className={cn(
        "bg-primary text-primary-foreground relative inline-flex h-11 w-[7.5rem] items-center overflow-hidden rounded-full",
        disabled && "opacity-50",
        className
      )}
      {...rootProps}
    >
      <button
        ref={addButton}
        type="button"
        data-slot="quantity-button-add"
        aria-label={`${addLabel} ${label}`}
        aria-hidden={filled || undefined}
        tabIndex={filled ? -1 : undefined}
        disabled={disabled}
        onClick={() => change(min)}
        className={cn(
          "focus-visible:ring-ring absolute inset-0 inline-flex items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-[opacity,transform] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none",
          filled ? "pointer-events-none scale-95 opacity-0" : "opacity-100"
        )}
      >
        <Plus aria-hidden="true" size={16} strokeWidth={2.5} />
        {addLabel}
      </button>

      <div
        aria-hidden={!filled || undefined}
        className={cn(
          "flex w-full items-center justify-between",
          !filled && "pointer-events-none"
        )}
      >
        <button
          type="button"
          data-slot="quantity-button-decrement"
          tabIndex={filled ? undefined : -1}
          aria-label={atMin ? `Remove ${label}` : `One fewer ${label}`}
          aria-disabled={disabled || undefined}
          onClick={() => change(atMin ? 0 : count - 1)}
          className={cn(
            part,
            filled ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
          )}
        >
          <Minus
            aria-hidden="true"
            size={16}
            strokeWidth={2.5}
            className={cn(
              "absolute transition-[opacity,transform] duration-150 motion-reduce:transition-none",
              atMin ? "scale-50 opacity-0" : "opacity-100"
            )}
          />
          <Trash2
            aria-hidden="true"
            size={16}
            strokeWidth={2.25}
            className={cn(
              "absolute transition-[opacity,transform] duration-150 motion-reduce:transition-none",
              atMin ? "opacity-100" : "scale-50 opacity-0"
            )}
          />
        </button>

        <span
          role="spinbutton"
          tabIndex={filled ? 0 : -1}
          aria-label={`${label} quantity`}
          aria-valuenow={count}
          aria-valuemin={min}
          aria-valuemax={Number.isFinite(max) ? max : undefined}
          aria-disabled={disabled || undefined}
          data-slot="quantity-button-count"
          onKeyDown={(event) => {
            const moves: Record<string, number> = {
              ArrowUp: count + 1,
              ArrowRight: count + 1,
              ArrowDown: Math.max(min, count - 1),
              ArrowLeft: Math.max(min, count - 1),
              Home: min,
            }
            if (Number.isFinite(max)) moves.End = max
            if (!(event.key in moves)) return
            event.preventDefault()
            change(moves[event.key]!)
          }}
          className={cn(
            "focus-visible:ring-ring min-w-6 rounded-md px-1 text-center text-sm font-semibold tabular-nums transition-opacity duration-200 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
            filled ? "opacity-100" : "opacity-0",
            pending && "opacity-70"
          )}
        >
          <span
            ref={digits}
            aria-hidden="true"
            className="inline-flex justify-center"
          >
            {Array.from({ length: places }, (_, place) => {
              const current = now[now.length - places + place] ?? ""
              const previous = before[before.length - places + place] ?? ""
              return (
                <span
                  key={places - place}
                  data-changed={current !== previous ? "" : undefined}
                  className="relative inline-block overflow-hidden"
                >
                  <span data-digit="current" className="inline-block">
                    {current}
                  </span>
                  <span
                    data-digit="previous"
                    className="absolute inset-0 opacity-0"
                  >
                    {previous}
                  </span>
                </span>
              )
            })}
          </span>
        </span>

        <button
          ref={plusButton}
          type="button"
          data-slot="quantity-button-increment"
          tabIndex={filled ? undefined : -1}
          aria-label={`One more ${label}`}
          aria-disabled={disabled || atMax || undefined}
          onClick={() => change(count + 1)}
          className={cn(
            part,
            filled ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
          )}
        >
          <Plus aria-hidden="true" size={16} strokeWidth={2.5} />
        </button>
      </div>

      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  )
}
