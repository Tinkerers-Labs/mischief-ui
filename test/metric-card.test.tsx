import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  MetricCard,
  type MetricPoint,
} from "../registry/default/metric-card/metric-card"

const data: MetricPoint[] = [
  { date: "2026-10-27", value: 120 },
  { date: "2026-10-28", value: 140 },
  { date: "2026-10-29", value: 90 },
  { date: "2026-10-30", value: 150 },
  { date: "2026-10-31", value: 100 },
]

function shownDigits(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll('[data-slot="metric-card-value"] [data-digit]')
  )
    .map((digit) => digit.getAttribute("data-digit"))
    .join("")
}

describe("MetricCard", () => {
  it("shows the total and the change against the previous period", () => {
    const { container } = render(
      <MetricCard data={data} label="Orders" locale="en-US" previous={500} />
    )

    expect(screen.getByRole("group", { name: "Orders" })).toBeInTheDocument()
    expect(shownDigits(container)).toBe("600")
    expect(
      container.querySelector('[data-slot="metric-card-value"]')
    ).toHaveTextContent("600")

    const change = container.querySelector('[data-slot="metric-card-change"]')
    expect(change).toHaveTextContent("+20%")
    expect(change).toHaveTextContent("Up 20%")
    expect(change).toHaveAttribute("data-good", "true")
    expect(screen.getByText("vs previous period")).toBeInTheDocument()
  })

  it("marks a rise as bad when down is good", () => {
    const { container } = render(
      <MetricCard
        data={data}
        goodDirection="down"
        label="Refunds"
        previous={500}
      />
    )

    expect(
      container.querySelector('[data-slot="metric-card-change"]')
    ).not.toHaveAttribute("data-good")
  })

  it("reads any day from the keyboard, then returns to the total", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MetricCard data={data} label="Orders" locale="en-US" />
    )

    await user.tab()
    const slider = screen.getByRole("slider", { name: "Orders by day" })
    expect(slider).toHaveAttribute("aria-valuetext", "Sat, Oct 31: 100")
    expect(shownDigits(container)).toBe("100")
    expect(
      container.querySelector('[data-slot="metric-card-date"]')
    ).toHaveTextContent("Sat, Oct 31")

    await user.keyboard("{ArrowLeft}")
    expect(slider).toHaveAttribute("aria-valuetext", "Fri, Oct 30: 150")
    expect(shownDigits(container)).toBe("150")

    await user.keyboard("{Home}")
    expect(slider).toHaveAttribute("aria-valuetext", "Tue, Oct 27: 120")

    await user.keyboard("{PageUp}")
    expect(slider).toHaveAttribute("aria-valuetext", "Sat, Oct 31: 100")

    await user.keyboard("{Escape}")
    expect(shownDigits(container)).toBe("600")
    expect(container.firstChild).toHaveAttribute("data-state", "idle")

    await user.keyboard("{ArrowLeft}")
    await user.tab()
    expect(shownDigits(container)).toBe("600")
  })

  it("scrubs under the pointer and lets go when it leaves", () => {
    const { container } = render(<MetricCard data={data} label="Orders" />)
    const slider = screen.getByRole("slider")
    slider.getBoundingClientRect = () =>
      ({ left: 0, width: 400, top: 0, height: 96 }) as DOMRect

    fireEvent.pointerMove(slider, { clientX: 200 })
    expect(shownDigits(container)).toBe("90")
    expect(
      container.querySelector('[data-slot="metric-card-crosshair"]')
    ).toHaveStyle({ left: "50%" })

    fireEvent.pointerLeave(slider)
    expect(shownDigits(container)).toBe("600")
  })

  it("rolls digits, and drops the transition while scrubbing", () => {
    const { container } = render(<MetricCard data={data} label="Orders" />)
    const strip = () =>
      container.querySelector<HTMLElement>(
        '[data-slot="metric-card-value"] [data-digit]'
      )

    expect(strip()?.className).toContain("transition-transform")
    expect(strip()?.className).toContain("motion-reduce:transition-none")
    expect(strip()).toHaveStyle({ transform: "translateY(-6em)" })

    fireEvent.focus(screen.getByRole("slider"))
    expect(strip()?.className).not.toContain("transition-transform")
  })

  it("formats with Intl options", () => {
    render(
      <MetricCard
        data={data}
        format={{ style: "currency", currency: "EUR" }}
        label="Revenue"
        locale="de-DE"
        value={1234.5}
      />
    )

    expect(screen.getByText("1.234,50 €")).toBeInTheDocument()
  })

  it("runs the period control controlled or uncontrolled", async () => {
    const user = userEvent.setup()
    const onPeriodChange = vi.fn()
    const periods = [
      { value: "7d", label: "7d" },
      { value: "30d", label: "30d" },
      { value: "90d", label: "90d" },
    ]

    function Host() {
      const [period, setPeriod] = React.useState("30d")
      return (
        <MetricCard
          data={data}
          label="Orders"
          onPeriodChange={(next) => {
            onPeriodChange(next)
            setPeriod(next)
          }}
          period={period}
          periods={periods}
        />
      )
    }

    render(<Host />)
    const group = screen.getByRole("radiogroup", { name: "Period" })
    expect(group).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "30d" })).toBeChecked()

    await user.click(screen.getByRole("radio", { name: "7d" }))
    expect(onPeriodChange).toHaveBeenLastCalledWith("7d")
    expect(screen.getByRole("radio", { name: "7d" })).toBeChecked()
    expect(screen.getByRole("radio", { name: "7d" })).toHaveFocus()

    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("radio", { name: "90d" })).toBeChecked()
    expect(screen.getByRole("radio", { name: "90d" })).toHaveFocus()
  })

  it("keeps its own period when uncontrolled", async () => {
    const user = userEvent.setup()
    render(
      <MetricCard
        data={data}
        label="Orders"
        periods={[
          { value: "7d", label: "7d" },
          { value: "30d", label: "30d" },
        ]}
      />
    )

    expect(screen.getByRole("radio", { name: "7d" })).toBeChecked()
    await user.click(screen.getByRole("radio", { name: "30d" }))
    expect(screen.getByRole("radio", { name: "30d" })).toBeChecked()
  })

  it("draws nothing to scrub without data", () => {
    render(<MetricCard data={[]} label="Orders" />)
    expect(screen.queryByRole("slider")).toBeNull()
  })
})
