"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type RangeHistogramBin = {
  /** Inclusive lower edge. */
  start: number
  /** Upper edge. Only the last bin includes it. */
  end: number
  count: number
}

export type RangeHistogramValue = [number, number]

export interface RangeHistogramProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange"
> {
  /** Names the control and both handles. */
  label: string
  /** The raw values being filtered. The count is exact. */
  values?: readonly number[]
  /** Counts the host already has. Used when values is not given. */
  bins?: readonly RangeHistogramBin[]
  /** How many bars values are grouped into. Defaults to 24. */
  binCount?: number
  /** Defaults to the lowest value or the first bin's start. */
  min?: number
  /** Defaults to the highest value or the last bin's end. */
  max?: number
  step?: number
  /** One press of Page Up, Page Down, or a Shift+arrow. Defaults to ten steps. */
  largeStep?: number
  value?: RangeHistogramValue
  defaultValue?: RangeHistogramValue
  /** Fires on every movement. */
  onValueChange?: (value: RangeHistogramValue) => void
  /** Fires when a drag ends, a key is released, or an input is committed. */
  onValueCommit?: (value: RangeHistogramValue) => void
  /** Writes a value for the readout and for each handle's aria-valuetext. */
  formatValue?: (value: number) => string
  /** The line under the chart. */
  formatCount?: (count: number, total: number) => string
  /** Shows a minimum and maximum number field below the chart. */
  inputs?: boolean
  disabled?: boolean
}

type Thumb = 0 | 1

function decimalsOf(step: number) {
  const text = String(step)
  const dot = text.indexOf(".")
  return dot === -1 ? 0 : text.length - dot - 1
}

function binValues(
  values: readonly number[],
  min: number,
  max: number,
  count: number
): RangeHistogramBin[] {
  const size = (max - min) / count || 1
  const bins = Array.from({ length: count }, (_, index) => ({
    start: min + index * size,
    end: index === count - 1 ? max : min + (index + 1) * size,
    count: 0,
  }))

  for (const value of values) {
    if (value < min || value > max) continue
    const index = Math.min(Math.floor((value - min) / size), count - 1)
    const bin = bins[index]
    if (bin) bin.count += 1
  }

  return bins
}

/** The share of a bin that lies inside [low, high], from 0 to 1. */
function coverage(bin: RangeHistogramBin, low: number, high: number) {
  const width = bin.end - bin.start
  if (width <= 0) return bin.start >= low && bin.start <= high ? 1 : 0
  const overlap = Math.min(bin.end, high) - Math.max(bin.start, low)
  return Math.min(Math.max(overlap / width, 0), 1)
}

const defaultFormat = (value: number) => value.toLocaleString()
const defaultCount = (count: number, total: number) =>
  `${count.toLocaleString()} of ${total.toLocaleString()} results`

/**
 * A two-handle range filter drawn over the distribution it filters, so the
 * person choosing a price or a duration can see where the results actually
 * are before they cut them off.
 */
export const RangeHistogram = React.forwardRef<
  HTMLDivElement,
  RangeHistogramProps
