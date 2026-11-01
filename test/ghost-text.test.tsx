import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { GhostText } from "../registry/default/ghost-text/ghost-text"

function ghost(container: HTMLElement) {
  return container.querySelector('[data-slot="ghost-text-suggestion"]')
}

function Field(props: Partial<React.ComponentProps<typeof GhostText>>) {
  return (
    <>
      <label htmlFor="field">Subject</label>
      <GhostText
        id="field"
        debounce={0}
        getSuggestion={(text) => (text === "Ref" ? "und for March" : "")}
        {...props}
      />
      <button type="button">Next</button>
    </>
  )
}

describe("GhostText", () => {
  it("shows the suggestion after the caret and describes how to take it", async () => {
    const user = userEvent.setup()
    const { container } = render(<Field />)

    const field = screen.getByRole("textbox", { name: "Subject" })
    await user.type(field, "Ref")

    await waitFor(() =>
      expect(ghost(container)).toHaveTextContent("und for March")
    )
    expect(field).toHaveAttribute("aria-autocomplete", "inline")
    expect(field).toHaveAccessibleDescription(/press Tab to accept/)
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      "Suggestion: Refund for March"
    )
  })

  it("accepts the whole suggestion on Tab and keeps focus", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const onAccept = vi.fn()
    const { container } = render(
      <Field onAccept={onAccept} onValueChange={onValueChange} />
    )

    const field = screen.getByRole("textbox", { name: "Subject" })
    await user.type(field, "Ref")
    await waitFor(() => expect(ghost(container)).not.toBeNull())

    await user.keyboard("{Tab}")

    expect(field).toHaveValue("Refund for March")
    expect(field).toHaveFocus()
    expect(onValueChange).toHaveBeenLastCalledWith("Refund for March")
    expect(onAccept).toHaveBeenCalledWith("und for March")
  })

  it("lets Tab move focus when there is nothing to accept", async () => {
    const user = userEvent.setup()
    render(<Field />)

    const field = screen.getByRole("textbox", { name: "Subject" })
    await user.type(field, "Hello")
    await user.tab()

    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus()
    expect(field).toHaveValue("Hello")
  })

  it("takes one word on Ctrl and the right arrow", async () => {
    const user = userEvent.setup()
    const { container } = render(<Field />)

    const field = screen.getByRole("textbox", { name: "Subject" })
    await user.type(field, "Ref")
    await waitFor(() => expect(ghost(container)).not.toBeNull())

    await user.keyboard("{Control>}{ArrowRight}{/Control}")

    expect(field).toHaveValue("Refund")
    expect(ghost(container)).toHaveTextContent("for March")
  })

  it("uses up matching characters instead of asking again", async () => {
    const user = userEvent.setup()
    const getSuggestion = vi.fn((text: string) =>
      text === "Ref" ? "und for March" : ""
    )
    const { container } = render(<Field getSuggestion={getSuggestion} />)

    const field = screen.getByRole("textbox", { name: "Subject" })
    await user.type(field, "Ref")
    await waitFor(() => expect(ghost(container)).not.toBeNull())
    const calls = getSuggestion.mock.calls.length

    await user.type(field, "und")

    expect(ghost(container)).toHaveTextContent("for March")
    expect(getSuggestion.mock.calls.length).toBe(calls)
  })

  it("drops the suggestion when typing goes another way", async () => {
    const user = userEvent.setup()
    const { container } = render(<Field />)

    const field = screen.getByRole("textbox", { name: "Subject" })
    await user.type(field, "Ref")
    await waitFor(() => expect(ghost(container)).not.toBeNull())

    await user.type(field, "x")

    expect(ghost(container)).toBeNull()
  })

  it("dismisses on Escape without asking again for the same text", async () => {
    const user = userEvent.setup()
    const getSuggestion = vi.fn(() => "und for March")
    const { container } = render(<Field getSuggestion={getSuggestion} />)

    const field = screen.getByRole("textbox", { name: "Subject" })
    await user.type(field, "Ref")
    await waitFor(() => expect(ghost(container)).not.toBeNull())
    const calls = getSuggestion.mock.calls.length

    await user.keyboard("{Escape}")
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(ghost(container)).toBeNull()
    expect(getSuggestion.mock.calls.length).toBe(calls)
  })

  it("discards a suggestion that arrives for text that has moved on", async () => {
    const user = userEvent.setup()
    const pending: Array<{
      text: string
      signal: AbortSignal
      resolve: (value: string) => void
    }> = []
    const getSuggestion = (text: string, signal: AbortSignal) =>
      new Promise<string>((resolve) => pending.push({ text, signal, resolve }))
    const { container } = render(<Field getSuggestion={getSuggestion} />)

    const field = screen.getByRole("textbox", { name: "Subject" })
    await user.type(field, "R")
    await waitFor(() => expect(pending).toHaveLength(1))
    await user.type(field, "e")
    await waitFor(() => expect(pending).toHaveLength(2))

    expect(pending[0]!.signal.aborted).toBe(true)

    pending[0]!.resolve("ad me")
    pending[1]!.resolve("fund")

    await waitFor(() => expect(ghost(container)).toHaveTextContent("fund"))
    expect(container).not.toHaveTextContent("ad me")
  })

  it("accepts from the hint for touch users", async () => {
    const user = userEvent.setup()
    const { container } = render(<Field />)

    const field = screen.getByRole("textbox", { name: "Subject" })
    await user.type(field, "Ref")
    await waitFor(() => expect(ghost(container)).not.toBeNull())

    await user.click(screen.getByRole("button", { name: "Accept suggestion" }))

    expect(field).toHaveValue("Refund for March")
  })

  it("renders a textarea when multiline, and nothing ghosted while disabled", async () => {
    const getSuggestion = vi.fn(() => "x")
    const { container } = render(
      <Field
        defaultValue="Ref"
        disabled
        getSuggestion={getSuggestion}
        multiline
      />
    )

    const field = screen.getByRole("textbox", { name: "Subject" })

    expect(field.tagName).toBe("TEXTAREA")
    expect(ghost(container)).toBeNull()
    expect(getSuggestion).not.toHaveBeenCalled()
  })

  it("keeps the suggestion still under reduced motion", async () => {
    const user = userEvent.setup()
    const { container } = render(<Field />)

    await user.type(screen.getByRole("textbox", { name: "Subject" }), "Ref")
    await waitFor(() => expect(ghost(container)).not.toBeNull())

    expect(
      container.querySelector('[data-slot="ghost-text-mirror"]')
    ).toHaveClass("motion-reduce:transition-none")
  })
})
