import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  StatusIsland,
  type StatusIslandTask,
} from "../registry/default/status-island/status-island"

const upload: StatusIslandTask = {
  id: "a",
  label: "site-plan.pdf",
  progress: 0.42,
  status: "running",
}
const sync: StatusIslandTask = {
  id: "b",
  label: "Calendar sync",
  status: "running",
}

afterEach(() => {
  vi.useRealTimers()
})

function live(container: HTMLElement) {
  return container.querySelector('[aria-live="polite"]')
}

describe("StatusIsland", () => {
  it("stays hidden with nothing to report", () => {
    render(<StatusIsland tasks={[]} />)

    const island = screen.getByRole("region", { hidden: true })
    expect(island).toHaveAttribute("data-state", "hidden")
    expect(island).toHaveAttribute("aria-hidden", "true")
  })

  it("leads with one task and counts the rest", () => {
    render(<StatusIsland tasks={[upload, sync]} />)

    const summary = screen.getByRole("button", { expanded: false })
    expect(summary).toHaveTextContent("site-plan.pdf")
    expect(summary).toHaveTextContent("42%")
    expect(summary).toHaveTextContent("+1 more task")
  })

  it("puts a failure ahead of work still running", () => {
    render(
      <StatusIsland
        tasks={[upload, { ...sync, status: "error", detail: "Offline" }]}
      />
    )

    const summary = screen.getByRole("button", { expanded: false })
    expect(summary).toHaveTextContent("Calendar sync")
    expect(summary).toHaveTextContent("Failed")
    expect(screen.getByRole("region")).toHaveAttribute("data-state", "error")
  })

  it("opens into every task with cancel and retry", async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onRetry = vi.fn()
    render(
      <StatusIsland
        tasks={[upload, { ...sync, status: "error" }]}
        onCancel={onCancel}
        onRetry={onRetry}
      />
    )

    await user.click(screen.getByRole("button", { expanded: false }))

    expect(screen.getByRole("button", { expanded: true })).toBeInTheDocument()
    expect(screen.getAllByRole("listitem")).toHaveLength(2)
    expect(
      screen.getByRole("progressbar", { name: "site-plan.pdf" })
    ).toHaveAttribute("aria-valuenow", "42")

    await user.click(
      screen.getByRole("button", { name: "Cancel site-plan.pdf" })
    )
    await user.click(
      screen.getByRole("button", { name: "Retry Calendar sync" })
    )

    expect(onCancel).toHaveBeenCalledWith("a")
    expect(onRetry).toHaveBeenCalledWith("b")
  })

  it("closes on Escape and returns focus to the summary", async () => {
    const user = userEvent.setup()
    render(<StatusIsland tasks={[upload]} onCancel={vi.fn()} />)

    const summary = screen.getByRole("button", { expanded: false })
    summary.focus()
    await user.keyboard("{Enter}")
    await user.tab()
    expect(
      screen.getByRole("button", { name: "Cancel site-plan.pdf" })
    ).toHaveFocus()

    await user.keyboard("{Escape}")

    expect(summary).toHaveAttribute("aria-expanded", "false")
    expect(summary).toHaveFocus()
  })

  it("closes on a click outside", async () => {
    const user = userEvent.setup()
    render(
      <>
        <StatusIsland tasks={[upload]} />
        <p>Page</p>
      </>
    )

    await user.click(screen.getByRole("button", { expanded: false }))
    await user.click(screen.getByText("Page"))

    expect(screen.getByRole("button", { expanded: false })).toBeInTheDocument()
  })

  it("announces completions and failures, not progress", () => {
    const { container, rerender } = render(
      <StatusIsland tasks={[upload, sync]} />
    )
    expect(live(container)).toHaveTextContent("")

    rerender(<StatusIsland tasks={[{ ...upload, progress: 0.8 }, sync]} />)
    expect(live(container)).toHaveTextContent("")

    rerender(
      <StatusIsland
        tasks={[
          { ...upload, status: "done", progress: 1 },
          { ...sync, status: "error", detail: "Offline" },
        ]}
      />
    )
    expect(live(container)).toHaveTextContent(
      "site-plan.pdf finished. Calendar sync failed: Offline"
    )
  })

  it("says Done, then leaves once everything has finished", () => {
    vi.useFakeTimers()
    const { rerender } = render(<StatusIsland tasks={[upload]} />)

    rerender(<StatusIsland tasks={[{ ...upload, status: "done" }]} />)
    const island = screen.getByRole("region")
    expect(island).toHaveAttribute("data-state", "done")
    expect(island).toHaveTextContent("Done")

    act(() => {
      vi.advanceTimersByTime(1700)
    })
    expect(island).toHaveAttribute("data-state", "hidden")
    expect(island).toHaveAttribute("inert")
  })

  it("stays up while focus is inside it", () => {
    vi.useFakeTimers()
    render(<StatusIsland tasks={[{ ...upload, status: "done" }]} />)

    fireEvent.focus(screen.getByRole("button", { expanded: false }))
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getByRole("region")).toHaveAttribute("data-state", "done")
  })
})
