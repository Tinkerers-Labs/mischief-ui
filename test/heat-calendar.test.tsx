import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { HeatCalendar } from "../registry/default/heat-calendar/heat-calendar"

const data = [
  { date: "2026-03-01", count: 1 },
  { date: "2026-03-03", count: 12 },
  { date: "2026-03-10", count: 4 },
  { date: "2026-03-14", count: 0 },
]

function cells() {
  return screen
    .getAllByRole("gridcell")
    .filter((cell) => cell.hasAttribute("data-date"))
}

describe("HeatCalendar", () => {
  it("names every day with its count and full date", () => {
    render(
      <HeatCalendar
        data={data}
        end="2026-03-14"
        locale="en-US"
        start="2026-03-01"
      />
    )

    expect(screen.getByRole("grid", { name: "Activity" })).toBeInTheDocument()
    expect(cells()).toHaveLength(14)
    expect(
      screen.getByRole("gridcell", {
        name: "12 contributions on Tuesday, March 3, 2026",
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("gridcell", {
        name: "1 contribution on Sunday, March 1, 2026",
      })
    ).toBeInTheDocument()
  })

  it("lays weekdays out as rows from the week start", () => {
    const { rerender } = render(
      <HeatCalendar
        data={data}
        end="2026-03-14"
        start="2026-03-01"
        weekStart={0}
      />
    )
    expect(screen.getAllByRole("rowheader")[0]).toHaveTextContent("Sunday")

    rerender(
      <HeatCalendar
        data={data}
        end="2026-03-14"
        start="2026-03-01"
        weekStart={1}
      />
    )
    expect(screen.getAllByRole("rowheader")[0]).toHaveTextContent("Monday")
  })

  it("buckets intensity against the busiest day", () => {
    render(<HeatCalendar data={data} end="2026-03-14" start="2026-03-01" />)

    const level = (date: string) =>
      cells()
        .find((cell) => cell.dataset.date === date)
        ?.getAttribute("data-level")

    expect(level("2026-03-03")).toBe("4")
    expect(level("2026-03-10")).toBe("2")
    expect(level("2026-03-01")).toBe("1")
    expect(level("2026-03-14")).toBe("0")
  })

  it("keeps one tab stop and moves by day and by week", async () => {
    const user = userEvent.setup()
    render(
      <HeatCalendar
        data={data}
        end="2026-03-14"
        locale="en-US"
        start="2026-03-01"
        weekStart={0}
      />
    )

    expect(cells().filter((cell) => cell.tabIndex === 0)).toHaveLength(1)

    await user.tab()
    expect(document.activeElement).toHaveAttribute("data-date", "2026-03-14")

    await user.keyboard("{ArrowUp}")
    expect(document.activeElement).toHaveAttribute("data-date", "2026-03-13")

    await user.keyboard("{ArrowLeft}")
    expect(document.activeElement).toHaveAttribute("data-date", "2026-03-06")

    await user.keyboard("{ArrowLeft}")
    expect(document.activeElement).toHaveAttribute("data-date", "2026-03-01")

    await user.keyboard("{Control>}{End}{/Control}")
    expect(document.activeElement).toHaveAttribute("data-date", "2026-03-14")

    await user.keyboard("{Home}")
    expect(document.activeElement).toHaveAttribute("data-date", "2026-03-07")
    expect(cells().filter((cell) => cell.tabIndex === 0)).toHaveLength(1)
  })

  it("shows a tooltip on hover and on focus, and Escape hides it", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <HeatCalendar
        data={data}
        end="2026-03-14"
        locale="en-US"
        start="2026-03-01"
      />
    )
    const tooltip = () =>
      container.querySelector('[data-slot="heat-calendar-tooltip"]')

    fireEvent.pointerEnter(
      screen.getByRole("gridcell", { name: /March 3, 2026/ })
    )
    expect(tooltip()).toHaveTextContent("12 contributions on Mar 3")

    fireEvent.pointerLeave(screen.getByRole("grid"))
    expect(tooltip()).toBeNull()

    await user.tab()
    expect(tooltip()).toHaveTextContent("0 contributions on Mar 14")

    await user.keyboard("{Escape}")
    expect(tooltip()).toBeNull()
  })

  it("uses the locale for names and the unit for counts", () => {
    render(
      <HeatCalendar
        data={[{ date: "2026-03-03", count: 1 }]}
        end="2026-03-03"
        locale="de-DE"
        start="2026-03-01"
        unit={{ one: "Commit", other: "Commits" }}
      />
    )

    expect(
      screen.getByRole("gridcell", {
        name: "1 Commit on Dienstag, 3. März 2026",
      })
    ).toBeInTheDocument()
  })

  it("reads dates in UTC and adds up repeated days", () => {
    render(
      <HeatCalendar
        data={[
          { date: "2026-01-01", count: 2 },
          { date: "2026-01-01", count: 3 },
        ]}
        end="2026-01-01"
        locale="en-US"
        start="2026-01-01"
      />
    )

    expect(cells()).toHaveLength(1)
    expect(cells()[0]).toHaveAccessibleName(
      "5 contributions on Thursday, January 1, 2026"
    )
  })
})
