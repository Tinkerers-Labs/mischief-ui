"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type SparklineProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** One value per step, oldest first. null is a gap in the line. */
  data: readonly (number | null)[]
  /** What the line measures. Names the chart for assistive technology. */
  label: string
  /** A name for each step, such as a date, used by the readout and the table. */
  labels?: readonly string[]
  /** Fills the space under the line with a light wash. */
  area?: boolean
  /** Shows the change from the first value to the latest. Defaults to true. */
  showChange?: boolean
  /** Which way is good news. Decides which change reads as a warning. */
  goodDirection?: "up" | "down"
  /** Lets a pointer or the arrow keys read any point. Defaults to true. */
  scrub?: boolean
  /** Adds a visually hidden table of every value. */
  table?: boolean
  /** Passed to Intl.NumberFormat for the values. */
  format?: Intl.NumberFormatOptions
  locale?: string
  /** Any CSS colour. Defaults to the theme's first chart colour, then primary. */
  color?: string
  /** Height of the plot in pixels. Its width follows the element. */
  height?: number
}

type Point = { index: number; value: number }

const VIEW_WIDTH = 1000
const INSET = 4

function segmentsOf(data: readonly (number | null)[]) {
  const segments: Point[][] = []
  let current: Point[] = []

  data.forEach((value, index) => {
    if (value === null || !Number.isFinite(value)) {
      if (current.length) segments.push(current)
      current = []
      return
    }
    current.push({ index, value })
  })
  if (current.length) segments.push(current)

  return segments
}

function nearest(points: readonly Point[], index: number) {
  return points.reduce<Point | undefined>(
    (best, point) =>
      !best || Math.abs(point.index - index) < Math.abs(best.index - index)
        ? point
        : best,
    undefined
  )
}

