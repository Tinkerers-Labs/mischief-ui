import * as React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

import {
  WheelPicker,
  WheelPickerGroup,
} from "../registry/default/wheel-picker/wheel-picker"

const hours = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: String(index + 1),
}))

const sizes = ["XS", "S", "M", "L", "XL"].map((size) => ({
  value: size.toLowerCase(),
  label: size,
}))

const months = ["January", "February", "March", "May", "June"].map((month) => ({
  value: month,
  label: month,
}))

// jsdom lays nothing out, so scroll position is kept by hand.
const positions = new WeakMap<Element, number>()
const original = Object.getOwnPropertyDescriptor(Element.prototype, "scrollTop")

beforeAll(() => {
  Object.defineProperty(Element.prototype, "scrollTop", {
    configurable: true,
    get() {
      return positions.get(this) ?? 0
    },
    set(value: number) {
      positions.set(this, value)
    },
  })
  Object.defineProperty(Element.prototype, "scrollTo", {
    configurable: true,
    value(this: Element, options: ScrollToOptions) {
      positions.set(this, options.top ?? 0)
    },
  })
})

afterAll(() => {
  if (original) Object.defineProperty(Element.prototype, "scrollTop", original)
})

function setReducedMotion(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: matches && query.includes("reduce"),
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  })
}

describe("WheelPicker", () => {
  it("is a named spinbutton that reads out the label, not the index", () => {
    render(<WheelPicker label="Size" options={sizes} defaultValue="m" />)

    const wheel = screen.getByRole("spinbutton", { name: "Size" })

    expect(wheel).toHaveAttribute("aria-valuetext", "M")
    expect(wheel).toHaveAttribute("aria-valuenow", "2")
    expect(wheel).toHaveAttribute("aria-valuemin", "0")
    expect(wheel).toHaveAttribute("aria-valuemax", "4")
  })

  it("starts scrolled to the chosen row", () => {
    render(
      <WheelPicker
        label="Size"
        options={sizes}
        defaultValue="l"
        itemHeight={40}
      />
    )

    expect(screen.getByRole("spinbutton").scrollTop).toBe(120)
  })

  it("moves with the arrow, page, home and end keys", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <WheelPicker
        label="Hour"
        options={hours}
        defaultValue="6"
        onValueChange={onValueChange}
      />
    )

    const wheel = screen.getByRole("spinbutton")
    wheel.focus()

    await user.keyboard("{ArrowDown}")
    expect(wheel).toHaveAttribute("aria-valuetext", "7")

    await user.keyboard("{ArrowUp}{ArrowUp}")
    expect(wheel).toHaveAttribute("aria-valuetext", "5")

    await user.keyboard("{PageDown}")
    expect(wheel).toHaveAttribute("aria-valuetext", "10")

    await user.keyboard("{End}")
    expect(wheel).toHaveAttribute("aria-valuetext", "12")

    await user.keyboard("{ArrowDown}")
    expect(wheel).toHaveAttribute("aria-valuetext", "12")

    await user.keyboard("{Home}")
    expect(wheel).toHaveAttribute("aria-valuetext", "1")
    expect(onValueChange).toHaveBeenLastCalledWith("1")
  })

  it("wraps around when it loops", async () => {
    const user = userEvent.setup()

    render(<WheelPicker label="Hour" options={hours} defaultValue="12" loop />)

    const wheel = screen.getByRole("spinbutton")
    wheel.focus()

    await user.keyboard("{ArrowDown}")
    expect(wheel).toHaveAttribute("aria-valuetext", "1")

    await user.keyboard("{ArrowUp}")
    expect(wheel).toHaveAttribute("aria-valuetext", "12")
  })

  it("jumps to what is typed, and cycles on a repeated letter", async () => {
    const user = userEvent.setup()

    render(<WheelPicker label="Month" options={months} />)

    const wheel = screen.getByRole("spinbutton")
    wheel.focus()

    await user.keyboard("j")
    expect(wheel).toHaveAttribute("aria-valuetext", "June")

    await user.keyboard("j")
    expect(wheel).toHaveAttribute("aria-valuetext", "January")
  })

  it("matches several typed letters as one word", async () => {
    const user = userEvent.setup()

    render(<WheelPicker label="Month" options={months} />)

    const wheel = screen.getByRole("spinbutton")
    wheel.focus()

    await user.keyboard("ma")
    expect(wheel).toHaveAttribute("aria-valuetext", "March")

    await user.keyboard("y")
    expect(wheel).toHaveAttribute("aria-valuetext", "May")
  })

  it("chooses the row a scroll comes to rest on", () => {
    vi.useFakeTimers()
    const onValueChange = vi.fn()

    render(
      <WheelPicker
        label="Size"
        options={sizes}
        itemHeight={40}
        onValueChange={onValueChange}
      />
    )

    const wheel = screen.getByRole("spinbutton")
    wheel.scrollTop = 160
    fireEvent.scroll(wheel)

    expect(onValueChange).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(onValueChange).toHaveBeenCalledWith("xl")
    expect(wheel).toHaveAttribute("aria-valuetext", "XL")
    vi.useRealTimers()
  })

  it("follows a controlled value", () => {
    const { rerender } = render(
      <WheelPicker label="Size" options={sizes} value="s" itemHeight={40} />
    )

    const wheel = screen.getByRole("spinbutton")
    expect(wheel.scrollTop).toBe(40)

    rerender(
      <WheelPicker label="Size" options={sizes} value="xl" itemHeight={40} />
    )

    expect(wheel).toHaveAttribute("aria-valuetext", "XL")
    expect(wheel.scrollTop).toBe(160)
  })

  it("curves the rows into a drum, and lays them flat with reduced motion", () => {
    setReducedMotion(false)
    const { unmount } = render(
      <WheelPicker label="Size" options={sizes} defaultValue="m" />
    )

    const items = document.querySelectorAll<HTMLElement>(
      '[data-slot="wheel-picker-item"]'
    )
    expect(items[0]!.style.transform).toContain("rotateX")
    expect(items[2]!.style.transform).toContain("rotateX(0rad)")
    unmount()

    setReducedMotion(true)
    render(<WheelPicker label="Size" options={sizes} defaultValue="m" />)

    for (const item of document.querySelectorAll<HTMLElement>(
      '[data-slot="wheel-picker-item"]'
    )) {
      expect(item.style.transform).toBe("")
    }
    setReducedMotion(false)
  })

  it("submits its value with a form", () => {
    const { container } = render(
      <form>
        <WheelPicker
          label="Size"
          name="size"
          options={sizes}
          defaultValue="s"
        />
      </form>
    )

    expect(new FormData(container.querySelector("form")!).get("size")).toBe("s")
  })

  it("leaves the tab order when disabled", () => {
    render(<WheelPicker label="Size" options={sizes} disabled />)

    const wheel = screen.getByRole("spinbutton")
    expect(wheel).toHaveAttribute("tabindex", "-1")
    expect(wheel).toHaveAttribute("aria-disabled", "true")
  })
})

