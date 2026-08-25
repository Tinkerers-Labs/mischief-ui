import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { FloatingIndex } from "../registry/default/floating-index/floating-index"

const items = [
  { id: "motion", label: "Motion" },
  { id: "keyboard", label: "Keyboard" },
  { id: "focus", label: "Focus" },
]

function sections() {
  return (
    <>
      {items.map((item) => (
        <section id={item.id} key={item.id}>
          {item.label}
        </section>
      ))}
    </>
  )
}

/** jsdom has no layout, so the page says how far down it is. */
function scrollTo(y: number, height = 4000) {
  Object.defineProperty(document.documentElement, "scrollHeight", {
    configurable: true,
    value: height,
  })
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: 800,
  })
  Object.defineProperty(window, "scrollY", { configurable: true, value: y })
  window.dispatchEvent(new Event("scroll"))
}

let scrollIntoView: ReturnType<
  typeof vi.fn<(options?: ScrollIntoViewOptions) => void>
>

beforeEach(() => {
  scrollIntoView = vi.fn<(options?: ScrollIntoViewOptions) => void>()
  Element.prototype.scrollIntoView = scrollIntoView
  // The window is shared across tests, so where the last one left the page
  // would decide what this one renders.
  scrollTo(0)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe("FloatingIndex", () => {
  it("scrolls to the section a reader picks", async () => {
    const user = userEvent.setup()
    render(
      <>
        {sections()}
        <FloatingIndex items={items} />
      </>
    )

    await user.click(screen.getByRole("button", { name: /index/i }))
    await user.click(screen.getByRole("button", { name: "Keyboard" }))

    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView.mock.instances[0]).toBe(
      document.getElementById("keyboard")
    )
    expect(scrollIntoView.mock.calls[0]![0]).toMatchObject({ block: "start" })
  })

  it("stays open until the scroll lands, since closing cancels it", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <>
        {sections()}
        <FloatingIndex items={items} />
      </>
    )

    const trigger = screen.getByRole("button", { name: /index/i })
    await user.click(trigger)
    await user.click(screen.getByRole("button", { name: "Keyboard" }))

    // A panel collapsing under an in-flight smooth scroll aborts it, and the
    // reader is left where they started.
    expect(trigger).toHaveAttribute("aria-expanded", "true")

    await act(async () => {
      vi.advanceTimersByTime(800)
    })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
  })

  it("closes as soon as the scroll ends, rather than waiting out the timeout", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <>
        {sections()}
        <FloatingIndex items={items} />
      </>
    )

    const trigger = screen.getByRole("button", { name: /index/i })
    await user.click(trigger)
    await user.click(screen.getByRole("button", { name: "Keyboard" }))

    await act(async () => {
      window.dispatchEvent(new Event("scrollend"))
    })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
  })

  it("says which section the reader is in once they are into the page", async () => {
    render(
      <>
        {sections()}
        <FloatingIndex items={items} label="On this page" />
      </>
    )

    const trigger = screen.getByRole("button", { name: /on this page/i })
    expect(trigger).toHaveTextContent("On this page")

    await act(async () => {
      scrollTo(1200)
    })

    await waitFor(() => expect(trigger).toHaveTextContent("Motion"))
  })

  it("keeps the label at the top of the page, where no section has been reached", async () => {
    render(
      <>
        {sections()}
        <FloatingIndex items={items} label="On this page" />
      </>
    )

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /on this page/i })
      ).toHaveTextContent("On this page")
    )
  })

  it("moves to a corner without the caller undoing the default", async () => {
    const { rerender } = render(
      <>
        {sections()}
        <FloatingIndex items={items} position="bottom-right" />
      </>
    )

    const nav = screen.getByRole("navigation")
    expect(nav.className).toContain("bottom-6")
    expect(nav.className).toContain("right-6")
    // The centring the default needs must not survive into a corner.
    expect(nav.className).not.toContain("left-1/2")
    expect(nav.className).not.toContain("-translate-x-1/2")

    rerender(
      <>
        {sections()}
        <FloatingIndex items={items} position="bottom-left" />
      </>
    )
    expect(screen.getByRole("navigation").className).toContain("left-6")
  })

  it("floats at the top, centred, until told otherwise", () => {
    render(
      <>
        {sections()}
        <FloatingIndex items={items} />
      </>
    )

    const nav = screen.getByRole("navigation")
    expect(nav.className).toContain("top-6")
    expect(nav.className).toContain("-translate-x-1/2")
  })

  it("keeps the label throughout when asked to", async () => {
    render(
      <>
        {sections()}
        <FloatingIndex
          items={items}
          label="On this page"
          showActiveLabel={false}
        />
      </>
    )

    const trigger = screen.getByRole("button", { name: /on this page/i })

    await act(async () => {
      scrollTo(1200)
    })

    expect(trigger).toHaveTextContent("On this page")
    expect(trigger).not.toHaveTextContent("Motion")
  })
})
