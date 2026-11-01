import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  getWeeklyHoursIssues,
  WeeklyHours,
  type WeeklyHoursValue,
} from "../registry/default/weekly-hours/weekly-hours"

const week: WeeklyHoursValue = {
  sunday: [],
  monday: [{ start: "09:00", end: "17:00" }],
  tuesday: [{ start: "09:00", end: "12:00" }],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
}

function Controlled({
  onValueChange,
  ...props
}: Partial<React.ComponentProps<typeof WeeklyHours>>) {
  const [value, setValue] = React.useState(week)
  return (
    <WeeklyHours
      locale="en-US"
      firstDay="monday"
      value={value}
      onValueChange={(next) => {
        setValue(next)
        onValueChange?.(next)
      }}
      {...props}
    />
  )
}

describe("WeeklyHours", () => {
  it("lists the week from the first day, one switch per day", () => {
    render(<Controlled />)

    const switches = screen.getAllByRole("switch")
    expect(switches.map((element) => element.textContent)).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ])
    expect(screen.getByRole("switch", { name: "Monday" })).toBeChecked()
    expect(screen.getByRole("switch", { name: "Sunday" })).not.toBeChecked()
  })

  it("names the days and the clock in the reader's language", () => {
    render(<WeeklyHours defaultValue={week} locale="de-DE" firstDay="monday" />)

    expect(screen.getByRole("switch", { name: "Montag" })).toBeChecked()
    const start = screen.getByRole("combobox", { name: "Montag start time" })
    expect(
      within(start).getByRole("option", { selected: true })
    ).toHaveTextContent("09:00")
  })

  it("shows a 12 or 24 hour clock as asked", () => {
    const { rerender } = render(
      <WeeklyHours defaultValue={week} locale="en-US" />
    )
    const end = () => screen.getByRole("combobox", { name: "Monday end time" })

    expect(
      within(end()).getByRole("option", { selected: true })
    ).toHaveTextContent("5:00 PM")

    rerender(<WeeklyHours defaultValue={week} locale="en-US" hourCycle="h23" />)
    expect(
      within(end()).getByRole("option", { selected: true })
    ).toHaveTextContent("17:00")
  })

  it("offers times in the chosen step", () => {
    const { rerender } = render(
      <WeeklyHours defaultValue={week} locale="en-US" />
    )
    const start = () =>
      screen.getByRole("combobox", { name: "Monday start time" })

    expect(within(start()).getAllByRole("option")).toHaveLength(48)

    rerender(<WeeklyHours defaultValue={week} locale="en-US" step={15} />)
    expect(within(start()).getAllByRole("option")).toHaveLength(96)
  })

  it("switches a day off, and back on with the hours it had", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Controlled onValueChange={onValueChange} />)

    const tuesday = screen.getByRole("switch", { name: "Tuesday" })
    await user.click(tuesday)

    expect(tuesday).not.toBeChecked()
    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ tuesday: [] })
    )
    expect(
      screen
        .getByRole("combobox", { name: "Tuesday start time" })
        .closest("[inert]")
    ).not.toBeNull()

    await user.click(tuesday)
    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ tuesday: [{ start: "09:00", end: "12:00" }] })
    )
  })

  it("gives a day switched on for the first time the default range", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Controlled
        defaultRange={{ start: "10:00", end: "14:00" }}
        onValueChange={onValueChange}
      />
    )

    await user.click(screen.getByRole("switch", { name: "Saturday" }))
    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ saturday: [{ start: "10:00", end: "14:00" }] })
    )
  })

  it("adds a range after the last one and focuses it", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Controlled onValueChange={onValueChange} />)

    await user.click(
      screen.getByRole("button", { name: "Add hours to Monday" })
    )

    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        monday: [
          { start: "09:00", end: "17:00" },
          { start: "18:00", end: "19:00" },
        ],
      })
    )
    expect(
      screen.getByRole("combobox", { name: "Monday start time 2" })
    ).toHaveFocus()
  })

  it("turns the day off when its last range goes, and focuses the switch", async () => {
    const user = userEvent.setup()
    render(<Controlled />)

    await user.click(
      screen.getByRole("button", {
        name: "Remove 9:00 AM to 12:00 PM on Tuesday",
      })
    )

    const tuesday = screen.getByRole("switch", { name: "Tuesday" })
    expect(tuesday).not.toBeChecked()
    expect(tuesday).toHaveFocus()
  })

  it("flags an end before its start, inline and aloud", async () => {
    const user = userEvent.setup()
    const { container } = render(<Controlled />)

    const end = screen.getByRole("combobox", { name: "Tuesday end time" })
    await user.selectOptions(end, "08:00")

    expect(end).toHaveAttribute("aria-invalid", "true")
    expect(end).toHaveAccessibleDescription(
      "End time must be after the start time."
    )
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      "Tuesday: End time must be after the start time."
    )
  })

  it("flags ranges that run into each other", async () => {
    const user = userEvent.setup()
    render(<Controlled />)

    await user.click(
      screen.getByRole("button", { name: "Add hours to Monday" })
    )
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Monday start time 2" }),
      "16:00"
    )

    expect(
      screen.getByRole("combobox", { name: "Monday start time 2" })
    ).toHaveAccessibleDescription("Overlaps 9:00 AM to 5:00 PM.")
    expect(
      screen.getByRole("combobox", { name: "Monday start time 1" })
    ).toHaveAccessibleDescription("Overlaps 4:00 PM to 7:00 PM.")
  })

  it("copies one day's hours to every day", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Controlled onValueChange={onValueChange} />)

    await user.click(
      screen.getByRole("button", { name: "Copy Monday hours to every day" })
    )

    const next = onValueChange.mock.lastCall![0] as WeeklyHoursValue
    for (const ranges of Object.values(next)) {
      expect(ranges).toEqual([{ start: "09:00", end: "17:00" }])
    }
    for (const day of screen.getAllByRole("switch")) {
      expect(day).toBeChecked()
    }
    expect(
      screen.getByText("Copied Monday hours to every day.")
    ).toBeInTheDocument()
  })

  it("works uncontrolled", async () => {
    const user = userEvent.setup()
    render(<WeeklyHours locale="en-US" />)

    const saturday = screen.getByRole("switch", { name: "Saturday" })
    expect(saturday).not.toBeChecked()
    expect(screen.getByRole("switch", { name: "Monday" })).toBeChecked()

    await user.click(saturday)
    expect(saturday).toBeChecked()
  })
})

describe("getWeeklyHoursIssues", () => {
  it("reports order and overlap, and nothing for a clean week", () => {
    expect(getWeeklyHoursIssues(week)).toEqual([])

    expect(
      getWeeklyHoursIssues({
        monday: [
          { start: "09:00", end: "12:00" },
          { start: "11:00", end: "13:00" },
          { start: "15:00", end: "14:00" },
        ],
        friday: [
          { start: "09:00", end: "12:00" },
          { start: "12:00", end: "24:00" },
        ],
      })
    ).toEqual([
      { day: "monday", index: 0, kind: "overlap", other: 1 },
      { day: "monday", index: 1, kind: "overlap", other: 0 },
      { day: "monday", index: 2, kind: "order" },
    ])
  })
})
