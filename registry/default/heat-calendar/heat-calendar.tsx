"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type HeatCalendarDay = {
  /** A calendar day as YYYY-MM-DD, read in UTC. */
  date: string
  count: number
}

export type HeatCalendarProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  data: readonly HeatCalendarDay[]
  /** First day shown, YYYY-MM-DD. Defaults to 52 weeks before the end. */
  start?: string
  /** Last day shown, YYYY-MM-DD. Defaults to the latest day in the data. */
  end?: string
  /** 0 is Sunday. Defaults to the first day of the week in the locale. */
  weekStart?: number
  locale?: string
  /** What is being counted, for the cell names and the tooltip. */
  unit?: { one: string; other: string }
  /** The accessible name of the grid. */
  label?: string
  /** Any CSS colour. Defaults to the theme's first chart colour, then primary. */
  color?: string
}

const DAY = 86_400_000
const LEVELS = [0, 30, 55, 80, 100]

function parseDay(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1)
}

function dayKey(time: number) {
  return new Date(time).toISOString().slice(0, 10)
}

function localeWeekStart(locale?: string) {
  try {
    const resolved = new Intl.Locale(
      locale ?? new Intl.DateTimeFormat().resolvedOptions().locale
    ) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number }
      weekInfo?: { firstDay: number }
    }
    const firstDay = (resolved.getWeekInfo?.() ?? resolved.weekInfo)?.firstDay
    return firstDay ? firstDay % 7 : 0
  } catch {
    return 0
  }
}

function levelOf(count: number, max: number) {
  if (count <= 0 || max <= 0) return 0
  return Math.max(1, Math.ceil((count / max) * (LEVELS.length - 1)))
}

function fillOf(level: number, color: string) {
  return level === 0
    ? "var(--muted)"
    : `color-mix(in oklab, ${color} ${LEVELS[level]}%, var(--background))`
}

