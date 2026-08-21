import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CopyButton } from "../registry/default/copy-button/copy-button"
import {
  Pagination,
  paginationRange,
} from "../registry/default/pagination/pagination"
import { SecretField } from "../registry/default/secret-field/secret-field"
import { SidePanel } from "../registry/default/side-panel/side-panel"
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

describe("SecretField", () => {
  const key = "sk_live_7f3a91c2b8e04d5aa1c6e2"

  it("hides the value but keeps the ends readable", () => {
    const { container } = render(
      <SecretField value={key} visiblePrefix={8} visibleSuffix={4} />
    )

    const shown = container.querySelector(
      '[data-slot="secret-field-value"]'
    )!.textContent!

    expect(shown.startsWith("sk_live_")).toBe(true)
    expect(shown.endsWith("c6e2")).toBe(true)
    expect(shown).not.toBe(key)
    expect(shown).toContain("•")
  })

  it("does not read a row of bullets out loud", () => {
    const { container } = render(<SecretField label="API key" value={key} />)

    expect(
      container.querySelector('[data-slot="secret-field-value"]')
    ).toHaveAttribute("aria-hidden", "true")
    expect(screen.getByText("API key hidden")).toBeInTheDocument()
  })

  it("shows the whole value once revealed", async () => {
    const user = userEvent.setup()
    const { container } = render(<SecretField value={key} />)

    await user.click(screen.getByRole("button", { name: /show secret/i }))

    expect(
      container.querySelector('[data-slot="secret-field-value"]')
    ).toHaveTextContent(key)
    expect(
      screen.getByRole("button", { name: /hide secret/i })
    ).toHaveAttribute("aria-pressed", "true")
  })

  it("copies the whole value while it is still hidden", async () => {
    const user = userEvent.setup()

    render(<SecretField value={key} />)
    await user.click(screen.getByRole("button", { name: /copy secret/i }))

    expect(await navigator.clipboard.readText()).toBe(key)
  })

  it("drops the reveal control when it must never be shown", () => {
    render(<SecretField revealable={false} value={key} />)

    expect(screen.queryByRole("button", { name: /show/i })).toBeNull()
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument()
  })
})

describe("Pagination", () => {
  it("draws a short run whole", () => {
    expect(paginationRange({ page: 2, pageCount: 5 })).toEqual([1, 2, 3, 4, 5])
  })

  it("breaks a long run at both ends", () => {
    expect(paginationRange({ page: 7, pageCount: 20 })).toEqual([
      1,
      "gap",
      6,
      7,
      8,
      "gap",
      20,
    ])
  })

  it("keeps the ends attached when the page is near one", () => {
    const range = paginationRange({ page: 1, pageCount: 20 })

    expect(range[0]).toBe(1)
    expect(range).not.toContain(0)
    expect(range.at(-1)).toBe(20)
  })

  it("renders nothing when there is one page", () => {
    const { container } = render(<Pagination page={1} pageCount={1} />)

    expect(container.querySelector("nav")).toBeNull()
  })

  it("marks where you are, not where to go", () => {
    render(<Pagination page={3} pageCount={9} onPageChange={vi.fn()} />)

    expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute(
      "aria-current",
      "page"
    )
    expect(screen.getByRole("button", { name: "Page 4" })).not.toHaveAttribute(
      "aria-current"
    )
  })

  it("leaves previous out on the first page", () => {
    render(<Pagination page={1} pageCount={9} onPageChange={vi.fn()} />)

    expect(screen.queryByRole("button", { name: "Previous page" })).toBeNull()
    expect(
      screen.getByRole("button", { name: "Next page" })
    ).toBeInTheDocument()
  })

  it("hands every page to your own link", () => {
    render(
      <Pagination
        page={2}
        pageCount={9}
        renderLink={({ page, children, className, ...rest }) => (
          <a href={`?page=${page}`} className={className} {...rest}>
            {children}
          </a>
        )}
      />
    )

    expect(screen.getByRole("link", { name: "Page 3" })).toHaveAttribute(
      "href",
      "?page=3"
    )
  })
})

describe("SidePanel", () => {
  it("refuses Escape where there is unsaved work", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <SidePanel
        closeOnEscape={false}
        open
        title="Edit"
        onOpenChange={onOpenChange}
      >
        body
      </SidePanel>
    )

    await user.keyboard("{Escape}")

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it("closes on Escape by default", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <SidePanel open title="Edit" onOpenChange={onOpenChange}>
        body
      </SidePanel>
    )

    await user.keyboard("{Escape}")

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("leaves the backdrop out when asked", () => {
    const { baseElement, rerender } = render(
      <SidePanel open title="Edit" onOpenChange={vi.fn()}>
        body
      </SidePanel>
    )

    expect(
      baseElement.querySelector('[data-slot="side-panel-backdrop"]')
    ).toBeInTheDocument()

    rerender(
      <SidePanel hideBackdrop open title="Edit" onOpenChange={vi.fn()}>
        body
      </SidePanel>
    )
    expect(
      baseElement.querySelector('[data-slot="side-panel-backdrop"]')
    ).toBeNull()
  })

  it("sets a panel opened inside another in from the edge", () => {
    const { baseElement } = render(
      <SidePanel open title="Outer" onOpenChange={vi.fn()}>
        <SidePanel open title="Inner" onOpenChange={vi.fn()}>
          inner
        </SidePanel>
      </SidePanel>
    )

    const panels = [
      ...baseElement.querySelectorAll('[data-slot="side-panel"]'),
    ] as HTMLElement[]

    expect(panels).toHaveLength(2)
    expect(panels[0]).not.toHaveAttribute("data-depth")
    expect(panels[1]).toHaveAttribute("data-depth", "1")
    expect(panels[1]!.style.marginRight).toContain("1.75rem")
  })
})
