import * as React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  InlineEdit,
  type InlineEditRequest,
} from "../registry/default/inline-edit/inline-edit"

const doc = "Exports failed on Tuesday. We fixed it."

function Doc(props: Partial<React.ComponentProps<typeof InlineEdit>>) {
  const [value, setValue] = React.useState(doc)

  return (
    <InlineEdit
      label="Note"
      onRequestEdit={() => "Exports broke on Tuesday."}
      value={value}
      {...props}
      onChange={(next) => {
        setValue(next)
        props.onChange?.(next)
      }}
    />
  )
}

function select(field: HTMLTextAreaElement, start: number, end: number) {
  field.focus()
  field.setSelectionRange(start, end)
  fireEvent.select(field)
}

const first = "Exports failed on Tuesday."

async function* chunks(...parts: string[]) {
  for (const part of parts) {
    await Promise.resolve()
    yield part
  }
}

async function openPrompt(user: ReturnType<typeof userEvent.setup>) {
  const field = screen.getByRole("textbox", { name: "Note" })
  select(field as HTMLTextAreaElement, 0, first.length)
  await user.keyboard("{Control>}k{/Control}")
  return field
}

describe("InlineEdit", () => {
  it("is a named, editable document with the shortcut described", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Doc onChange={onChange} />)

    const field = screen.getByRole("textbox", { name: "Note" })
    expect(field).toHaveAccessibleDescription(/press Control K to rewrite/)

    await user.type(field, "!")
    expect(onChange).toHaveBeenLastCalledWith(`${doc}!`)
  })

  it("offers an edit once something is selected", async () => {
    const user = userEvent.setup()
    render(<Doc />)

    const field = screen.getByRole("textbox", { name: "Note" })
    select(field as HTMLTextAreaElement, 0, 0)
    expect(screen.queryByRole("button", { name: /Edit selection/ })).toBeNull()

    select(field as HTMLTextAreaElement, 0, first.length)
    await user.click(screen.getByRole("button", { name: /Edit selection/ }))

    expect(
      screen.getByRole("textbox", { name: "How should the selection change?" })
    ).toHaveFocus()
  })

  it("streams a replacement in place, then accepts it on Enter", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onRequestEdit = vi.fn((request: InlineEditRequest) => {
      expect(request.selection).toEqual({ start: 0, end: 26, text: first })
      expect(request.instruction).toBe("shorter")
      return chunks("Exports ", "broke ", "Tuesday.")
    })
    const { container } = render(
      <Doc onChange={onChange} onRequestEdit={onRequestEdit} />
    )

    await openPrompt(user)
    await user.keyboard("shorter{Enter}")

    const accept = await screen.findByRole("button", { name: /Accept/ })
    await waitFor(() => expect(accept).toHaveFocus())

    expect(container.querySelector("del")).toHaveTextContent(first)
    expect(container.querySelector("ins")).toHaveTextContent(
      "Exports broke Tuesday."
    )
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      /Suggested replacement: Exports broke Tuesday\./
    )

    await user.keyboard("{Enter}")

    const field = screen.getByRole("textbox", { name: "Note" })
    expect(onChange).toHaveBeenLastCalledWith(
      "Exports broke Tuesday. We fixed it."
    )
    expect(field).toHaveFocus()
    expect((field as HTMLTextAreaElement).selectionStart).toBe(0)
    expect((field as HTMLTextAreaElement).selectionEnd).toBe(22)
  })

  it("rejects on Escape and puts the selection back", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Doc onChange={onChange} />)

    await openPrompt(user)
    await user.keyboard("shorter{Enter}")
    await screen.findByRole("button", { name: /Accept/ })
    await user.keyboard("{Escape}")

    const field = screen.getByRole("textbox", {
      name: "Note",
    }) as HTMLTextAreaElement
    expect(onChange).not.toHaveBeenCalled()
    expect(field).toHaveValue(doc)
    expect(field).toHaveFocus()
    expect([field.selectionStart, field.selectionEnd]).toEqual([
      0,
      first.length,
    ])
  })

  it("accepts on Cmd or Ctrl+Enter even from the Reject button", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Doc onChange={onChange} />)

    await openPrompt(user)
    await user.keyboard("shorter{Enter}")
    await screen.findByRole("button", { name: /Accept/ })

    screen.getByRole("button", { name: /Reject/ }).focus()
    await user.keyboard("{Meta>}{Enter}{/Meta}")

    expect(onChange).toHaveBeenLastCalledWith(
      "Exports broke on Tuesday. We fixed it."
    )
  })

  it("closes the prompt on Escape without touching the text", async () => {
    const user = userEvent.setup()
    const onRequestEdit = vi.fn()
    render(<Doc onRequestEdit={onRequestEdit} />)

    const field = await openPrompt(user)
    await user.keyboard("{Escape}")

    expect(
      screen.queryByRole("textbox", {
        name: "How should the selection change?",
      })
    ).toBeNull()
    expect(field).toHaveFocus()
    expect(onRequestEdit).not.toHaveBeenCalled()
  })

  it("stops a stream that is still arriving", async () => {
    const user = userEvent.setup()
    let signal: AbortSignal | undefined
    render(
      <Doc
        onRequestEdit={(request) => {
          signal = request.signal
          return new Promise<string>(() => {})
        }}
      />
    )

    await openPrompt(user)
    await user.keyboard("shorter{Enter}")
    await user.click(await screen.findByRole("button", { name: /Stop/ }))

    expect(signal?.aborted).toBe(true)
    expect(screen.getByRole("textbox", { name: "Note" })).toHaveValue(doc)
  })

  it("says when the rewrite fails and lets it be tried again", async () => {
    const user = userEvent.setup()
    const onRequestEdit = vi
      .fn()
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValueOnce("Exports broke.")
    render(<Doc onRequestEdit={onRequestEdit} />)

    await openPrompt(user)
    await user.keyboard("shorter{Enter}")
    await user.click(await screen.findByRole("button", { name: "Try again" }))

    expect(await screen.findByRole("button", { name: /Accept/ })).toBeVisible()
    expect(onRequestEdit).toHaveBeenCalledTimes(2)
    expect(onRequestEdit.mock.calls[1]![0].instruction).toBe("shorter")
  })

  it("edits a read-only document through requests but not by typing", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Doc onChange={onChange} readOnly />)

    const field = screen.getByRole("textbox", { name: "Note" })
    await user.type(field, "x")
    expect(onChange).not.toHaveBeenCalled()

    await openPrompt(user)
    await user.keyboard("shorter{Enter}")
    await user.click(await screen.findByRole("button", { name: /Accept/ }))

    expect(onChange).toHaveBeenCalledWith(
      "Exports broke on Tuesday. We fixed it."
    )
  })

  it("holds the streaming caret still under reduced motion", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Doc onRequestEdit={() => new Promise<string>(() => {})} />
    )

    await openPrompt(user)
    await user.keyboard("shorter{Enter}")
    await screen.findByRole("button", { name: /Stop/ })

    expect(container.querySelector(".animate-pulse")).toHaveClass(
      "motion-reduce:animate-none"
    )
  })
})

