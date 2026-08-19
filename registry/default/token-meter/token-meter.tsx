"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type TokenSegment = {
  label: string
  value: number
  /** Any CSS colour. Defaults to a shade drawn from the theme. */
  color?: string
}

export type TokenMeterProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Total consumed. Ignored when segments are given, which sum to it. */
  used?: number
  limit: number
  segments?: readonly TokenSegment[]
  label?: string
  /** Fraction of the limit at which the meter reads as tight. Defaults to 0.8. */
  warnAt?: number
  /** Formats both numbers in the readout. */
  format?: (value: number) => string
  showLegend?: boolean
}

const defaultColors = [
  "var(--primary)",
  "color-mix(in oklab, var(--primary) 45%, var(--muted))",
  "color-mix(in oklab, var(--primary) 20%, var(--muted))",
]

function compact(value: number) {
  if (value < 1000) return String(value)
  if (value < 1_000_000)
    return `${(value / 1000).toFixed(value < 10_000 ? 1 : 0)}k`

  return `${(value / 1_000_000).toFixed(1)}M`
}

export function TokenMeter({
  used,
  limit,
  segments,
  label = "Context used",
  warnAt = 0.8,
  format = compact,
  showLegend = true,
  className,
  ...rootProps
}: TokenMeterProps) {
  const total = segments
    ? segments.reduce((sum, segment) => sum + segment.value, 0)
    : (used ?? 0)

  const safeLimit = limit > 0 ? limit : 1
  const fraction = Math.min(1, Math.max(0, total / safeLimit))
  const tight = fraction >= warnAt
  const full = total >= safeLimit

  return (
    <div
      data-slot="token-meter"
      data-tight={tight || undefined}
      className={cn("min-w-0", className)}
      {...rootProps}
    >
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-muted-foreground text-xs">{label}</span>
        <span
          className={cn(
            "font-[family-name:var(--font-mono),monospace] text-xs tabular-nums",
            full
              ? "text-destructive"
              : tight
                ? "text-[color-mix(in_oklab,var(--destructive)_60%,var(--foreground))]"
                : "text-muted-foreground"
          )}
        >
          {format(total)} / {format(limit)}
        </span>
      </div>

      <div
        role="meter"
        aria-label={label}
        aria-valuenow={total}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuetext={`${format(total)} of ${format(limit)}, ${Math.round(fraction * 100)} percent`}
        className="bg-muted flex h-2 w-full overflow-hidden rounded-full"
      >
        {segments ? (
          segments.map((segment, index) => (
            <span
              key={segment.label}
              className="h-full transition-[width] duration-300 motion-reduce:transition-none"
              style={{
                width: `${Math.min(100, (segment.value / safeLimit) * 100)}%`,
                background:
                  segment.color ?? defaultColors[index % defaultColors.length],
              }}
            />
          ))
        ) : (
          <span
            className="h-full transition-[width] duration-300 motion-reduce:transition-none"
            style={{
              width: `${fraction * 100}%`,
              background:
                full || tight ? "var(--destructive)" : "var(--primary)",
            }}
          />
        )}
      </div>

      {segments && showLegend ? (
        <ul className="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.6875rem]">
          {segments.map((segment, index) => (
            <li key={segment.label} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full"
                style={{
                  background:
                    segment.color ??
                    defaultColors[index % defaultColors.length],
                }}
              />
              {segment.label}
              <span className="tabular-nums">{format(segment.value)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
