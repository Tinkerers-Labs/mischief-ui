"use client"

import * as React from "react"

import { RangeHistogram } from "@/registry/default/range-histogram/range-histogram"

/** A repeatable spread of nightly rates: private rooms, then whole homes. */
function nightlyRates() {
  let seed = 412
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const normal = () =>
    Math.sqrt(-2 * Math.log(random() || 1e-9)) *
    Math.cos(2 * Math.PI * random())

  return Array.from({ length: 412 }, (_, index) => {
    const wholeHome = index % 3 === 0
    const rate = wholeHome ? 240 + normal() * 70 : 95 + normal() * 32
    return Math.round(Math.min(Math.max(rate, 35), 480))
  })
}

const rates = nightlyRates()
const dollars = (value: number) => `$${value}`

export function RangeHistogramDemo() {
  const [range, setRange] = React.useState<[number, number]>([70, 260])

  return (
    <div className="bg-background border-border w-full max-w-[28rem] rounded-[1.25rem] border p-5 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold">Filters</h3>
      <p className="text-muted-foreground mt-1 text-sm">
        Stays in Lisbon, 3 nights, 2 guests.
      </p>

      <RangeHistogram
        className="mt-6"
        label="Price per night"
        values={rates}
        min={30}
        max={480}
        step={5}
        value={range}
        onValueChange={setRange}
        formatValue={dollars}
        formatCount={(count, total) => `${count} of ${total} stays`}
        inputs
      />
    </div>
  )
}
