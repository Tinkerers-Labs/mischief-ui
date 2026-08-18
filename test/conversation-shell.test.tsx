import * as React from "react"
import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AnnotationLayer } from "../registry/default/annotation-layer/annotation-layer"
import { Conversation } from "../registry/default/conversation/conversation"
import { Message } from "../registry/default/message/message"
import { PromptInput } from "../registry/default/prompt-input/prompt-input"
import { Redaction } from "../registry/default/redaction/redaction"
import { Suggestions } from "../registry/default/suggestions/suggestions"

/** jsdom gives every element zero size, so scrolling has to be simulated. */
function sizeViewport(
  element: HTMLElement,
  { scrollHeight = 1000, clientHeight = 300, scrollTop = 700 } = {}
) {
  Object.defineProperty(element, "scrollHeight", {
    configurable: true,
    value: scrollHeight,
  })
  Object.defineProperty(element, "clientHeight", {
    configurable: true,
    value: clientHeight,
  })
  Object.defineProperty(element, "scrollTop", {
    configurable: true,
    writable: true,
    value: scrollTop,
  })
  element.scrollTo = vi.fn()
}

describe("Conversation", () => {
  function viewportOf(container: HTMLElement) {
    return container.querySelector<HTMLElement>(
      '[data-slot="conversation-viewport"]'
    )!
  }

  it("follows the bottom until the reader scrolls away", () => {
    const onFollowChange = vi.fn()
    const { container } = render(
      <Conversation onFollowChange={onFollowChange}>
        <p>hello</p>
      </Conversation>
    )

    const viewport = viewportOf(container)
    sizeViewport(viewport)

    expect(
      container.querySelector('[data-slot="conversation"]')
    ).toHaveAttribute("data-following")

    viewport.scrollTop = 100
    fireEvent.scroll(viewport)

    expect(onFollowChange).toHaveBeenCalledWith(false)
    expect(
      container.querySelector('[data-slot="conversation"]')
    ).not.toHaveAttribute("data-following")
  })

  it("offers a jump control only while it is not following", () => {
    const { container } = render(
      <Conversation>
        <p>hello</p>
      </Conversation>
    )

    expect(
      screen.queryByRole("button", { name: /jump to latest/i })
    ).not.toBeInTheDocument()

    const viewport = viewportOf(container)
    sizeViewport(viewport)
    viewport.scrollTop = 0
    fireEvent.scroll(viewport)

    expect(
      screen.getByRole("button", { name: /jump to latest/i })
    ).toBeInTheDocument()
  })

  it("resumes following when the reader jumps back", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Conversation>
        <p>hello</p>
      </Conversation>
    )

    const viewport = viewportOf(container)
    sizeViewport(viewport)
    viewport.scrollTop = 0
    fireEvent.scroll(viewport)

    await user.click(screen.getByRole("button", { name: /jump to latest/i }))

    expect(viewport.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "smooth" })
    )
    expect(
      container.querySelector('[data-slot="conversation"]')
    ).toHaveAttribute("data-following")
  })

  it("does not manage scrolling when told not to", () => {
    const { container } = render(
      <Conversation stickToBottom={false}>
        <p>hello</p>
      </Conversation>
    )

    const viewport = viewportOf(container)
    sizeViewport(viewport)
    viewport.scrollTop = 0
    fireEvent.scroll(viewport)

    expect(
      screen.queryByRole("button", { name: /jump to latest/i })
    ).not.toBeInTheDocument()
  })
})

describe("Message", () => {
  it("names the speaker for assistive technology", () => {
    render(<Message role="assistant">Here is the answer.</Message>)

    const message = screen.getByRole("article")
    expect(message).toHaveAttribute("data-role", "assistant")
    expect(within(message).getByText("Assistant")).toBeInTheDocument()
  })

  it("uses a supplied name over the role", () => {
    render(
      <Message role="assistant" name="Mischief">
        Hi
      </Message>
    )

    expect(screen.getByText("Mischief")).toBeInTheDocument()
  })

  it("marks a streaming message busy", () => {
    render(
      <Message role="assistant" pending>
        Thinking
      </Message>
    )

    expect(screen.getByRole("article")).toHaveAttribute("aria-busy", "true")
  })

  it("keeps actions reachable rather than hover-only", () => {
    const { container } = render(
      <Message role="assistant" actions={<button type="button">Copy</button>}>
        Hi
      </Message>
    )

    // Hidden by opacity, never by display, so it stays focusable.
    const actions = container.querySelector('[data-slot="message-actions"]')!
    expect(actions).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Copy" })).toBeVisible()
  })
})

describe("PromptInput", () => {
  it("submits on Enter and clears the field", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<PromptInput onSubmit={onSubmit} />)

    const field = screen.getByRole("textbox", { name: "Message" })
    await user.type(field, "How does this work?")
    await user.keyboard("{Enter}")

    expect(onSubmit).toHaveBeenCalledWith("How does this work?")
    expect(field).toHaveValue("")
  })

  it("starts a new line on Shift+Enter instead of sending", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<PromptInput onSubmit={onSubmit} />)

    const field = screen.getByRole("textbox", { name: "Message" })
    await user.type(field, "first")
    await user.keyboard("{Shift>}{Enter}{/Shift}")
    await user.type(field, "second")

    expect(onSubmit).not.toHaveBeenCalled()
    expect(field).toHaveValue("first\nsecond")
  })

  it("never sends while an IME candidate is open", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<PromptInput onSubmit={onSubmit} />)

    const field = screen.getByRole("textbox", { name: "Message" })
    await user.type(field, "にほん")
    fireEvent.keyDown(field, { key: "Enter", isComposing: true })

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("refuses to send blank input", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<PromptInput onSubmit={onSubmit} />)

    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled()

    await user.type(screen.getByRole("textbox", { name: "Message" }), "   ")
    await user.keyboard("{Enter}")

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("swaps send for stop while a reply is streaming", async () => {
    const user = userEvent.setup()
    const onStop = vi.fn()

    render(<PromptInput status="streaming" onStop={onStop} />)

    expect(
      screen.queryByRole("button", { name: "Send message" })
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Stop generating" }))
    expect(onStop).toHaveBeenCalledOnce()
  })

  it("stays controlled when a value is supplied", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<PromptInput value="fixed" onValueChange={onValueChange} />)

    const field = screen.getByRole("textbox", { name: "Message" })
    await user.type(field, "!")

    expect(onValueChange).toHaveBeenCalledWith("fixed!")
    expect(field).toHaveValue("fixed")
  })
})