describe("WheelPickerGroup", () => {
  function TimePicker() {
    const [hour, setHour] = React.useState("9")
    return (
      <WheelPickerGroup label="Start time">
        <WheelPicker
          label="Hour"
          options={hours}
          value={hour}
          onValueChange={setHour}
        />
        <WheelPicker
          label="Period"
          options={[
            { value: "am", label: "AM" },
            { value: "pm", label: "PM" },
          ]}
        />
      </WheelPickerGroup>
    )
  }

  it("names the set and moves between wheels with left and right", async () => {
    const user = userEvent.setup()
    render(<TimePicker />)

    const group = screen.getByRole("group", { name: "Start time" })
    const [hour, period] = screen.getAllByRole("spinbutton")

    expect(group).toContainElement(hour!)
    expect(
      group.querySelectorAll('[data-slot="wheel-picker-band"]')
    ).toHaveLength(1)

    hour!.focus()
    await user.keyboard("{ArrowRight}")
    expect(period).toHaveFocus()

    await user.keyboard("{ArrowDown}")
    expect(period).toHaveAttribute("aria-valuetext", "PM")

    await user.keyboard("{ArrowLeft}{ArrowUp}")
    expect(hour).toHaveFocus()
    expect(hour).toHaveAttribute("aria-valuetext", "8")
  })
})
