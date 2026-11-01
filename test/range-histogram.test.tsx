import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { RangeHistogram } from "../registry/default/range-histogram/range-histogram"

const values = [10, 20, 20, 30, 40, 50, 60, 70, 80, 90, 100]

describe("RangeHistogram", () => {
  it("names both handles and states their range and text", () => {
    render(
      <RangeHistogram
        label="Price"
        values={values}
        defaultValue={[20, 80]}
        formatValue={(value) => `$${value}`}
      />
    )

    const low = screen.getByRole("slider", { name: "Price minimum" })
    const high = screen.getByRole("slider", { name: "Price maximum" })

    expect(screen.getByRole("group", { name: "Price" })).toBeInTheDocument()
    expect(low).toHaveAttribute("aria-valuenow", "20")
    expect(low).toHaveAttribute("aria-valuetext", "$20")
    expect(low).toHaveAttribute("aria-valuemax", "80")
    expect(high).toHaveAttribute("aria-valuemin", "20")
    expect(high).toHaveAttribute("aria-valuemax", "100")
  })

  it("counts the values inside the range exactly", () => {
    render(
      <RangeHistogram label="Price" values={values} defaultValue={[20, 50]} />
    )

    expect(screen.getByText("5 of 11 results")).toBeInTheDocument()
  })

  it("moves with the keyboard, in small and large steps", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const onValueCommit = vi.fn()

    render(
      <RangeHistogram
        label="Price"
        min={0}
        max={100}
        defaultValue={[20, 80]}
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
      />
    )

    const low = screen.getByRole("slider", { name: "Price minimum" })
    low.focus()

    await user.keyboard("{ArrowRight}")
    expect(low).toHaveAttribute("aria-valuenow", "21")

    await user.keyboard("{Shift>}{ArrowRight}{/Shift}")
    expect(low).toHaveAttribute("aria-valuenow", "31")

    await user.keyboard("{PageDown}")
    expect(low).toHaveAttribute("aria-valuenow", "21")

    await user.keyboard("{Home}")
    expect(low).toHaveAttribute("aria-valuenow", "0")

    expect(onValueChange).toHaveBeenLastCalledWith([0, 80])
    expect(onValueCommit).toHaveBeenLastCalledWith([0, 80])
  })

  it("never lets the handles cross", async () => {
    const user = userEvent.setup()

    render(
      <RangeHistogram label="Price" min={0} max={100} defaultValue={[40, 60]} />
    )

    const low = screen.getByRole("slider", { name: "Price minimum" })
    const high = screen.getByRole("slider", { name: "Price maximum" })

    low.focus()
    await user.keyboard("{End}{ArrowRight}{PageUp}")
    expect(low).toHaveAttribute("aria-valuenow", "60")

    high.focus()
    await user.keyboard("{Home}{ArrowLeft}")
    expect(high).toHaveAttribute("aria-valuenow", "60")
  })

  it("drags the nearer handle with a pointer and commits on release", () => {
    const onValueCommit = vi.fn()

    const { container } = render(
      <RangeHistogram
        label="Price"
        min={0}
        max={100}
        defaultValue={[20, 80]}
        onValueCommit={onValueCommit}
      />
    )

    const control = container.querySelector<HTMLElement>(
      "[data-slot='range-histogram-control']"
    )!
    const track = container.querySelector<HTMLElement>(
      "[data-slot='range-histogram-track']"
    )!
    track.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 200, height: 6 }) as DOMRect

    fireEvent.pointerDown(control, { button: 0, pointerId: 1, clientX: 180 })
    fireEvent.pointerMove(control, { pointerId: 1, clientX: 150 })
    fireEvent.pointerUp(control, { pointerId: 1 })

    expect(
      screen.getByRole("slider", { name: "Price maximum" })
    ).toHaveAttribute("aria-valuenow", "75")
    expect(onValueCommit).toHaveBeenCalledWith([20, 75])
    expect(screen.getByRole("status")).toHaveTextContent("results")
  })

  it("accepts typed bounds and clamps them to the other handle", async () => {
    const user = userEvent.setup()

    render(
      <RangeHistogram
        label="Price"
        min={0}
        max={100}
        defaultValue={[20, 80]}
        inputs
      />
    )

    const [lowInput] = screen.getAllByRole("spinbutton")
    await user.clear(lowInput!)
    await user.type(lowInput!, "95{Enter}")

    expect(
      screen.getByRole("slider", { name: "Price minimum" })
    ).toHaveAttribute("aria-valuenow", "80")
    expect(lowInput).toHaveValue(80)
  })

  it("follows a controlled value", () => {
    function Controlled() {
      const [value, setValue] = React.useState<[number, number]>([10, 30])
      return (
        <>
          <RangeHistogram
            label="Duration"
            values={values}
            value={value}
            onValueChange={setValue}
          />
          <button type="button" onClick={() => setValue([60, 100])}>
            Long
          </button>
        </>
      )
    }

    render(<Controlled />)
    fireEvent.click(screen.getByRole("button", { name: "Long" }))

    expect(
      screen.getByRole("slider", { name: "Duration minimum" })
    ).toHaveAttribute("aria-valuenow", "60")
    expect(screen.getByText("5 of 11 results")).toBeInTheDocument()
  })

  it("estimates from precomputed bins when no values are given", () => {
    render(
      <RangeHistogram
        label="Size"
        bins={[
          { start: 0, end: 10, count: 4 },
          { start: 10, end: 20, count: 10 },
        ]}
        defaultValue={[5, 20]}
      />
    )

    expect(screen.getByText("12 of 14 results")).toBeInTheDocument()
  })

  it("ignores input while disabled", async () => {
    const user = userEvent.setup()
    render(
      <RangeHistogram
        label="Price"
        min={0}
        max={100}
        defaultValue={[20, 80]}
        disabled
      />
    )

    const low = screen.getByRole("slider", { name: "Price minimum" })
    expect(low).toHaveAttribute("tabindex", "-1")
    low.focus()
    await user.keyboard("{ArrowRight}")
    expect(low).toHaveAttribute("aria-valuenow", "20")
  })
})
