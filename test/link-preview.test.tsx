import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { LinkPreview } from "../registry/default/link-preview/link-preview"

const data = {
  title: "Floating Index",
  description: "A compact outline for long pages.",
  image: "/floating-index.png",
}

const OPEN = 40
const CLOSE = 40

function wait(ms: number) {
  return act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)))
}

describe("LinkPreview", () => {
  it("is an ordinary link until someone lingers on it", async () => {
    const user = userEvent.setup()
    render(
      <LinkPreview
        href="https://example.com/docs/index"
        preview={data}
        openDelay={OPEN * 5}
      >
        Floating Index
      </LinkPreview>
    )

    const link = screen.getByRole("link", { name: "Floating Index" })
    expect(link).toHaveAttribute("href", "https://example.com/docs/index")
    expect(link).not.toHaveAttribute("aria-describedby")

    await user.hover(link)
    expect(screen.queryByRole("tooltip")).toBeNull()

    const card = await screen.findByRole("tooltip")
    expect(link).toHaveAttribute("aria-describedby", card.id)
    expect(card).toHaveTextContent("Floating Index")
    expect(card).toHaveTextContent("A compact outline for long pages.")
    expect(card).toHaveTextContent("example.com")
  })

  it("does not open for a pointer that passes straight over", async () => {
    const user = userEvent.setup()
    render(
      <LinkPreview href="/a" preview={data} openDelay={OPEN * 3}>
        Passing
      </LinkPreview>
    )

    const link = screen.getByRole("link", { name: "Passing" })
    await user.hover(link)
    await user.unhover(link)
    await wait(OPEN * 5)

    expect(screen.queryByRole("tooltip")).toBeNull()
  })

  it("stays open while the pointer moves onto the card", async () => {
    const user = userEvent.setup()
    render(
      <LinkPreview
        href="/a"
        preview={data}
        openDelay={OPEN}
        closeDelay={CLOSE * 2}
      >
        Stay
      </LinkPreview>
    )

    const link = screen.getByRole("link", { name: "Stay" })
    await user.hover(link)
    const card = await screen.findByRole("tooltip")

    await user.unhover(link)
    await user.hover(card)
    await wait(CLOSE * 4)
    expect(screen.getByRole("tooltip")).toBeInTheDocument()

    await user.unhover(card)
    await wait(CLOSE * 4)
    expect(screen.queryByRole("tooltip")).toBeNull()
  })

  it("loads once per href, showing a skeleton meanwhile", async () => {
    const user = userEvent.setup()
    let resolve: (value: typeof data) => void = () => undefined
    const loadPreview = vi.fn(
      () => new Promise<typeof data>((done) => (resolve = done))
    )

    render(
      <>
        <LinkPreview href="/cached" loadPreview={loadPreview} openDelay={OPEN}>
          First
        </LinkPreview>
        <LinkPreview href="/cached" loadPreview={loadPreview} openDelay={OPEN}>
          Second
        </LinkPreview>
      </>
    )

    await user.hover(screen.getByRole("link", { name: "First" }))
    const card = await screen.findByRole("tooltip")

    expect(card).toHaveTextContent("Loading preview")
    expect(card).toHaveAttribute("data-status", "loading")

    await act(async () => resolve(data))
    expect(screen.getByRole("tooltip")).toHaveTextContent("Floating Index")

    await user.unhover(screen.getByRole("link", { name: "First" }))
    await user.hover(screen.getByRole("link", { name: "Second" }))
    await wait(OPEN * 2)

    expect(loadPreview).toHaveBeenCalledTimes(1)
  })

  it("says so when there is no preview to show", async () => {
    const user = userEvent.setup()
    render(
      <LinkPreview
        href="https://example.org/missing"
        loadPreview={() => Promise.reject(new Error("404"))}
        openDelay={OPEN}
      >
        Missing
      </LinkPreview>
    )

    await user.hover(screen.getByRole("link", { name: "Missing" }))
    const card = await screen.findByRole("tooltip")
    await wait(10)

    expect(card).toHaveTextContent("No preview available")
    expect(card).toHaveTextContent("example.org")
  })

  it("tries a failed load again on the next visit", async () => {
    const user = userEvent.setup()
    const loadPreview = vi
      .fn()
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValueOnce(data)

    render(
      <LinkPreview
        href="/retry"
        loadPreview={loadPreview}
        openDelay={OPEN}
        closeDelay={CLOSE}
      >
        Retry
      </LinkPreview>
    )

    const link = screen.getByRole("link", { name: "Retry" })
    await user.hover(link)
    await screen.findByText("No preview available")
    await user.unhover(link)
    await wait(CLOSE * 3)

    await user.hover(link)
    expect(await screen.findByText("Floating Index")).toBeInTheDocument()
    expect(loadPreview).toHaveBeenCalledTimes(2)
  })

  it("opens on keyboard focus and closes on Escape and blur", async () => {
    const user = userEvent.setup()
    render(
      <>
        <LinkPreview href="/a" preview={data} openDelay={OPEN}>
          Keyboard
        </LinkPreview>
        <button type="button">Next</button>
      </>
    )

    await user.tab()
    expect(await screen.findByRole("tooltip")).toBeInTheDocument()

    await user.keyboard("{Escape}")
    expect(screen.queryByRole("tooltip")).toBeNull()
    expect(screen.getByRole("link", { name: "Keyboard" })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus()
    await wait(OPEN * 2)
    expect(screen.queryByRole("tooltip")).toBeNull()
  })

  it("leaves a touch on the link to the link", async () => {
    render(
      <LinkPreview href="/a" preview={data} openDelay={OPEN}>
        Touch
      </LinkPreview>
    )

    const link = screen.getByRole("link", { name: "Touch" })
    fireEvent.pointerOver(link, { pointerType: "touch" })
    fireEvent.pointerDown(link, { pointerType: "touch" })
    fireEvent.focus(link)
    await wait(OPEN * 3)

    expect(screen.queryByRole("tooltip")).toBeNull()
  })

  it("passes link attributes through", () => {
    render(
      <LinkPreview href="/a" preview={data} target="_blank" rel="noreferrer">
        Out
      </LinkPreview>
    )

    expect(screen.getByRole("link", { name: "Out" })).toHaveAttribute(
      "target",
      "_blank"
    )
  })
})
