"use client"

import * as React from "react"
import { Copy, Plus, X } from "lucide-react"

import { cn } from "@/lib/utils"

export type Weekday =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"

/** Times are 24 hour "HH:mm" strings. An end of "24:00" is midnight. */
export type TimeRange = { start: string; end: string }

/** An empty list means the day is unavailable. */
export type WeeklyHoursValue = Record<Weekday, TimeRange[]>

export type WeeklyHoursIssue = {
  day: Weekday
  index: number
  kind: "order" | "overlap"
  /** For an overlap, the index of the range it runs into. */
  other?: number
}

export type WeeklyHoursProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue" | "children"
> & {
  value?: WeeklyHoursValue
  defaultValue?: WeeklyHoursValue
  onValueChange?: (value: WeeklyHoursValue) => void
  /** Minutes between the times on offer. */
  step?: 15 | 30
  /** Weekday names, the first day of the week, and the clock follow it. */
  locale?: string
  hourCycle?: "h12" | "h23"
  firstDay?: Weekday
  /** What a day gets when it is switched on for the first time. */
  defaultRange?: TimeRange
  label?: string
  disabled?: boolean
}

/** In JavaScript's order, so getUTCDay() indexes it. */
const WEEKDAYS: readonly Weekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]

const DAY = 24 * 60

const NINE_TO_FIVE: TimeRange = { start: "09:00", end: "17:00" }

const WORK_WEEK: WeeklyHoursValue = {
  sunday: [],
  monday: [NINE_TO_FIVE],
  tuesday: [NINE_TO_FIVE],
  wednesday: [NINE_TO_FIVE],
  thursday: [NINE_TO_FIVE],
  friday: [NINE_TO_FIVE],
  saturday: [],
}

const toMinutes = (time: string) => {
  const [hours = "0", minutes = "0"] = time.split(":")
  return Number(hours) * 60 + Number(minutes)
}

