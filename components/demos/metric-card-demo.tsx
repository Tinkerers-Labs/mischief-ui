"use client"

import * as React from "react"

import {
  MetricCard,
  type MetricPoint,
} from "@/registry/default/metric-card/metric-card"

const END = Date.UTC(2026, 10, 1)
const DAY = 86_400_000

const periods = [
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
]

function series(days: number, base: number, seed: number): MetricPoint[] {
  let state = seed
  const random = () => {
    state = (state * 16807) % 2147483647
    return state / 2147483647
  }

  return Array.from({ length: days }, (_, index) => {
    const time = END - (days - 1 - index) * DAY
    const weekday = new Date(time).getUTCDay()
    const weekend = weekday === 0 || weekday === 6
    const growth = 1 + (index / days) * 0.18
    const value = base * growth * (weekend ? 0.62 : 1) * (0.85 + random() * 0.3)

    return {
      date: new Date(time).toISOString().slice(0, 10),
      value: Math.round(value),
    }
  })
}

const revenue = Object.fromEntries(
  periods.map(({ value }) => {
    const days = Number.parseInt(value, 10)
    const current = series(days, 4200, days)
    const previous = series(days, 3900, days + 11).reduce(
      (sum, point) => sum + point.value,
      0
    )
    return [value, { current, previous }]
  })
)

const refunds = series(30, 18, 5)
const refundsBefore = series(30, 21, 9).reduce(
  (sum, point) => sum + point.value,
  0
)

export function MetricCardDemo() {
  const [period, setPeriod] = React.useState("30d")
  const selected = revenue[period] ?? revenue["30d"]

  return (
    <div className="grid w-full max-w-[44rem] gap-4 sm:grid-cols-[3fr_2fr]">
      <MetricCard
        data={selected?.current ?? []}
        format={{
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }}
        label="Gross volume"
        locale="en-US"
        onPeriodChange={setPeriod}
        period={period}
        periods={periods}
        previous={selected?.previous}
      />
      <MetricCard
        chartHeight={72}
        comparisonLabel="vs previous 30 days"
        data={refunds}
        goodDirection="down"
        label="Refunds"
        locale="en-US"
        previous={refundsBefore}
      />
    </div>
  )
}
