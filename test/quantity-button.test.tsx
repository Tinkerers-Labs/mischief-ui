import * as React from "react"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { QuantityButton } from "../registry/default/quantity-button/quantity-button"

function deferred() {
  let resolve!: () => void
  let reject!: (error: unknown) => void
  const promise = new Promise<void>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

const count = () => screen.getByRole("spinbutton", { hidden: true })

describe("QuantityButton", () => {
  it("starts as one Add button named for the item", () => {
    render(<QuantityButton label="Margherita pizza" />)

    expect(
      screen.getByRole("button", { name: "Add Margherita pizza" })
    ).toBeInTheDocument()
    expect(screen.queryByRole("spinbutton")).toBeNull()
    expect(
      screen.getByRole("group", { name: "Margherita pizza" })
    ).toHaveAttribute("data-state", "empty")
  })

  it("turns into a stepper on Add and puts focus on plus", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<QuantityButton label="Pizza" onValueChange={onValueChange} />)
    await user.click(screen.getByRole("button", { name: "Add Pizza" }))

    expect(onValueChange).toHaveBeenCalledWith(1)
    expect(count()).toHaveAttribute("aria-valuenow", "1")
    expect(screen.getByRole("button", { name: "One more Pizza" })).toHaveFocus()
    expect(screen.queryByRole("button", { name: "Add Pizza" })).toBeNull()
  })

  it("counts up and down, and removes at the minimum", async () => {
    const user = userEvent.setup()

    render(<QuantityButton label="Pizza" defaultValue={1} />)

    expect(
      screen.getByRole("button", { name: "Remove Pizza" })
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "One more Pizza" }))
    await user.click(screen.getByRole("button", { name: "One more Pizza" }))
    expect(count()).toHaveAttribute("aria-valuenow", "3")

    await user.click(screen.getByRole("button", { name: "One fewer Pizza" }))
    expect(count()).toHaveAttribute("aria-valuenow", "2")
  })

  it("returns focus to Add after the last one is removed", async () => {
    const user = userEvent.setup()

    render(<QuantityButton label="Pizza" defaultValue={1} />)
    await user.click(screen.getByRole("button", { name: "Remove Pizza" }))

    expect(screen.getByRole("button", { name: "Add Pizza" })).toHaveFocus()
    expect(screen.getByText("Removed Pizza")).toBeInTheDocument()
  })

  it("starts from min and stops at max", async () => {
    const user = userEvent.setup()

    render(<QuantityButton label="Bagels" min={2} max={3} />)
    await user.click(screen.getByRole("button", { name: "Add Bagels" }))

    expect(count()).toHaveAttribute("aria-valuenow", "2")
    expect(count()).toHaveAttribute("aria-valuemax", "3")

    const plus = screen.getByRole("button", { name: "One more Bagels" })
    await user.click(plus)
    await user.click(plus)

    expect(count()).toHaveAttribute("aria-valuenow", "3")
    expect(plus).toHaveAttribute("aria-disabled", "true")
  })

  it("steps with the arrow keys on the count, without removing", async () => {
    const user = userEvent.setup()

    render(<QuantityButton label="Pizza" defaultValue={2} max={5} />)
    count().focus()

    await user.keyboard("{ArrowUp}{ArrowRight}")
    expect(count()).toHaveAttribute("aria-valuenow", "4")

    await user.keyboard("{End}")
    expect(count()).toHaveAttribute("aria-valuenow", "5")

    await user.keyboard("{Home}{ArrowDown}")
    expect(count()).toHaveAttribute("aria-valuenow", "1")
    expect(count()).toHaveFocus()
  })

  it("follows a controlled value", async () => {
    const user = userEvent.setup()

    function Cart() {
      const [quantity, setQuantity] = React.useState(0)
      return (
        <>
          <QuantityButton
            label="Pizza"
            value={quantity}
            onValueChange={setQuantity}
          />
          <output>{quantity}</output>
        </>
      )
    }

    render(<Cart />)
    await user.click(screen.getByRole("button", { name: "Add Pizza" }))
    await user.click(screen.getByRole("button", { name: "One more Pizza" }))

    expect(screen.getByRole("status")).toHaveTextContent("2")
  })

  it("holds a pending count, and folds taps made meanwhile into one call", async () => {
    const user = userEvent.setup()
    const first = deferred()
    const second = deferred()
    const onValueChange = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)

    render(
      <QuantityButton
        label="Pizza"
        defaultValue={1}
        onValueChange={onValueChange}
      />
    )

    const plus = screen.getByRole("button", { name: "One more Pizza" })
    await user.click(plus)

    const group = screen.getByRole("group")
    expect(group).toHaveAttribute("aria-busy", "true")
    expect(count()).toHaveAttribute("aria-valuenow", "2")

    await user.click(plus)
    await user.click(plus)
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(count()).toHaveAttribute("aria-valuenow", "4")

    await act(async () => first.resolve())
    expect(onValueChange).toHaveBeenLastCalledWith(4)
    expect(onValueChange).toHaveBeenCalledTimes(2)

    await act(async () => second.resolve())
    expect(group).not.toHaveAttribute("aria-busy")
    expect(count()).toHaveAttribute("aria-valuenow", "4")
  })

  it("puts the count back when the change is refused", async () => {
    const user = userEvent.setup()
    const request = deferred()

    render(
      <QuantityButton
        label="Pizza"
        defaultValue={2}
        onValueChange={() => request.promise}
      />
    )

    await user.click(screen.getByRole("button", { name: "One more Pizza" }))
    expect(count()).toHaveAttribute("aria-valuenow", "3")

    await act(async () => request.reject(new Error("sold out")))

    expect(count()).toHaveAttribute("aria-valuenow", "2")
    expect(screen.getByText("Could not change Pizza.")).toBeInTheDocument()
  })

  it("keeps a hidden half out of the tab order", () => {
    const { container } = render(<QuantityButton label="Pizza" />)

    const stepperButtons = container.querySelectorAll(
      '[data-slot="quantity-button-decrement"], [data-slot="quantity-button-increment"], [data-slot="quantity-button-count"]'
    )
    for (const element of stepperButtons) {
      expect(element).toHaveAttribute("tabindex", "-1")
    }
  })
})