const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`

/**
 * End before start, and ranges on the same day that run into each other. It
 * is exported so a form can refuse to save the week the editor is flagging.
 */
export function getWeeklyHoursIssues(
  value: Partial<WeeklyHoursValue>
): WeeklyHoursIssue[] {
  const issues: WeeklyHoursIssue[] = []

  for (const day of WEEKDAYS) {
    const ranges = (value[day] ?? []).map((range) => ({
      start: toMinutes(range.start),
      end: toMinutes(range.end),
    }))

    ranges.forEach((range, index) => {
      if (range.end <= range.start) {
        issues.push({ day, index, kind: "order" })
        return
      }

      const other = ranges.findIndex(
        (candidate, at) =>
          at !== index &&
          candidate.end > candidate.start &&
          range.start < candidate.end &&
          candidate.start < range.end
      )
      if (other >= 0) issues.push({ day, index, kind: "overlap", other })
    })
  }

  return issues
}

const noop = () => () => undefined

/** Firefox has no week info yet, so it gets Monday, the ISO first day. */
function firstDayOf(locale: string): Weekday {
  const info = new Intl.Locale(locale) as Intl.Locale & {
    getWeekInfo?: () => { firstDay: number }
    weekInfo?: { firstDay: number }
  }
  const firstDay = (info.getWeekInfo?.() ?? info.weekInfo)?.firstDay
  return firstDay ? WEEKDAYS[firstDay % 7]! : "monday"
}

/**
 * Weekly availability, the settings screen of every booking tool. Each day is
 * on or off, holds one or more ranges, and says inline when a range ends
 * before it starts or runs into another.
 */
export function WeeklyHours({
  value,
  defaultValue = WORK_WEEK,
  onValueChange,
  step = 30,
  locale,
  hourCycle,
  firstDay,
  defaultRange = NINE_TO_FIVE,
  label = "Weekly hours",
  disabled,
  className,
  ...rootProps
}: WeeklyHoursProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const week = value ?? uncontrolled
  const [parked, setParked] = React.useState<
    Partial<Record<Weekday, TimeRange[]>>
  >({})
  const [announcement, setAnnouncement] = React.useState("")
  const root = React.useRef<HTMLDivElement>(null)
  const focusNext = React.useRef<string | null>(null)
  const id = React.useId()

  // The server renders in its own language; the reader's takes over once the
  // page is theirs, without a hydration mismatch.
  const readerLocale = React.useSyncExternalStore(
    noop,
    () => navigator.language,
    () => "en-US"
  )
  const resolvedLocale = locale ?? readerLocale

  const text = React.useMemo(() => {
    const cycle =
      hourCycle ??
      (new Intl.DateTimeFormat(resolvedLocale, { hour: "numeric" })
        .resolvedOptions()
        .hourCycle?.startsWith("h1")
        ? "h12"
        : "h23")
    const clock = new Intl.DateTimeFormat(resolvedLocale, {
      hour: cycle === "h12" ? "numeric" : "2-digit",
      minute: "2-digit",
      hourCycle: cycle,
      timeZone: "UTC",
    })
    const weekday = new Intl.DateTimeFormat(resolvedLocale, {
      weekday: "long",
      timeZone: "UTC",
    })

    const time = (minutes: number) =>
      minutes >= DAY && cycle === "h23"
        ? "24:00"
        : clock.format(Date.UTC(2026, 0, 4, 0, minutes % DAY))

    // 4 January 2026 was a Sunday.
    const day = (weekdayName: Weekday) =>
      weekday.format(Date.UTC(2026, 0, 4 + WEEKDAYS.indexOf(weekdayName)))

    return { time, day }
  }, [hourCycle, resolvedLocale])

  const start = WEEKDAYS.indexOf(firstDay ?? firstDayOf(resolvedLocale))
  const days = WEEKDAYS.map((_, offset) => WEEKDAYS[(start + offset) % 7]!)

  const issues = getWeeklyHoursIssues(week)

  const message = (issue: WeeklyHoursIssue, ranges: TimeRange[]) => {
    if (issue.kind === "order") return "End time must be after the start time."
    const other = ranges[issue.other!]!
    return `Overlaps ${text.time(toMinutes(other.start))} to ${text.time(toMinutes(other.end))}.`
  }

  const commit = (next: WeeklyHoursValue) => {
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  const setDay = (day: Weekday, ranges: TimeRange[]) =>
    commit({ ...week, [day]: ranges })

  React.useEffect(() => {
    const target = focusNext.current
    if (!target) return
    focusNext.current = null
    root.current?.querySelector<HTMLElement>(target)?.focus()
  })

  const toggle = (day: Weekday) => {
    const ranges = week[day] ?? []
    if (ranges.length > 0) {
      setParked((current) => ({ ...current, [day]: ranges }))
      setDay(day, [])
      return
    }
    setDay(day, parked[day] ?? [defaultRange])
  }

  const edit = (
    day: Weekday,
    index: number,
    field: keyof TimeRange,
    time: string
  ) => {
    const ranges = week[day].map((range, at) =>
      at === index ? { ...range, [field]: time } : range
    )
    setDay(day, ranges)

    const issue = getWeeklyHoursIssues({ [day]: ranges }).find(
      (candidate) => candidate.index === index
    )
    if (issue) setAnnouncement(`${text.day(day)}: ${message(issue, ranges)}`)
  }

  const nextRange = (ranges: TimeRange[]): TimeRange | null => {
    const latest = Math.max(...ranges.map((range) => toMinutes(range.end)))
    if (latest >= DAY) return null
    const begin = latest + 60 + 60 <= DAY ? latest + 60 : latest
    return { start: toTime(begin), end: toTime(Math.min(DAY, begin + 60)) }
  }

  const add = (day: Weekday) => {
    const ranges = week[day]
    const range = nextRange(ranges)
    if (!range) return
    focusNext.current = `[data-day="${day}"][data-index="${ranges.length}"][data-field="start"]`
    setDay(day, [...ranges, range])
  }

  const remove = (day: Weekday, index: number) => {
    const ranges = week[day].filter((_, at) => at !== index)
    if (ranges.length === 0) {
      setParked((current) => ({ ...current, [day]: [week[day][index]!] }))
      focusNext.current = `[data-day="${day}"][role="switch"]`
    } else {
      focusNext.current = `[data-day="${day}"][data-index="${Math.min(index, ranges.length - 1)}"][data-field="remove"]`
    }
    setDay(day, ranges)
  }

  const copyToAll = (day: Weekday) => {
    const ranges = week[day]
    const next = Object.fromEntries(
      WEEKDAYS.map((weekday) => [
        weekday,
        ranges.map((range) => ({ ...range })),
      ])
    ) as WeeklyHoursValue
    commit(next)
    setAnnouncement(`Copied ${text.day(day)} hours to every day.`)
  }

  const times = (from: number, to: number, current: number) => {
    const grid: number[] = []
    for (let minutes = from; minutes <= to; minutes += step) grid.push(minutes)
    if (!grid.includes(current)) grid.push(current)
    return grid.sort((a, b) => a - b)
  }

  const field =
    "border-input bg-background focus-visible:ring-ring h-9 min-w-0 rounded-md border px-2 text-sm tabular-nums focus-visible:ring-2 focus-visible:outline-none aria-invalid:border-destructive disabled:opacity-50"

  const iconButton =
    "text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring inline-flex size-9 shrink-0 items-center justify-center rounded-md transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none"

  return (
    <div
      ref={root}
      role="group"
      aria-label={label}
      data-slot="weekly-hours"
      className={cn("divide-border grid divide-y", className)}
      {...rootProps}
    >
      {days.map((day) => {
        const ranges = week[day] ?? []
        const available = ranges.length > 0
        const shown = available ? ranges : (parked[day] ?? [defaultRange])
        const dayName = text.day(day)
        const roomForMore = available && nextRange(ranges) !== null

        return (
          <div
            key={day}
            data-slot="weekly-hours-day"
            data-state={available ? "available" : "unavailable"}
            className="py-2"
          >
            <div className="flex min-h-11 items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={available}
                data-day={day}
                disabled={disabled}
                onClick={() => toggle(day)}
                className="focus-visible:ring-ring -ml-1 flex min-h-11 items-center gap-3 rounded-md px-1 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 motion-reduce:transition-none",
                    available ? "bg-primary" : "bg-input"
                  )}
                >
                  <span
                    className={cn(
                      "bg-background absolute top-0.5 left-0.5 size-4 rounded-full shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none",
                      available && "translate-x-4"
                    )}
                  />
                </span>
                {dayName}
              </button>

              <span className="flex-1" />

              {available ? (
                <>
                  <button
                    type="button"
                    data-day={day}
                    disabled={disabled || !roomForMore}
                    aria-label={`Add hours to ${dayName}`}
                    title="Add hours"
                    onClick={() => add(day)}
                    className={iconButton}
                  >
                    <Plus aria-hidden="true" size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label={`Copy ${dayName} hours to every day`}
                    title="Copy to every day"
                    onClick={() => copyToAll(day)}
                    className={iconButton}
                  >
                    <Copy aria-hidden="true" size={15} />
                  </button>
                </>
              ) : (
                <span className="text-muted-foreground pr-1 text-sm">
                  Unavailable
                </span>
              )}
            </div>

            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
                available
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="min-h-0 overflow-hidden" inert={!available}>
                <ul className="grid gap-2 p-1 sm:pl-12">
                  {shown.map((range, index) => {
                    const startMinutes = toMinutes(range.start)
                    const endMinutes = toMinutes(range.end)
                    const issue = available
                      ? issues.find(
                          (candidate) =>
                            candidate.day === day && candidate.index === index
                        )
                      : undefined
                    const errorId = `${id}-${day}-${index}-error`
                    const suffix = shown.length > 1 ? ` ${index + 1}` : ""
                    const span = `${text.time(startMinutes)} to ${text.time(endMinutes)}`

                    return (
                      <li key={index} data-slot="weekly-hours-range">
                        <div className="flex items-center gap-2">
                          <select
                            aria-label={`${dayName} start time${suffix}`}
                            aria-invalid={issue ? true : undefined}
                            aria-describedby={issue ? errorId : undefined}
                            data-day={day}
                            data-index={index}
                            data-field="start"
                            disabled={disabled}
                            value={range.start}
                            onChange={(event) =>
                              edit(day, index, "start", event.target.value)
                            }
                            className={field}
                          >
                            {times(0, DAY - step, startMinutes).map(
                              (minutes) => (
                                <option key={minutes} value={toTime(minutes)}>
                                  {text.time(minutes)}
                                </option>
                              )
                            )}
                          </select>
                          <span className="text-muted-foreground text-sm">
                            to
                          </span>
                          <select
                            aria-label={`${dayName} end time${suffix}`}
                            aria-invalid={issue ? true : undefined}
                            aria-describedby={issue ? errorId : undefined}
                            data-day={day}
                            data-index={index}
                            data-field="end"
                            disabled={disabled}
                            value={range.end}
                            onChange={(event) =>
                              edit(day, index, "end", event.target.value)
                            }
                            className={field}
                          >
                            {times(step, DAY, endMinutes).map((minutes) => (
                              <option key={minutes} value={toTime(minutes)}>
                                {text.time(minutes)}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            data-day={day}
                            data-index={index}
                            data-field="remove"
                            disabled={disabled}
                            aria-label={`Remove ${span} on ${dayName}`}
                            title="Remove"
                            onClick={() => remove(day, index)}
                            className={iconButton}
                          >
                            <X aria-hidden="true" size={16} />
                          </button>
                        </div>
                        {issue ? (
                          <p
                            id={errorId}
                            className="text-destructive mt-1 text-xs"
                          >
                            {message(issue, ranges)}
                          </p>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>
        )
      })}

      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  )
}
