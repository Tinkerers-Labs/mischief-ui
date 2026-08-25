import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ChainOfThought } from "../registry/default/chain-of-thought/chain-of-thought"

const thoughts = [
  { id: "read", label: "Read the retry handler", duration: 0.8 },
  { id: "trace", label: "Traced the listener", duration: 2.1 },
]

describe("ChainOfThought", () => {
  it("opens itself while thinking and folds away when done", () => {
    const { rerender } = render(<ChainOfThought thoughts={thoughts} thinking />)

    expect(screen.getByRole("button", { expanded: true })).toBeInTheDocument()

    rerender(<ChainOfThought thoughts={thoughts} />)
    expect(screen.getByRole("button", { expanded: false })).toBeInTheDocument()
  })

  it("stops deciding once a reader has opened it", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<ChainOfThought thoughts={thoughts} />)

    await user.click(screen.getByRole("button"))
    expect(screen.getByRole("button", { expanded: true })).toBeInTheDocument()

    // Finishing would otherwise close it under someone who is reading.
    rerender(<ChainOfThought thoughts={thoughts} thinking={false} />)
    expect(screen.getByRole("button", { expanded: true })).toBeInTheDocument()
  })

  it("keeps the streaming trace out of the live region", () => {
    const { container } = render(
      <ChainOfThought thoughts={thoughts} thinking />
    )

    const live = container.querySelector("[aria-live]")!
    expect(live).toHaveTextContent("Working on it")
    expect(live).not.toHaveTextContent("Read the retry handler")
  })

  it("totals the time it spent", () => {
    render(<ChainOfThought thoughts={thoughts} />)

    expect(screen.getByRole("button")).toHaveTextContent("Thought for 2.9s")
  })

  it("says a step's status rather than only colouring it", () => {
    render(
      <ChainOfThought
        thoughts={[{ id: "a", label: "Checked the tests", status: "failed" }]}
        defaultOpen
      />
    )

    expect(screen.getByRole("listitem")).toHaveTextContent(
      "Checked the tests, failed"
    )
  })

  it("hands the disclosure over when it is controlled", async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    render(
      <ChainOfThought
        thoughts={thoughts}
        open={false}
        onOpenChange={onOpenChange}
      />
    )

    await user.click(screen.getByRole("button"))

    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole("button", { expanded: false })).toBeInTheDocument()
  })
})
