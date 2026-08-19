import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ScrollToTopButton } from "../registry/default/scroll-to-top-button/scroll-to-top-button"

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { configurable: true, value: y })
  fireEvent.scroll(window)
}

afterEach(() => scrollTo(0))

describe("ScrollToTopButton", () => {
  it("is inert until the page has moved down", () => {
    render(<ScrollToTopButton showAfter={720} />)

    const button = screen.getByRole("button", { hidden: true })

    expect(button).toHaveAttribute("aria-hidden", "true")
    expect(button).toHaveAttribute("tabindex", "-1")
    expect(button).not.toHaveAttribute("data-visible")
  })

  it("becomes reachable once past the threshold", () => {
    render(<ScrollToTopButton showAfter={720} />)

    scrollTo(800)

    const button = screen.getByRole("button", { name: "Scroll to top" })

    expect(button).toHaveAttribute("data-visible", "true")
    expect(button).not.toHaveAttribute("aria-hidden")
    expect(button).not.toHaveAttribute("tabindex")
  })

  it("stays in the page so it can fade rather than appear", () => {
    const { container } = render(<ScrollToTopButton />)

    expect(container.querySelector("button")).toBeInTheDocument()
  })

  it("scrolls the window to the top", async () => {
    const user = userEvent.setup()
    const scroll = vi.fn()
    window.scrollTo = scroll as unknown as typeof window.scrollTo

    render(<ScrollToTopButton showAfter={100} />)
    scrollTo(400)

    await user.click(screen.getByRole("button", { name: "Scroll to top" }))

    expect(scroll).toHaveBeenCalledWith({ top: 0, behavior: "smooth" })
  })

  it("hands the scroll over when the click is claimed", async () => {
    const user = userEvent.setup()
    const scroll = vi.fn()
    window.scrollTo = scroll as unknown as typeof window.scrollTo

    // This is the escape hatch for a page driven by its own smooth scroller.
    render(
      <ScrollToTopButton
        showAfter={100}
        onClick={(event) => event.preventDefault()}
      />
    )
    scrollTo(400)

    await user.click(screen.getByRole("button", { name: "Scroll to top" }))

    expect(scroll).not.toHaveBeenCalled()
  })

  it("takes a name of its own", () => {
    render(<ScrollToTopButton label="back to top" showAfter={0} />)
    scrollTo(10)

    expect(
      screen.getByRole("button", { name: "back to top" })
    ).toBeInTheDocument()
  })
})
