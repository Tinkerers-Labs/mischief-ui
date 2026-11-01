import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { FeedbackWidget } from "../registry/default/feedback-widget/feedback-widget"

function live(container: HTMLElement) {
  return container.querySelector('[aria-live="polite"]')
}

describe("FeedbackWidget", () => {
  it("opens from the trigger into a named dialog with the message focused", async () => {
    const user = userEvent.setup()
    render(<FeedbackWidget onSubmit={vi.fn()} />)

    await user.click(screen.getByRole("button", { name: "Feedback" }))

    expect(
      screen.getByRole("dialog", { name: "Send feedback" })
    ).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Message" })).toHaveFocus()
    expect(
      screen.getByRole("group", { name: "How is it going?" })
    ).toBeVisible()
    expect(screen.getAllByRole("radio")).toHaveLength(4)
  })

  it("sends the sentiment and the message", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const { container } = render(<FeedbackWidget onSubmit={onSubmit} />)

    await user.click(screen.getByRole("button", { name: "Feedback" }))
    await user.click(screen.getByRole("radio", { name: "Not great" }))
    await user.type(
      screen.getByRole("textbox", { name: "Message" }),
      "  The invoice download is slow.  "
    )
    await user.click(screen.getByRole("button", { name: "Send" }))

    expect(onSubmit).toHaveBeenCalledWith({
      sentiment: "meh",
      message: "The invoice download is slow.",
    })
    await waitFor(() =>
      expect(live(container)).toHaveTextContent("Thanks. We read every note.")
    )
  })

  it("does nothing until there is something to send", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<FeedbackWidget onSubmit={onSubmit} />)

    await user.click(screen.getByRole("button", { name: "Feedback" }))
    const send = screen.getByRole("button", { name: "Send" })

    expect(send).toHaveAttribute("aria-disabled", "true")
    await user.click(send)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("sends on Cmd+Enter or Ctrl+Enter from the message", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<FeedbackWidget onSubmit={onSubmit} sentiments={[]} />)

    await user.click(screen.getByRole("button", { name: "Feedback" }))
    expect(screen.queryByRole("radio")).toBeNull()
    await user.keyboard("Search is great{Control>}{Enter}{/Control}")

    expect(onSubmit).toHaveBeenCalledWith({
      sentiment: null,
      message: "Search is great",
    })
  })

  it("keeps the text after a failure and retries it", async () => {
    const user = userEvent.setup()
    const failure = new Error("offline")
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(failure)
      .mockResolvedValueOnce(undefined)
    const onSubmitError = vi.fn()
    const { container } = render(
      <FeedbackWidget onSubmit={onSubmit} onSubmitError={onSubmitError} />
    )

    await user.click(screen.getByRole("button", { name: "Feedback" }))
    await user.type(screen.getByRole("textbox"), "Export button is hidden")
    await user.click(screen.getByRole("button", { name: "Send" }))

    const retry = await screen.findByRole("button", { name: "Try again" })
    expect(onSubmitError).toHaveBeenCalledWith(failure)
    expect(screen.getByRole("textbox")).toHaveValue("Export button is hidden")
    expect(live(container)).toHaveTextContent("Could not send")

    await user.click(retry)
    expect(onSubmit).toHaveBeenLastCalledWith({
      sentiment: null,
      message: "Export button is hidden",
    })
  })

  it("closes itself after the thanks and returns focus to the trigger", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<FeedbackWidget onSubmit={vi.fn().mockResolvedValue(undefined)} />)

    await user.click(screen.getByRole("button", { name: "Feedback" }))
    await user.click(screen.getByRole("radio", { name: "Great" }))
    await user.click(screen.getByRole("button", { name: "Send" }))
    await waitFor(() =>
      expect(screen.getByRole("dialog")).toHaveTextContent("Thanks")
    )

    await act(async () => {
      vi.advanceTimersByTime(1700)
    })

    expect(screen.queryByRole("dialog")).toBeNull()
    expect(screen.getByRole("button", { name: "Feedback" })).toHaveFocus()
    vi.useRealTimers()
  })

  it("closes on Escape, keeps the draft, and returns focus", async () => {
    const user = userEvent.setup()
    render(<FeedbackWidget onSubmit={vi.fn()} />)

    await user.click(screen.getByRole("button", { name: "Feedback" }))
    await user.keyboard("Half a thought")
    await user.keyboard("{Escape}")

    expect(screen.queryByRole("dialog")).toBeNull()
    expect(screen.getByRole("button", { name: "Feedback" })).toHaveFocus()

    await user.click(screen.getByRole("button", { name: "Feedback" }))
    expect(screen.getByRole("textbox")).toHaveValue("Half a thought")
  })

  it("keeps Tab inside the panel", async () => {
    const user = userEvent.setup()
    render(<FeedbackWidget onSubmit={vi.fn()} sentiments={[]} />)

    await user.click(screen.getByRole("button", { name: "Feedback" }))
    await user.tab()
    expect(screen.getByRole("button", { name: "Send" })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByRole("button", { name: "Send" })).toHaveFocus()
  })

  it("closes on a click outside without taking focus", async () => {
    const user = userEvent.setup()
    render(
      <>
        <FeedbackWidget onSubmit={vi.fn()} />
        <p>Page</p>
      </>
    )

    await user.click(screen.getByRole("button", { name: "Feedback" }))
    await user.click(screen.getByText("Page"))

    expect(screen.queryByRole("dialog")).toBeNull()
    expect(screen.getByRole("button", { name: "Feedback" })).not.toHaveFocus()
  })
})
