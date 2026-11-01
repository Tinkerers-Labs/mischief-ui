import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { UndoButton } from "../registry/default/undo-button/undo-button"

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

function press(button: HTMLElement) {
  fireEvent.pointerDown(button, { pointerType: "mouse" })
  fireEvent.focus(button)
  fireEvent.click(button)
}

describe("UndoButton", () => {
  it("acts at once and commits only after the grace window", () => {
    const onAction = vi.fn()
    const onCommit = vi.fn()
    render(<UndoButton onAction={onAction} onCommit={onCommit} />)

    press(screen.getByRole("button", { name: "Delete" }))

    expect(onAction).toHaveBeenCalledTimes(1)
    const undo = screen.getByRole("button", { name: /Undo/ })
    expect(undo).toHaveAttribute("data-state", "pending")
    expect(undo).toHaveTextContent("5s")

    advance(4000)
    expect(onCommit).not.toHaveBeenCalled()

    advance(1100)
    expect(onCommit).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("button", { name: "Delete" })).toHaveAttribute(
      "data-state",
      "idle"
    )
  })

  it("takes the action back", () => {
    const onCommit = vi.fn()
    const onUndo = vi.fn()
    const { container } = render(
      <UndoButton onCommit={onCommit} onUndo={onUndo} />
    )

    press(screen.getByRole("button", { name: "Delete" }))
    advance(2000)
    press(screen.getByRole("button", { name: /Undo/ }))

    expect(onUndo).toHaveBeenCalledTimes(1)
    advance(10000)
    expect(onCommit).not.toHaveBeenCalled()
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      "Undone"
    )
  })

  it("announces what happened and how long there is to undo it", () => {
    const { container } = render(
      <UndoButton onCommit={vi.fn()} message="Moved to trash" duration={8000} />
    )

    press(screen.getByRole("button", { name: "Delete" }))

    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      "Moved to trash. Undo available for 8 seconds"
    )
  })

  it("holds the clock while a mouse rests on it", () => {
    const onCommit = vi.fn()
    render(<UndoButton onCommit={onCommit} />)

    const button = screen.getByRole("button", { name: "Delete" })
    press(button)
    fireEvent.pointerEnter(button, { pointerType: "mouse" })
    advance(20000)

    expect(onCommit).not.toHaveBeenCalled()
    expect(button).toHaveAttribute("data-paused", "true")

    fireEvent.pointerLeave(button, { pointerType: "mouse" })
    advance(5100)
    expect(onCommit).toHaveBeenCalledTimes(1)
  })

  it("holds the clock while keyboard focus is on it", () => {
    const onCommit = vi.fn()
    render(<UndoButton onCommit={onCommit} />)

    const button = screen.getByRole("button", { name: "Delete" })
    fireEvent.focus(button)
    fireEvent.click(button)
    advance(20000)

    expect(onCommit).not.toHaveBeenCalled()

    fireEvent.blur(button)
    advance(5100)
    expect(onCommit).toHaveBeenCalledTimes(1)
  })

  it("does not hold the clock for the focus a click leaves behind", () => {
    const onCommit = vi.fn()
    render(<UndoButton onCommit={onCommit} />)

    press(screen.getByRole("button", { name: "Delete" }))
    advance(5100)

    expect(onCommit).toHaveBeenCalledTimes(1)
  })

  it("commits when it leaves the page mid window", () => {
    const onCommit = vi.fn()
    const { unmount } = render(<UndoButton onCommit={onCommit} />)

    press(screen.getByRole("button", { name: "Delete" }))
    unmount()

    expect(onCommit).toHaveBeenCalledTimes(1)
  })

  it("keeps the draining bar out of reduced motion", () => {
    const { container } = render(<UndoButton onCommit={vi.fn()} />)

    press(screen.getByRole("button", { name: "Delete" }))

    expect(container.querySelector(".motion-reduce\\:hidden")).not.toBeNull()
  })
})