export function Sparkline({
  data,
  label,
  labels,
  area = false,
  showChange = true,
  goodDirection = "up",
  scrub = true,
  table = false,
  format,
  locale,
  color = "var(--chart-1, var(--primary))",
  height = 32,
  className,
  ...rootProps
}: SparklineProps) {
  const [active, setActive] = React.useState<number | null>(null)

  const numbers = React.useMemo(
    () => new Intl.NumberFormat(locale, format),
    [format, locale]
  )
  const percent = React.useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "percent",
        maximumFractionDigits: 1,
      }),
    [locale]
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

  const segments = segmentsOf(data)
  const points = segments.flat()
  const first = points[0]
  const latest = points[points.length - 1]

  const values = points.map((point) => point.value)
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 0
  const span = max - min
  const plotHeight = Math.max(height - INSET * 2, 1)

  const x = (index: number) =>
    data.length > 1 ? (index / (data.length - 1)) * VIEW_WIDTH : VIEW_WIDTH / 2
  const y = (value: number) =>
    span === 0 ? height / 2 : INSET + ((max - value) / span) * plotHeight
  const xPercent = (index: number) => (x(index) / VIEW_WIDTH) * 100

  const baseline = y(Math.min(Math.max(0, min), max))

  const change =
    first && latest && points.length > 1 && first.value !== 0
      ? (latest.value - first.value) / Math.abs(first.value)
      : null
  const direction =
    change === null || change === 0 ? "flat" : change > 0 ? "up" : "down"
  const good = direction === "flat" || direction === goodDirection

  const nameOf = (index: number) => labels?.[index] ?? `Point ${index + 1}`
  const missing = data.length - points.length

  const summary = latest
    ? [
        `${label}.`,
        points.length > 1
          ? `Low ${numbers.format(min)}, high ${numbers.format(max)}, latest ${numbers.format(latest.value)}.`
          : `One value, ${numbers.format(latest.value)}.`,
        change === null
          ? ""
          : direction === "flat"
            ? "Unchanged from the first value."
            : `${direction === "up" ? "Up" : "Down"} ${percent.format(Math.abs(change))} from the first value.`,
        missing ? `${missing} missing.` : "",
      ]
        .filter(Boolean)
        .join(" ")
    : `${label}. No data.`

  const shown =
    active === null ? null : (points.find((p) => p.index === active) ?? null)
  const dot = shown ?? latest

  function scrubTo(clientX: number, element: HTMLElement) {
    if (!points.length) return
    const rect = element.getBoundingClientRect()
    const ratio = rect.width ? (clientX - rect.left) / rect.width : 1
    const index = Math.round(
      Math.min(Math.max(ratio, 0), 1) * (data.length - 1)
    )
    const point = nearest(points, index)
    if (point) setActive(point.index)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!latest) return
    const position = Math.max(
      points.findIndex((point) => point.index === (active ?? latest.index)),
      0
    )
    const next =
      event.key === "ArrowLeft" || event.key === "ArrowDown"
        ? points[Math.max(position - 1, 0)]
        : event.key === "ArrowRight" || event.key === "ArrowUp"
          ? points[Math.min(position + 1, points.length - 1)]
          : event.key === "Home"
            ? points[0]
            : event.key === "End"
              ? latest
              : undefined
    if (!next) return
    event.preventDefault()
    setActive(next.index)
  }

  const line = segments
    .map((segment) =>
      segment
        .map(
          (point, i) =>
            `${i === 0 ? "M" : "L"}${x(point.index).toFixed(2)} ${y(point.value).toFixed(2)}`
        )
        .join(" ")
    )
    .join(" ")

  const fill = segments
    .filter((segment) => segment.length > 1)
    .map((segment) => {
      const start = x(segment[0]?.index ?? 0).toFixed(2)
      const end = x(segment[segment.length - 1]?.index ?? 0).toFixed(2)
      const edge = segment
        .map(
          (point) =>
            `L${x(point.index).toFixed(2)} ${y(point.value).toFixed(2)}`
        )
        .join(" ")
      return `M${start} ${baseline} ${edge} L${end} ${baseline} Z`
    })
    .join(" ")

  const readoutAlign = shown
    ? xPercent(shown.index) < 20
      ? "translate-x-0"
      : xPercent(shown.index) > 80
        ? "-translate-x-full"
        : "-translate-x-1/2"
    : ""

  return (
    <div
      data-slot="sparkline"
      data-state={shown ? "scrubbing" : "idle"}
      data-trend={direction}
      className={cn(
        "inline-flex w-36 max-w-full items-center gap-2",
        className
      )}
      {...rootProps}
    >
      <div className="min-w-0 flex-1 px-1" style={{ height }}>
        <div className="relative size-full">
          <div role="img" aria-label={summary} className="absolute inset-0">
            <svg
              aria-hidden="true"
              className="block size-full overflow-visible"
              preserveAspectRatio="none"
              viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
            >
              {min < 0 && max > 0 ? (
                <line
                  stroke="var(--border)"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  x1="0"
                  x2={VIEW_WIDTH}
                  y1={y(0)}
                  y2={y(0)}
                />
              ) : null}
              {area && fill ? (
                <path d={fill} style={{ fill: color, fillOpacity: 0.12 }} />
              ) : null}
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
            {dot ? (
              <span
                aria-hidden="true"
                data-slot="sparkline-dot"
                className="ring-background pointer-events-none absolute size-2 -translate-1/2 rounded-full ring-2"
                style={{
                  background: color,
                  left: `${xPercent(dot.index)}%`,
                  top: y(dot.value),
                }}
              />
            ) : null}
          </div>

          {shown ? (
            <span
              aria-hidden="true"
              data-slot="sparkline-readout"
              className={cn(
                "bg-popover text-popover-foreground border-border pointer-events-none absolute bottom-full z-10 mb-1.5 rounded-md border px-1.5 py-0.5 text-xs whitespace-nowrap shadow-sm",
                readoutAlign
              )}
              style={{ left: `${xPercent(shown.index)}%` }}
            >
              {labels?.[shown.index] ? (
                <span className="text-muted-foreground mr-1">
                  {labels[shown.index]}
                </span>
              ) : null}
              <span className="font-medium tabular-nums">
                {numbers.format(shown.value)}
              </span>
            </span>
          ) : null}

          {scrub && dot ? (
            <div
              aria-label={`${label}, read a value`}
              aria-valuemax={data.length - 1}
              aria-valuemin={0}
              aria-valuenow={dot.index}
              aria-valuetext={`${nameOf(dot.index)}: ${numbers.format(dot.value)}`}
              className="focus-visible:ring-ring absolute inset-0 cursor-crosshair touch-pan-y rounded-sm focus-visible:ring-2 focus-visible:outline-none"
              onBlur={() => setActive(null)}
              onFocus={() => setActive(dot.index)}
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
      </div>

      {showChange && change !== null ? (
        <span
          data-slot="sparkline-change"
          data-good={good || undefined}
          className={cn(
            "inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums",
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
          {signed.format(change)}
        </span>
      ) : null}

      {table ? (
        <div className="sr-only">
          <table>
            <caption>{label}</caption>
            <thead>
              <tr>
                <th scope="col">Point</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {data.map((value, index) => (
                <tr key={index}>
                  <th scope="row">{nameOf(index)}</th>
                  <td>
                    {value === null || !Number.isFinite(value)
                      ? "No data"
                      : numbers.format(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
