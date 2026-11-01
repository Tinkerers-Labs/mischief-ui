import * as React from "react"
import { act, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  MessageQueue,
  type QueuedMessage,
} from "../registry/default/message-queue/message-queue"

const wait = (ms: number) =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)))

const start: QueuedMessage[] = [
  { id: "a", text: "Run the tests" },
  { id: "b", text: "Then open a pull request" },
  { id: "c", text: "Tag me as reviewer" },
]

function Harness({
  busy,
  onRelease = () => undefined,
  initial = start,
}: {
  busy: boolean
  onRelease?: (item: QueuedMessage) => void
  initial?: QueuedMessage[]
}) {
  const [items, setItems] = React.useState(initial)

  return (
    <MessageQueue
      busy={busy}
      items={items}
      onItemsChange={setItems}
      onRelease={onRelease}
    />
  )
}

const texts = () =>
  within(screen.getByRole("list", { name: "Queued messages" }))
    .getAllByRole("listitem")
    .map((item) => item.textContent)

function setReducedMotion(matches: boolean) {
  const original = window.matchMedia
  const swap = (value: typeof window.matchMedia) =>
    Object.defineProperty(window, "matchMedia", { configurable: true, value })
  swap(
    (query: string) =>
      ({
        ...original(query),
        matches: query.includes("reduce") ? matches : false,
      }) as MediaQueryList
  )
  return () => swap(original)
}

describe("MessageQueue", () => {
  it("renders nothing visible while empty", () => {
    render(
      <MessageQueue
        busy
        items={[]}
        onItemsChange={vi.fn()}
        onRelease={vi.fn()}
      />
    )

    expect(screen.queryByRole("list")).toBeNull()
  })

  it("holds items while busy, then releases one per idle spell", async () => {
    const onRelease = vi.fn()
    const { rerender } = render(<Harness busy onRelease={onRelease} />)

    await wait(300)
    expect(onRelease).not.toHaveBeenCalled()
    expect(screen.getByText("Sends when the agent finishes")).toBeVisible()

    rerender(<Harness busy={false} onRelease={onRelease} />)
    expect(screen.getAllByRole("listitem")[0]).toHaveAttribute("data-releasing")
    await wait(300)

    expect(onRelease).toHaveBeenCalledTimes(1)
    expect(onRelease).toHaveBeenCalledWith(start[0])
    expect(texts()).toEqual([start[1]!.text, start[2]!.text])
    expect(screen.getByRole("status")).toHaveTextContent(
      "Sending: Run the tests"
    )

    await wait(300)
    expect(onRelease).toHaveBeenCalledTimes(1)

    rerender(<Harness busy onRelease={onRelease} />)
    rerender(<Harness busy={false} onRelease={onRelease} />)
    await wait(300)
    expect(onRelease).toHaveBeenLastCalledWith(start[1])
  })

  it("releases with no delay under reduced motion", async () => {
    const restore = setReducedMotion(true)
    const onRelease = vi.fn()

    render(<Harness busy={false} onRelease={onRelease} />)
    await wait(20)

    expect(onRelease).toHaveBeenCalledWith(start[0])
    restore()
  })

  it("edits an item inline", async () => {
    const user = userEvent.setup()
    render(<Harness busy />)

    await user.click(screen.getByRole("button", { name: "Edit Run the tests" }))
    const field = screen.getByRole("textbox", { name: "Edit queued message" })
    expect(field).toHaveFocus()

    await user.type(field, " for the api package{Enter}")

    expect(texts()[0]).toBe("Run the tests for the api package")
    expect(
      screen.getByRole("button", {
        name: "Edit Run the tests for the api package",
      })
    ).toHaveFocus()
  })

  it("throws away an edit on Escape, and removes an item edited to nothing", async () => {
    const user = userEvent.setup()
    render(<Harness busy />)

    await user.click(screen.getByRole("button", { name: "Edit Run the tests" }))
    await user.type(screen.getByRole("textbox"), " now{Escape}")
    expect(texts()[0]).toBe("Run the tests")

    await user.click(screen.getByRole("button", { name: "Edit Run the tests" }))
    await user.clear(screen.getByRole("textbox"))
    await user.keyboard("{Enter}")
    expect(texts()).toEqual([start[1]!.text, start[2]!.text])
  })

  it("does not release the first item while it is being edited", async () => {
    const user = userEvent.setup()
    const onRelease = vi.fn()
    const { rerender } = render(<Harness busy onRelease={onRelease} />)

    await user.click(screen.getByRole("button", { name: "Edit Run the tests" }))
    rerender(<Harness busy={false} onRelease={onRelease} />)
    await wait(300)
    expect(onRelease).not.toHaveBeenCalled()

    await user.keyboard(" first{Enter}")
    await wait(300)
    expect(onRelease).toHaveBeenCalledWith({
      id: "a",
      text: "Run the tests first",
    })
  })

  it("reorders from the keyboard and keeps focus on the moved item", async () => {
    const user = userEvent.setup()
    render(<Harness busy />)

    const handle = screen.getByRole("button", { name: "Move Run the tests" })
    expect(handle).toHaveAccessibleDescription(/arrow keys/)
    handle.focus()

    await user.keyboard("{ArrowDown}")
    expect(texts()).toEqual([start[1]!.text, start[0]!.text, start[2]!.text])
    expect(
      screen.getByRole("button", { name: "Move Run the tests" })
    ).toHaveFocus()
    expect(screen.getByRole("status")).toHaveTextContent(
      "Run the tests, moved to position 2 of 3"
    )

    await user.keyboard("{ArrowUp}{ArrowUp}")
    expect(texts()[0]).toBe("Run the tests")
  })

  it("reorders by dragging the handle", () => {
    render(<Harness busy />)

    const rows = screen.getAllByRole("listitem")
    rows.forEach((row, index) => {
      row.getBoundingClientRect = () =>
        ({ top: index * 40, height: 40, bottom: index * 40 + 40 }) as DOMRect
    })

    const handle = screen.getByRole("button", {
      name: "Move Tag me as reviewer",
    })
    fireEvent.pointerDown(handle, { button: 0, pointerId: 1 })
    fireEvent.pointerMove(handle, { clientY: 5, pointerId: 1 })
    fireEvent.pointerUp(handle, { pointerId: 1 })

    expect(texts()[0]).toBe("Tag me as reviewer")
  })

  it("removes an item and moves focus to the next one", async () => {
    const user = userEvent.setup()
    render(<Harness busy />)

    await user.click(
      screen.getByRole("button", { name: "Remove Run the tests" })
    )

    expect(texts()).toEqual([start[1]!.text, start[2]!.text])
    expect(
      screen.getByRole("button", { name: "Edit Then open a pull request" })
    ).toHaveFocus()
    expect(screen.getByRole("status")).toHaveTextContent(
      "Removed: Run the tests"
    )
  })
})
