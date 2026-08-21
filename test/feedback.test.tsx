import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CopyButton } from "../registry/default/copy-button/copy-button"
import { Skeleton } from "../registry/default/skeleton/skeleton"
import { Spinner } from "../registry/default/spinner/spinner"
import { StatusPill } from "../registry/default/status-pill/status-pill"

describe("Spinner", () => {
  it("is decoration until it is given something to say", () => {
    const { container } = render(<Spinner />)

    expect(container.querySelector('[data-slot="spinner"]')).toHaveAttribute(
      "aria-hidden",
      "true"
    )
    expect(screen.queryByRole("status")).toBeNull()
  })

  it("announces itself once when labelled", () => {
    render(<Spinner label="Publishing" />)

    expect(screen.getByRole("status")).toHaveTextContent("Publishing")
  })
})

describe("Skeleton", () => {
  it("stays out of the accessibility tree", () => {
    const { container } = render(<Skeleton />)

    expect(container.querySelector('[data-slot="skeleton"]')).toHaveAttribute(
      "aria-hidden",
      "true"
    )
  })

  it("draws a block of bars with a short last line", () => {
    const { container } = render(<Skeleton lines={3} />)

    const bars = container.querySelectorAll('[data-slot="skeleton"] > div')

    expect(bars).toHaveLength(3)
    expect(bars[2]!.className).toContain("w-3/5")
    expect(bars[0]!.className).not.toContain("w-3/5")
  })
})

describe("StatusPill", () => {
  it("says the state in words, not only in colour", () => {
    render(<StatusPill tone="down">Ingest is down</StatusPill>)

    expect(screen.getByText("Ingest is down")).toBeInTheDocument()
  })

  it("keeps the dot out of the accessibility tree", () => {
    const { container } = render(<StatusPill>All good</StatusPill>)

    expect(
      container.querySelector('[data-slot="status-pill-dot"]')
    ).toHaveAttribute("aria-hidden", "true")
  })

  it("is a link only when there is somewhere to go", () => {
    const { container, rerender } = render(<StatusPill>All good</StatusPill>)

    expect(container.querySelector("a")).toBeNull()

    rerender(<StatusPill href="/status">All good</StatusPill>)
    expect(screen.getByRole("link", { name: "All good" })).toHaveAttribute(
      "href",
      "/status"
    )
  })

  it("exposes the tone for styling and for tests", () => {
    const { container } = render(<StatusPill tone="warn">Slow</StatusPill>)

    expect(
      container.querySelector('[data-slot="status-pill"]')
    ).toHaveAttribute("data-tone", "warn")
  })
})

describe("CopyButton", () => {
  it("copies and says so", async () => {
    const user = userEvent.setup()
    const onCopied = vi.fn()

    render(<CopyButton value="sk_live_123" onCopied={onCopied} />)

    await user.click(screen.getByRole("button", { name: "Copy" }))

    expect(await navigator.clipboard.readText()).toBe("sk_live_123")
    expect(onCopied).toHaveBeenCalledWith("sk_live_123")
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument()
  })

  it("reports a clipboard that refuses instead of going quiet", async () => {
    const user = userEvent.setup()
    const onCopyError = vi.fn()
    const write = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockRejectedValue(new Error("denied"))

    render(<CopyButton value="x" onCopyError={onCopyError} />)
    await user.click(screen.getByRole("button", { name: "Copy" }))

    expect(onCopyError).toHaveBeenCalled()
    expect(
      await screen.findByRole("button", { name: "Copy failed" })
    ).toBeInTheDocument()

    write.mockRestore()
  })

  it("takes its name from the visible label when there is one", async () => {
    const user = userEvent.setup()

    render(<CopyButton value="x">Copy key</CopyButton>)

    const button = screen.getByRole("button", { name: /Copy key/ })
    await user.click(button)

    // The live region carries the outcome; the visible label does not change.
    expect(button).toHaveTextContent("Copy key")
    expect(button).toHaveTextContent("Copied")
  })
})