describe("InlineEdit when the host changes the document mid-edit", () => {
  function Hosted({
    change,
    onChange,
    onRequestEdit = () => "Exports broke on Tuesday.",
  }: {
    change: (value: string) => string
    onChange?: (value: string) => void
    onRequestEdit?: React.ComponentProps<typeof InlineEdit>["onRequestEdit"]
  }) {
    const [value, setValue] = React.useState(doc)

    return (
      <>
        <InlineEdit
          label="Note"
          onChange={(next) => {
            setValue(next)
            onChange?.(next)
          }}
          onRequestEdit={onRequestEdit}
          value={value}
        />
        <button type="button" onClick={() => setValue(change)}>
          Host edit
        </button>
      </>
    )
  }

  async function review(user: ReturnType<typeof userEvent.setup>) {
    await openPrompt(user)
    await user.keyboard("shorter{Enter}")
    await screen.findByRole("button", { name: /Accept/ })
    await user.click(screen.getByRole("button", { name: "Host edit" }))
  }

  it("applies to the current value when the selection is untouched", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Hosted change={(value) => `${value} Thanks.`} onChange={onChange} />
    )

    await review(user)
    await user.click(screen.getByRole("button", { name: /Accept/ }))

    expect(onChange).toHaveBeenLastCalledWith(
      "Exports broke on Tuesday. We fixed it. Thanks."
    )
  })

  it("refuses to accept once the selected text has moved, and retries where it went", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onRequestEdit = vi.fn(() => "Exports broke on Tuesday.")
    const { container } = render(
      <Hosted
        change={(value) => `Update: ${value}`}
        onChange={onChange}
        onRequestEdit={onRequestEdit}
      />
    )

    await review(user)

    expect(screen.queryByRole("button", { name: /Accept/ })).toBeNull()
    expect(
      screen.getByRole("toolbar", { name: "Review the edit" })
    ).toHaveTextContent("The document changed under this edit.")
    expect(container.querySelector("ins")).toHaveTextContent(
      "Exports broke on Tuesday."
    )

    screen.getByRole("toolbar").focus()
    await user.keyboard("{Meta>}{Enter}{/Meta}")
    expect(onChange).not.toHaveBeenCalled()

    await user.click(screen.getByRole("button", { name: "Retry" }))
    expect(onRequestEdit).toHaveBeenLastCalledWith(
      expect.objectContaining({
        instruction: "shorter",
        selection: { start: 8, end: 34, text: first },
      })
    )

    await user.click(await screen.findByRole("button", { name: /Accept/ }))
    expect(onChange).toHaveBeenLastCalledWith(
      "Update: Exports broke on Tuesday. We fixed it."
    )
  })

  it("offers only Dismiss when the selected text is gone", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Hosted
        change={(value) => value.replace("failed", "stalled")}
        onChange={onChange}
      />
    )

    await review(user)

    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull()
    await user.click(screen.getByRole("button", { name: /Dismiss/ }))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole("textbox", { name: "Note" })).toHaveValue(
      "Exports stalled on Tuesday. We fixed it."
    )
  })
})
