"use client"

import * as React from "react"

import {
  getWeeklyHoursIssues,
  WeeklyHours,
  type WeeklyHoursValue,
} from "@/registry/default/weekly-hours/weekly-hours"

const initial: WeeklyHoursValue = {
  sunday: [],
  monday: [{ start: "09:00", end: "17:00" }],
  tuesday: [
    { start: "09:00", end: "12:00" },
    { start: "13:00", end: "17:00" },
  ],
  wednesday: [{ start: "09:00", end: "17:00" }],
  thursday: [{ start: "09:00", end: "17:00" }],
  friday: [{ start: "09:00", end: "13:00" }],
  saturday: [],
}

export function WeeklyHoursDemo() {
  const [week, setWeek] = React.useState(initial)
  const [clock, setClock] = React.useState<"h12" | "h23">("h12")
  const problems = getWeeklyHoursIssues(week).length

  return (
    <div className="bg-background border-border w-full max-w-[30rem] rounded-[1.25rem] border p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Office hours</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            When students can book a call with you.
          </p>
        </div>
        <label className="text-muted-foreground flex items-center gap-2 text-xs">
          <input
            checked={clock === "h23"}
            className="accent-primary size-3.5"
            onChange={(event) => setClock(event.target.checked ? "h23" : "h12")}
            type="checkbox"
          />
          24 hour clock
        </label>
      </div>

      <WeeklyHours
        className="mt-4"
        hourCycle={clock}
        label="Office hours"
        locale="en-US"
        firstDay="monday"
        onValueChange={setWeek}
        value={week}
      />

      <p
        className={
          problems
            ? "text-destructive mt-3 text-sm"
            : "text-muted-foreground mt-3 text-sm"
        }
      >
        {problems
          ? `Fix ${problems === 1 ? "1 range" : `${problems} ranges`} before saving.`
          : "Ready to save."}
      </p>
    </div>
  )
}
