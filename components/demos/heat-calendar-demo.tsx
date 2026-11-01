"use client"

import {
  HeatCalendar,
  type HeatCalendarDay,
} from "@/registry/default/heat-calendar/heat-calendar"

const END = Date.UTC(2026, 10, 1)

function commits(): HeatCalendarDay[] {
  let seed = 7
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }

  return Array.from({ length: 365 }, (_, index) => {
    const time = END - (364 - index) * 86_400_000
    const weekday = new Date(time).getUTCDay()
    const weekend = weekday === 0 || weekday === 6
    const holiday = index > 270 && index < 284
    const roll = random()
    const count =
      holiday || roll < (weekend ? 0.7 : 0.15)
        ? 0
        : Math.round(random() * (weekend ? 3 : 9) + (index / 365) * 4)

    return { date: new Date(time).toISOString().slice(0, 10), count }
  })
}

const days = commits()
const total = days.reduce((sum, day) => sum + day.count, 0)

export function HeatCalendarDemo() {
  return (
    <div className="bg-card text-card-foreground border-border w-full max-w-[52rem] min-w-0 rounded-xl border p-4 md:p-6">
      <h3 className="text-sm font-medium">
        {total.toLocaleString("en-US")} commits in the last year
      </h3>
      <p className="text-muted-foreground mt-1 mb-4 text-sm">
        Hover a day, or tab in and use the arrow keys.
      </p>
      <HeatCalendar
        data={days}
        end="2026-11-01"
        label="Commits per day"
        locale="en-US"
        unit={{ one: "commit", other: "commits" }}
      />
    </div>
  )
}