>(function RangeHistogram(
  {
    label,
    values,
    bins: binsProp,
    binCount = 24,
    min: minProp,
    max: maxProp,
    step = 1,
    largeStep: largeStepProp,
    value: valueProp,
    defaultValue,
    onValueChange,
    onValueCommit,
    formatValue = defaultFormat,
    formatCount = defaultCount,
    inputs = false,
    disabled = false,
    className,
    ...rootProps
  },
  forwardedRef
) {
  const id = React.useId()
  const labelId = `${id}-label`
  const trackRef = React.useRef<HTMLDivElement>(null)
  const thumbRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const decimals = decimalsOf(step)
  const largeStep = largeStepProp ?? step * 10

  const [min, max] = React.useMemo(() => {
    if (minProp !== undefined && maxProp !== undefined)
      return [minProp, maxProp]
    let low = Infinity
    let high = -Infinity
    if (values?.length) {
      for (const value of values) {
        if (value < low) low = value
        if (value > high) high = value
      }
      low = Math.floor(low / step) * step
      high = Math.ceil(high / step) * step
    } else if (binsProp?.length) {
      low = binsProp[0]?.start ?? 0
      high = binsProp[binsProp.length - 1]?.end ?? 0
    } else {
      low = 0
      high = 100
    }
    return [minProp ?? low, maxProp ?? Math.max(high, low + step)]
  }, [binsProp, maxProp, minProp, step, values])

  const bins = React.useMemo(
    () =>
      values
        ? binValues(values, min, max, Math.max(1, Math.round(binCount)))
        : (binsProp ?? []),
    [binCount, binsProp, max, min, values]
  )

  const snap = React.useCallback(
    (raw: number) => {
      const stepped = min + Math.round((raw - min) / step) * step
      const clamped = Math.min(Math.max(stepped, min), max)
      return Number(clamped.toFixed(decimals))
    },
    [decimals, max, min, step]
  )

  const [internal, setInternal] = React.useState<RangeHistogramValue>(
    () => defaultValue ?? [min, max]
  )
  const raw = valueProp ?? internal
  const low = snap(Math.min(raw[0], raw[1]))
  const high = snap(Math.max(raw[0], raw[1]))
  const current = React.useRef<RangeHistogramValue>([low, high])
  current.current = [low, high]

  const [active, setActive] = React.useState<Thumb | null>(null)
  const [dragging, setDragging] = React.useState(false)
  const [drafts, setDrafts] = React.useState<[string | null, string | null]>([
    null,
    null,
  ])
  const [announced, setAnnounced] = React.useState("")

  const total = React.useMemo(
    () =>
      values ? values.length : bins.reduce((sum, bin) => sum + bin.count, 0),
    [bins, values]
  )

  const countOf = React.useCallback(
    (from: number, to: number) => {
      if (values) {
        let inside = 0
        for (const value of values)
          if (value >= from && value <= to) inside += 1
        return inside
      }
      // Without raw values a partly covered bin can only be estimated, on the
      // assumption that its items are spread evenly across it.
      return Math.round(
        bins.reduce((sum, bin) => sum + bin.count * coverage(bin, from, to), 0)
      )
    },
    [bins, values]
  )

  const count = React.useMemo(() => countOf(low, high), [countOf, high, low])
  const tallest = Math.max(1, ...bins.map((bin) => bin.count))
  const span = max - min || 1
  const percent = (value: number) => ((value - min) / span) * 100

  const commit = (next: RangeHistogramValue) => {
    onValueCommit?.(next)
    setAnnounced(formatCount(countOf(next[0], next[1]), total))
  }

  const setThumb = (thumb: Thumb, rawValue: number) => {
    const [from, to] = current.current
    const value =
      thumb === 0
        ? Math.min(snap(rawValue), to)
        : Math.max(snap(rawValue), from)
    const next: RangeHistogramValue = thumb === 0 ? [value, to] : [from, value]
    if (next[0] === from && next[1] === to) return next
    current.current = next
    if (valueProp === undefined) setInternal(next)
    onValueChange?.(next)
    return next
  }

  const valueAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return min
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
    return min + ratio * span
  }

  const pick = (target: number): Thumb => {
    const [from, to] = current.current
    if (from === to) return target < from ? 0 : 1
    return Math.abs(target - from) <= Math.abs(target - to) ? 0 : 1
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || (event.pointerType === "mouse" && event.button !== 0))
      return
    event.preventDefault()
    const target = valueAt(event.clientX)
    const thumb = pick(target)
    event.currentTarget.setPointerCapture(event.pointerId)
    setActive(thumb)
    setDragging(true)
    setThumb(thumb, target)
    thumbRefs.current[thumb]?.focus({ preventScroll: true })
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || active === null) return
    setThumb(active, valueAt(event.clientX))
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setDragging(false)
    commit(current.current)
  }

  const handleKeyDown = (thumb: Thumb, event: React.KeyboardEvent) => {
    if (disabled) return
    const value = current.current[thumb]
    const small = event.shiftKey ? largeStep : step
    const [from, to] = current.current
    let next: number | null = null

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        next = value - small
        break
      case "ArrowRight":
      case "ArrowUp":
        next = value + small
        break
      case "PageDown":
        next = value - largeStep
        break
      case "PageUp":
        next = value + largeStep
        break
      case "Home":
        next = thumb === 0 ? min : from
        break
      case "End":
        next = thumb === 0 ? to : max
        break
    }

    if (next === null) return
    event.preventDefault()
    setThumb(thumb, next)
  }

  const handleKeyUp = (event: React.KeyboardEvent) => {
    if (
      [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
      ].includes(event.key)
    ) {
      commit(current.current)
    }
  }

  const commitDraft = (thumb: Thumb) => {
    const draft = drafts[thumb]
    setDrafts((existing) =>
      thumb === 0 ? [null, existing[1]] : [existing[0], null]
    )
    if (draft === null || draft.trim() === "") return
    const parsed = Number(draft)
    if (Number.isNaN(parsed)) return
    commit(setThumb(thumb, parsed))
  }

  const names = [`${label} minimum`, `${label} maximum`] as const
  const thumbValues = [low, high] as const

  return (
    <div
      ref={forwardedRef}
      role="group"
      aria-labelledby={labelId}
      data-slot="range-histogram"
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "text-foreground grid w-full gap-3 data-disabled:opacity-50",
        className
      )}
      {...rootProps}
    >
      <div className="flex items-baseline justify-between gap-4">
        <span id={labelId} className="text-sm font-medium">
          {label}
        </span>
        <span
          data-slot="range-histogram-output"
          className="font-mono text-sm font-semibold tabular-nums"
        >
          {formatValue(low)} to {formatValue(high)}
        </span>
      </div>

      <div
        data-slot="range-histogram-control"
        data-dragging={dragging ? "" : undefined}
        className={cn(
          "relative touch-none px-2.5 select-none",
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          aria-hidden="true"
          data-slot="range-histogram-bars"
          className="flex h-16 items-end gap-px"
        >
          {bins.map((bin, index) => {
            const share = coverage(bin, low, high)
            const from = Math.min(
              Math.max((low - bin.start) / (bin.end - bin.start || 1), 0),
              1
            )
            return (
              <div
                key={index}
                data-slot="range-histogram-bar"
                data-inside={share === 1 ? "" : undefined}
                className="bg-muted-foreground/20 relative min-w-0 flex-1 overflow-hidden rounded-t-[3px] transition-[height] duration-200 motion-reduce:transition-none"
                style={{
                  height:
                    bin.count === 0
                      ? 0
                      : `max(3px, ${(bin.count / tallest) * 100}%)`,
                }}
              >
                {share > 0 ? (
                  <div
                    className="bg-primary absolute inset-y-0"
                    style={{ left: `${from * 100}%`, width: `${share * 100}%` }}
                  />
                ) : null}
              </div>
            )
          })}
        </div>

        <div
          ref={trackRef}
          data-slot="range-histogram-track"
          className="bg-muted relative mt-2 h-1.5 rounded-full"
        >
          <div
            className="bg-primary absolute inset-y-0 rounded-full"
            style={{
              left: `${percent(low)}%`,
              width: `${percent(high) - percent(low)}%`,
            }}
          />
          {([0, 1] as const).map((thumb) => {
            const value = thumbValues[thumb]
            return (
              <div
                key={thumb}
                ref={(node) => {
                  thumbRefs.current[thumb] = node
                }}
                role="slider"
                tabIndex={disabled ? -1 : 0}
                aria-label={names[thumb]}
                aria-valuemin={thumb === 0 ? min : low}
                aria-valuemax={thumb === 0 ? high : max}
                aria-valuenow={value}
                aria-valuetext={formatValue(value)}
                aria-orientation="horizontal"
                aria-disabled={disabled || undefined}
                data-slot="range-histogram-thumb"
                data-active={active === thumb ? "" : undefined}
                className={cn(
                  "border-primary bg-background absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-md outline-none",
                  "before:absolute before:-inset-3 before:content-['']",
                  "focus-visible:ring-ring/40 transition-[scale,box-shadow] duration-150 focus-visible:ring-4 motion-reduce:transition-none",
                  active === thumb ? "z-20" : "z-10",
                  dragging && active === thumb && "scale-110"
                )}
                style={{ left: `${percent(value)}%` }}
                onFocus={() => setActive(thumb)}
                onKeyDown={(event) => handleKeyDown(thumb, event)}
                onKeyUp={handleKeyUp}
              />
            )
          })}
        </div>
      </div>

      <p
        data-slot="range-histogram-count"
        className="text-muted-foreground text-sm tabular-nums"
      >
        {formatCount(count, total)}
      </p>
      <span role="status" aria-live="polite" className="sr-only">
        {announced}
      </span>

      {inputs ? (
        <div className="grid grid-cols-2 gap-3">
          {([0, 1] as const).map((thumb) => (
            <label key={thumb} className="grid gap-1.5 text-xs font-medium">
              <span className="text-muted-foreground">
                {thumb === 0 ? "Minimum" : "Maximum"}
              </span>
              <input
                type="number"
                inputMode="decimal"
                disabled={disabled}
                min={thumb === 0 ? min : low}
                max={thumb === 0 ? high : max}
                step={step}
                aria-label={names[thumb]}
                data-slot="range-histogram-input"
                className="border-border bg-background focus-visible:ring-ring min-h-9 w-full rounded-md border px-3 text-sm tabular-nums focus-visible:ring-2 focus-visible:outline-none"
                value={drafts[thumb] ?? String(thumbValues[thumb])}
                onChange={(event) => {
                  const text = event.target.value
                  setDrafts((existing) =>
                    thumb === 0 ? [text, existing[1]] : [existing[0], text]
                  )
                }}
                onBlur={() => commitDraft(thumb)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") commitDraft(thumb)
                }}
              />
            </label>
          ))}
        </div>
      ) : null}
    </div>
  )
})
