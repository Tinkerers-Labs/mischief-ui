"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type MetricPoint = {
  /** A calendar day as YYYY-MM-DD, or any ISO date. Shown in UTC. */
  date: string
  value: number
}

export type MetricPeriod = { value: string; label: string }

export type MetricCardProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  label: string
  /** One point per day of the current period, oldest first. */
  data: readonly MetricPoint[]
  /** The headline. Defaults to the sum of the data. */
  value?: number
  /** The same measure for the period before, for the change. */
  previous?: number
  /** Which way is good news. Decides which change reads as a warning. */
  goodDirection?: "up" | "down"
  /** Follows the change. Defaults to "vs previous period". */
  comparisonLabel?: string
  /** Passed to Intl.NumberFormat for the headline and every day. */
  format?: Intl.NumberFormatOptions
  /** Passed to Intl.DateTimeFormat for the day being read. */
  dateFormat?: Intl.DateTimeFormatOptions
  locale?: string
  /** Shows a segmented control. The host swaps the data when it changes. */
  periods?: readonly MetricPeriod[]
  period?: string
  defaultPeriod?: string
  onPeriodChange?: (period: string) => void
  /** Any CSS colour. Defaults to the theme's first chart colour, then primary. */
  color?: string
  /** Height of the chart in pixels. */
  chartHeight?: number
}

const VIEW_WIDTH = 1000
const TOP = 8

const DAY_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "short",
  day: "numeric",
}

function RollingNumber({ text, still }: { text: string; still: boolean }) {
  const characters = text.split("")

  return (
    <span aria-hidden="true" className="inline-flex tabular-nums">
      {characters.map((character, index) => {
        const key = characters.length - index
        if (!/[0-9]/.test(character)) {
          return (
            <span className="inline-block" key={`${key}${character}`}>
              {character}
            </span>
          )
        }
        return (
          <span
            className="relative inline-block h-[1em] overflow-hidden"
            key={key}
          >
            <span className="invisible">0</span>
            <span
              className={cn(
                "absolute inset-x-0 top-0 flex flex-col",
                !still &&
                  "transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none"
              )}
              data-digit={character}
              style={{ transform: `translateY(-${Number(character)}em)` }}
            >
              {Array.from({ length: 10 }, (_, digit) => (
                <span className="h-[1em]" key={digit}>
                  {digit}
                </span>
              ))}
            </span>
          </span>
        )
      })}
    </span>
  )
}