describe("Suggestions", () => {
  const suggestions = [
    { id: "a", label: "Summarise this" },
    { id: "b", label: "Find the risks" },
  ]

  it("reports the chosen suggestion", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(<Suggestions suggestions={suggestions} onSelect={onSelect} />)

    await user.click(screen.getByRole("button", { name: "Find the risks" }))

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "b" }))
  })

  it("renders nothing when there is nothing to suggest", () => {
    const { container } = render(<Suggestions suggestions={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe("AnnotationLayer", () => {
  const annotations = [
    { id: "one", x: 0.1, y: 0.1, width: 0.2, height: 0.1, note: "Check this" },
  ]

  function drag(
    surface: HTMLElement,
    from: { x: number; y: number },
    to: { x: number; y: number }
  ) {
    surface.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 100, height: 100 }) as DOMRect

    fireEvent.pointerDown(surface, {
      button: 0,
      pointerId: 1,
      clientX: from.x,
      clientY: from.y,
    })
    fireEvent.pointerMove(surface, {
      pointerId: 1,
      clientX: to.x,
      clientY: to.y,
    })
    fireEvent.pointerUp(surface, { pointerId: 1 })
  }

  it("shows the note for the selected region", async () => {
    const user = userEvent.setup()

    render(
      <AnnotationLayer alt="Page" annotations={annotations} src="/page.png" />
    )

    expect(screen.getByText(/select a highlighted region/i)).toBeVisible()

    await user.click(screen.getByRole("button", { name: /Note 1: Check this/ }))
    expect(screen.getByText("Check this")).toBeVisible()
  })

  it("creates a region from a drag, in page fractions", () => {
    const onCreate = vi.fn()
    const { container } = render(
      <AnnotationLayer
        alt="Page"
        annotations={[]}
        src="/page.png"
        onCreate={onCreate}
      />
    )

    const surface = container.querySelector<HTMLElement>(
      '[data-slot="annotation-surface"]'
    )!
    drag(surface, { x: 20, y: 30 }, { x: 60, y: 70 })

    expect(onCreate).toHaveBeenCalledWith({
      x: expect.closeTo(0.2, 6),
      y: expect.closeTo(0.3, 6),
      width: expect.closeTo(0.4, 6),
      height: expect.closeTo(0.4, 6),
    })
  })

  it("treats a click that never moved as a deselect", () => {
    const onCreate = vi.fn()
    const onActiveChange = vi.fn()
    const { container } = render(
      <AnnotationLayer
        alt="Page"
        annotations={annotations}
        src="/page.png"
        onCreate={onCreate}
        onActiveChange={onActiveChange}
      />
    )

    const surface = container.querySelector<HTMLElement>(
      '[data-slot="annotation-surface"]'
    )!
    drag(surface, { x: 20, y: 30 }, { x: 20, y: 30 })

    expect(onCreate).not.toHaveBeenCalled()
    expect(onActiveChange).toHaveBeenCalledWith(null)
  })

  it("does not draw when read only", () => {
    const onCreate = vi.fn()
    const { container } = render(
      <AnnotationLayer
        alt="Page"
        annotations={annotations}
        src="/page.png"
        onCreate={onCreate}
        readOnly
      />
    )

    const surface = container.querySelector<HTMLElement>(
      '[data-slot="annotation-surface"]'
    )!
    drag(surface, { x: 10, y: 10 }, { x: 80, y: 80 })

    expect(onCreate).not.toHaveBeenCalled()
  })
})

describe("Redaction", () => {
  const regions = [
    { id: "ssn", x: 0.2, y: 0.4, width: 0.3, height: 0.05, reason: "SSN" },
  ]

  it("covers a region until it is revealed for review", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Redaction alt="Page" regions={regions} src="/page.png" />
    )

    const region = () =>
      container.querySelector('[data-slot="redaction-region"]')!

    expect(region()).not.toHaveAttribute("data-revealed")

    await user.click(screen.getByRole("button", { name: /reveal for review/i }))
    expect(region()).toHaveAttribute("data-revealed")
  })

  it("warns that revealing is only visual", async () => {
    const user = userEvent.setup()

    render(<Redaction alt="Page" regions={regions} src="/page.png" />)

    expect(screen.queryByRole("status")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /reveal for review/i }))
    expect(screen.getByRole("status")).toHaveTextContent(
      /redact the source file before sharing/i
    )
  })

  it("counts regions and removes one", async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(
      <Redaction
        alt="Page"
        regions={regions}
        src="/page.png"
        onDelete={onDelete}
      />
    )

    expect(screen.getByText("1 redaction")).toBeVisible()

    await user.click(
      screen.getByRole("button", { name: /remove redaction 1/i })
    )
    expect(onDelete).toHaveBeenCalledWith("ssn")
  })
})
