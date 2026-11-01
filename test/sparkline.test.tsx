import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Sparkline } from "../registry/default/sparkline/sparkline"

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"]

describe("Sparkline", () => {
  it("names the chart with its low, high, latest and trend", () => {
    render(<Sparkline data={[100, 120, 90, 110, 125]} label="Signups" />)

    expect(screen.getByRole("img")).toHaveAccessibleName(
      "Signups. Low 90, high 125, latest 125. Up 25% from the first value."
    )
  })

  it("shows the change with a sign and an arrow, not colour alone", () => {
    const { container, rerender } = render(
      <Sparkline data={[200, 180, 150]} label="Revenue" />
    )

    const badge = container.querySelector('[data-slot="sparkline-change"]')
    expect(badge).toHaveTextContent("-25%")
    expect(badge?.querySelector("svg")).not.toBeNull()
    expect(badge).not.toHaveAttribute("data-good")

    rerender(
      <Sparkline data={[200, 180, 150]} goodDirection="down" label="Latency" />
    )
    expect(
      container.querySelector('[data-slot="sparkline-change"]')
    ).toHaveAttribute("data-good", "true")
  })

  it("moves the readout with the arrow keys and skips gaps", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Sparkline data={[4, null, 6, 8, 9]} label="Orders" labels={days} />
    )

    await user.tab()
    const slider = screen.getByRole("slider", { name: "Orders, read a value" })
    expect(slider).toHaveFocus()
    expect(slider).toHaveAttribute("aria-valuetext", "Fri: 9")

    await user.keyboard("{ArrowLeft}{ArrowLeft}")
    expect(slider).toHaveAttribute("aria-valuetext", "Wed: 6")

    await user.keyboard("{ArrowLeft}")
    expect(slider).toHaveAttribute("aria-valuetext", "Mon: 4")
    expect(
      container.querySelector('[data-slot="sparkline-readout"]')
    ).toHaveTextContent("Mon4")

    await user.keyboard("{End}")
    expect(slider).toHaveAttribute("aria-valuetext", "Fri: 9")

    await user.tab()
    expect(
      container.querySelector('[data-slot="sparkline-readout"]')
    ).toBeNull()
  })

  it("reads the point under the pointer", () => {
    const { container } = render(
      <Sparkline data={[1, 2, 3, 4, 5]} label="Visits" labels={days} />
    )
    const slider = screen.getByRole("slider")
    slider.getBoundingClientRect = () =>
      ({ left: 0, width: 100, top: 0, height: 32 }) as DOMRect

    fireEvent.pointerMove(slider, { clientX: 26 })
    expect(slider).toHaveAttribute("aria-valuetext", "Tue: 2")
    expect(container.firstChild).toHaveAttribute("data-state", "scrubbing")

    fireEvent.pointerLeave(slider)
    expect(container.firstChild).toHaveAttribute("data-state", "idle")
  })

  it("handles a flat line, one point, negatives, and no data", () => {
    const { rerender } = render(<Sparkline data={[5, 5, 5]} label="Flat" />)
    expect(screen.getByRole("img")).toHaveAccessibleName(
      "Flat. Low 5, high 5, latest 5. Unchanged from the first value."
    )

    rerender(<Sparkline data={[7]} label="Single" />)
    expect(screen.getByRole("img")).toHaveAccessibleName(
      "Single. One value, 7."
    )

    rerender(<Sparkline data={[-4, 2, -1]} label="Net" />)
    expect(screen.getByRole("img")).toHaveAccessibleName(
      "Net. Low -4, high 2, latest -1. Up 75% from the first value."
    )

    rerender(<Sparkline data={[null, null]} label="Empty" />)
    expect(screen.getByRole("img")).toHaveAccessibleName("Empty. No data.")
    expect(screen.queryByRole("slider")).toBeNull()
  })

  it("can carry a hidden table of every value", () => {
    render(
      <Sparkline
        data={[1200, null, 1350]}
        format={{
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }}
        label="Revenue"
        labels={["Mon", "Tue", "Wed"]}
        table
      />
    )

    const table = screen.getByRole("table", { name: "Revenue" })
    expect(table).toHaveTextContent("Mon$1,200")
    expect(table).toHaveTextContent("TueNo data")
    expect(table).toHaveTextContent("Wed$1,350")
  })

  it("leaves scrubbing out when asked", () => {
    render(<Sparkline data={[1, 2]} label="Static" scrub={false} />)
    expect(screen.queryByRole("slider")).toBeNull()
  })
})