export function MetricCard({
  label,
  data,
  value,
  previous,
  goodDirection = "up",
  comparisonLabel = "vs previous period",
  format,
  dateFormat = DAY_FORMAT,
  locale,
  periods,
  period,
  defaultPeriod,
  onPeriodChange,
  color = "var(--chart-1, var(--primary))",
  chartHeight = 96,
  className,
  ...rootProps
}: MetricCardProps) {
  const id = React.useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const [active, setActive] = React.useState<number | null>(null)
  const [ownPeriod, setOwnPeriod] = React.useState(
    defaultPeriod ?? periods?.[0]?.value
  )
  const selectedPeriod = period ?? ownPeriod

  const numbers = React.useMemo(
    () => new Intl.NumberFormat(locale, format),
    [format, locale]
  )
  const signed = React.useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "percent",
        maximumFractionDigits: 1,
        signDisplay: "exceptZero",
      }),
    [locale]
  )
  const percent = React.useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "percent",
        maximumFractionDigits: 1,
      }),
    [locale]
  )
  const dates = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { ...dateFormat, timeZone: "UTC" }),
    [dateFormat, locale]
  )
  const edgeDates = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
    [locale]
  )

  const total = value ?? data.reduce((sum, point) => sum + point.value, 0)
  const point = active === null ? undefined : data[active]
  const scrubbing = point !== undefined
  const headline = scrubbing ? point.value : total

  const change =
    previous !== undefined && previous !== 0
      ? (total - previous) / Math.abs(previous)
      : null
  const direction =
    change === null || change === 0 ? "flat" : change > 0 ? "up" : "down"
  const good = direction === "flat" || direction === goodDirection

  const values = data.map((entry) => entry.value)
  const min = Math.min(0, ...values)
  const max = Math.max(0, ...values)
  const span = max - min || 1
  const x = (index: number) =>
    data.length > 1 ? (index / (data.length - 1)) * VIEW_WIDTH : VIEW_WIDTH / 2
  const y = (amount: number) =>
    TOP + ((max - amount) / span) * (chartHeight - TOP - 1)
  const xPercent = (index: number) => (x(index) / VIEW_WIDTH) * 100

  const line = data
    .map(
      (entry, index) =>
        `${index === 0 ? "M" : "L"}${x(index).toFixed(2)} ${y(entry.value).toFixed(2)}`
    )
    .join(" ")
  const fill =
    data.length > 1 ? `${line} L${VIEW_WIDTH} ${y(0)} L0 ${y(0)} Z` : ""

  const last = data.length - 1
  const reading = active ?? last

  function scrubTo(clientX: number, element: HTMLElement) {
    if (!data.length) return
    const rect = element.getBoundingClientRect()
    const ratio = rect.width ? (clientX - rect.left) / rect.width : 1
    setActive(Math.round(Math.min(Math.max(ratio, 0), 1) * last))
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      setActive(null)
      return
    }
    const steps: Record<string, number | undefined> = {
      ArrowLeft: reading - 1,
      ArrowDown: reading - 1,
      ArrowRight: reading + 1,
      ArrowUp: reading + 1,
      PageDown: reading - 7,
      PageUp: reading + 7,
      Home: 0,
      End: last,
    }
    const next = steps[event.key]
    if (next === undefined) return
    event.preventDefault()
    setActive(Math.min(Math.max(next, 0), last))
  }

  function choosePeriod(next: string) {
    setOwnPeriod(next)
    onPeriodChange?.(next)
  }

  function handlePeriodKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!periods?.length) return
    const index = periods.findIndex((entry) => entry.value === selectedPeriod)
    const offset =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0
    if (!offset) return
    event.preventDefault()
    const target =
      (Math.max(index, 0) + offset + periods.length) % periods.length
    const next = periods[target]
    if (!next) return
    choosePeriod(next.value)
    event.currentTarget
      .querySelectorAll<HTMLElement>('[role="radio"]')
      [target]?.focus()
  }

  const dayText = (index: number) => {
    const entry = data[index]
    return entry ? dates.format(new Date(entry.date)) : ""
  }

  const firstPoint = data[0]
  const lastPoint = data[last]

  return (
    <div
      aria-labelledby={`${id}-label`}
      data-slot="metric-card"
      data-state={scrubbing ? "scrubbing" : "idle"}
      role="group"
      className={cn(
        "bg-card text-card-foreground border-border w-full min-w-0 rounded-xl border p-4 sm:p-5",
        className
      )}
      {...rootProps}
    >
      <div className="flex min-h-7 flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm" id={`${id}-label`}>
          {label}
        </p>
        {periods?.length ? (
          <div
            aria-label="Period"
            className="bg-muted inline-flex rounded-md p-0.5"
            onKeyDown={handlePeriodKeyDown}
            role="radiogroup"
          >
            {periods.map((entry) => {
              const checked = entry.value === selectedPeriod
              return (
                <button
                  aria-checked={checked}
                  className={cn(
                    "focus-visible:ring-ring min-h-6 rounded-[5px] px-2 text-xs font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
                    checked
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  key={entry.value}
                  onClick={() => choosePeriod(entry.value)}
                  role="radio"
                  tabIndex={checked ? 0 : -1}
                  type="button"
                >
                  {entry.label}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>

      <p
        className="mt-1 text-3xl leading-none font-semibold tracking-tight"
        data-slot="metric-card-value"
      >
        <RollingNumber still={scrubbing} text={numbers.format(headline)} />
        <span className="sr-only">{numbers.format(total)}</span>
      </p>

      <div className="mt-2 flex min-h-5 items-center gap-2 text-xs">
        {scrubbing ? (
          <span
            aria-hidden="true"
            className="text-muted-foreground"
            data-slot="metric-card-date"
          >
            {dayText(active ?? 0)}
          </span>
        ) : change !== null ? (
          <>
            <span
              data-good={good || undefined}
              data-slot="metric-card-change"
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium tabular-nums",
                good
                  ? "bg-muted text-foreground"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              <svg
                aria-hidden="true"
                className={cn("size-2.5", direction === "down" && "rotate-180")}
                fill="currentColor"
                viewBox="0 0 10 10"
              >
                {direction === "flat" ? (
                  <rect height="2" rx="1" width="8" x="1" y="4" />
                ) : (
                  <path d="M5 1.5 9 8H1z" />
                )}
              </svg>
              <span aria-hidden="true">{signed.format(change)}</span>
              <span className="sr-only">
                {direction === "flat"
                  ? "Unchanged"
                  : `${direction === "up" ? "Up" : "Down"} ${percent.format(Math.abs(change))}`}
              </span>
            </span>
            <span className="text-muted-foreground">{comparisonLabel}</span>
          </>
        ) : null}
      </div>

      <div className="relative mt-4" style={{ height: chartHeight }}>
        <svg
          aria-hidden="true"
          className="block size-full overflow-visible"
          preserveAspectRatio="none"
          viewBox={`0 0 ${VIEW_WIDTH} ${chartHeight}`}
        >
          <defs>
            <linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="0%"
                style={{ stopColor: color, stopOpacity: 0.22 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: color, stopOpacity: 0 }}
              />
            </linearGradient>
          </defs>
          <line
            stroke="var(--border)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            x1="0"
            x2={VIEW_WIDTH}
            y1={y(0)}
            y2={y(0)}
          />
          {fill ? <path d={fill} fill={`url(#${id}-fill)`} /> : null}
          {line ? (
            <path
              d={line}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              style={{ stroke: color }}
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
        </svg>

        {point ? (
          <>
            <span
              aria-hidden="true"
              className="bg-border pointer-events-none absolute inset-y-0 w-px"
              data-slot="metric-card-crosshair"
              style={{ left: `${xPercent(active ?? 0)}%` }}
            />
            <span
              aria-hidden="true"
              className="ring-card pointer-events-none absolute size-2.5 -translate-1/2 rounded-full ring-2"
              style={{
                background: color,
                left: `${xPercent(active ?? 0)}%`,
                top: y(point.value),
              }}
            />
          </>
        ) : null}

        {lastPoint ? (
          <div
            aria-label={`${label} by day`}
            aria-valuemax={last}
            aria-valuemin={0}
            aria-valuenow={reading}
            aria-valuetext={`${dayText(reading)}: ${numbers.format(data[reading]?.value ?? 0)}`}
            className="focus-visible:ring-ring focus-visible:ring-offset-card absolute inset-0 cursor-crosshair touch-pan-y rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            onBlur={() => setActive(null)}
            onFocus={() => setActive(last)}
            onKeyDown={handleKeyDown}
            onPointerDown={(event) =>
              scrubTo(event.clientX, event.currentTarget)
            }
            onPointerLeave={() => setActive(null)}
            onPointerMove={(event) =>
              scrubTo(event.clientX, event.currentTarget)
            }
            onPointerUp={(event) => {
              if (event.pointerType !== "mouse") setActive(null)
            }}
            role="slider"
            tabIndex={0}
          />
        ) : null}
      </div>

      {firstPoint && lastPoint && data.length > 1 ? (
        <div
          aria-hidden="true"
          className="text-muted-foreground mt-1.5 flex justify-between text-xs tabular-nums"
        >
          <span>{edgeDates.format(new Date(firstPoint.date))}</span>
          <span>{edgeDates.format(new Date(lastPoint.date))}</span>
        </div>
      ) : null}
    </div>
  )
}