export function HeatCalendar({
  data,
  start,
  end,
  weekStart,
  locale,
  unit = { one: "contribution", other: "contributions" },
  label = "Activity",
  color = "var(--chart-1, var(--primary))",
  className,
  ...rootProps
}: HeatCalendarProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [today] = React.useState(() => parseDay(dayKey(Date.now())))
  const [focused, setFocused] = React.useState<number | null>(null)
  const [tip, setTip] = React.useState<{
    time: number
    x: number
    y: number
    width: number
  } | null>(null)

  const counts = React.useMemo(() => {
    const map = new Map<number, number>()
    for (const day of data) {
      const time = parseDay(day.date)
      map.set(time, (map.get(time) ?? 0) + day.count)
    }
    return map
  }, [data])

  const last = end
    ? parseDay(end)
    : counts.size
      ? Math.max(...counts.keys())
      : today
  const first = start ? Math.min(parseDay(start), last) : last - 364 * DAY
  const firstWeekday = weekStart ?? localeWeekStart(locale)

  const offset = (new Date(first).getUTCDay() - firstWeekday + 7) % 7
  const totalDays = Math.round((last - first) / DAY) + 1
  const weeks = Math.ceil((offset + totalDays) / 7)

  let max = 0
  for (const [time, count] of counts) {
    if (time >= first && time <= last) max = Math.max(max, count)
  }

  const current =
    focused !== null && focused >= first && focused <= last ? focused : last

  const names = React.useMemo(() => {
    const date = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
    const short = new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    })
    const month = new Intl.DateTimeFormat(locale, {
      month: "short",
      timeZone: "UTC",
    })
    const weekday = new Intl.DateTimeFormat(locale, {
      weekday: "short",
      timeZone: "UTC",
    })
    const weekdayLong = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      timeZone: "UTC",
    })
    const plural = new Intl.PluralRules(locale)
    const number = new Intl.NumberFormat(locale)
    return { date, short, month, weekday, weekdayLong, plural, number }
  }, [locale])

  const amount = (count: number) =>
    `${names.number.format(count)} ${
      names.plural.select(count) === "one" ? unit.one : unit.other
    }`

  const timeAt = (week: number, row: number) =>
    first + (week * 7 + row - offset) * DAY

  const months: { week: number; text: string }[] = []
  for (let week = 0; week < weeks; week++) {
    const time = Math.max(timeAt(week, 0), first)
    const month = new Date(time).getUTCMonth()
    const previous = months[months.length - 1]
    const previousTime = week > 0 ? Math.max(timeAt(week - 1, 0), first) : null
    if (
      previousTime === null ||
      new Date(previousTime).getUTCMonth() !== month
    ) {
      if (previous && week - previous.week < 3) months.pop()
      months.push({ week, text: names.month.format(time) })
    }
  }

  React.useLayoutEffect(() => {
    const scroller = scrollRef.current
    if (scroller) scroller.scrollLeft = scroller.scrollWidth
  }, [])

  function showTip(time: number, cell: HTMLElement) {
    const root = rootRef.current
    if (!root) return
    const box = root.getBoundingClientRect()
    const rect = cell.getBoundingClientRect()
    setTip({
      time,
      x: rect.left + rect.width / 2 - box.left,
      y: rect.top - box.top,
      width: box.width,
    })
  }

  function move(time: number) {
    const next = Math.min(Math.max(time, first), last)
    setFocused(next)
    const cell = scrollRef.current?.querySelector<HTMLElement>(
      `[data-date="${dayKey(next)}"]`
    )
    if (!cell) return
    cell.focus()
    cell.scrollIntoView?.({ block: "nearest", inline: "nearest" })
    showTip(next, cell)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const row = (new Date(current).getUTCDay() - firstWeekday + 7) % 7
    const steps: Record<string, number | undefined> = {
      ArrowUp: current - DAY,
      ArrowDown: current + DAY,
      ArrowLeft: current - 7 * DAY,
      ArrowRight: current + 7 * DAY,
      Home: event.ctrlKey ? first : timeAt(0, row),
      End: event.ctrlKey ? last : timeAt(weeks - 1, row),
    }
    if (event.key === "Escape") {
      setTip(null)
      return
    }
    let target = steps[event.key]
    if (target === undefined) return
    event.preventDefault()
    if (event.key === "Home" && target < first) target += 7 * DAY
    if (event.key === "End" && target > last) target -= 7 * DAY
    move(target)
  }

  const cell = "size-[11px] shrink-0 rounded-[3px]"
  const tipCount = tip ? (counts.get(tip.time) ?? 0) : 0

  return (
    <div
      data-slot="heat-calendar"
      ref={rootRef}
      className={cn("relative max-w-full min-w-0 text-xs", className)}
      {...rootProps}
    >
      <div className="flex">
        <div
          aria-hidden="true"
          className="text-muted-foreground flex w-8 shrink-0 flex-col gap-[3px] pt-[calc(1rem+5px)]"
        >
          {Array.from({ length: 7 }, (_, row) => (
            <span className="h-[11px] leading-[11px]" key={row}>
              {row % 2 === 1 ? names.weekday.format(timeAt(0, row)) : ""}
            </span>
          ))}
        </div>
        <div
          ref={scrollRef}
          className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain pb-1"
          onScroll={() => setTip(null)}
        >
          <div className="inline-flex flex-col gap-[3px] p-0.5">
            <div aria-hidden="true" className="flex gap-[3px]">
              {Array.from({ length: weeks }, (_, week) => {
                const month = months.find((entry) => entry.week === week)
                return (
                  <span
                    className="text-muted-foreground relative h-4 w-[11px] shrink-0"
                    key={week}
                  >
                    {month ? (
                      <span className="absolute top-0 left-0 whitespace-nowrap">
                        {month.text}
                      </span>
                    ) : null}
                  </span>
                )
              })}
            </div>

            <div
              aria-label={label}
              className="flex flex-col gap-[3px]"
              onKeyDown={handleKeyDown}
              onPointerLeave={() => setTip(null)}
              role="grid"
            >
              {Array.from({ length: 7 }, (_, row) => {
                const weekdayTime = timeAt(0, row)
                return (
                  <div className="flex gap-[3px]" key={row} role="row">
                    <span className="sr-only" role="rowheader">
                      {names.weekdayLong.format(weekdayTime)}
                    </span>
                    {Array.from({ length: weeks }, (_, week) => {
                      const time = timeAt(week, row)
                      if (time < first || time > last) {
                        return (
                          <span className={cell} key={week} role="gridcell" />
                        )
                      }
                      const count = counts.get(time) ?? 0
                      const level = levelOf(count, max)
                      return (
                        <span
                          aria-label={`${amount(count)} on ${names.date.format(time)}`}
                          className={cn(
                            cell,
                            "focus-visible:ring-ring focus-visible:ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                          )}
                          data-date={dayKey(time)}
                          data-level={level}
                          key={week}
                          onFocus={(event) => {
                            setFocused(time)
                            showTip(time, event.currentTarget)
                          }}
                          onBlur={() => setTip(null)}
                          onPointerEnter={(event) =>
                            showTip(time, event.currentTarget)
                          }
                          role="gridcell"
                          style={{ background: fillOf(level, color) }}
                          tabIndex={time === current ? 0 : -1}
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="text-muted-foreground mt-2 flex items-center justify-end gap-[3px]"
      >
        <span className="mr-1">Less</span>
        {LEVELS.map((_, level) => (
          <span
            className={cell}
            key={level}
            style={{ background: fillOf(level, color) }}
          />
        ))}
        <span className="ml-1">More</span>
      </div>

      {tip ? (
        <span
          aria-hidden="true"
          data-slot="heat-calendar-tooltip"
          className="bg-popover text-popover-foreground border-border pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border px-2 py-1 whitespace-nowrap shadow-sm"
          style={{
            left: Math.min(Math.max(tip.x, 64), tip.width - 64),
            top: tip.y - 6,
          }}
        >
          <span className="font-medium">{amount(tipCount)}</span>
          <span className="text-muted-foreground">
            {" "}
            on {names.short.format(tip.time)}
          </span>
        </span>
      ) : null}
    </div>
  )
}
