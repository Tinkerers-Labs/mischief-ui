import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { CopyForAi } from "../registry/default/copy-for-ai/copy-for-ai"
import { InstallCommand } from "../registry/default/install-command/install-command"
import { TableOfContents } from "../registry/default/table-of-contents/table-of-contents"

describe("InstallCommand", () => {
  it("runs with the chosen package manager", async () => {
    const user = userEvent.setup()

    render(<InstallCommand run="shadcn@latest add tabs" />)

    expect(screen.getByRole("code")).toHaveTextContent(
      "npx shadcn@latest add tabs"
    )

    await user.click(screen.getByRole("button", { name: "pnpm" }))
    expect(screen.getByRole("code")).toHaveTextContent(
      "pnpm dlx shadcn@latest add tabs"
    )
  })

  it("keeps the manager when switching to the package option", async () => {
    const user = userEvent.setup()

    render(<InstallCommand run="shadcn@latest add tabs" add="my-lib" />)

    await user.click(screen.getByRole("button", { name: "yarn" }))
    await user.click(screen.getByRole("button", { name: "package" }))

    expect(screen.getByRole("code")).toHaveTextContent("yarn add my-lib")
  })

  it("offers only what it was given", () => {
    render(<InstallCommand add="my-lib" />)

    expect(
      screen.queryByRole("button", { name: "npm" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "agent" })
    ).not.toBeInTheDocument()
    expect(screen.getByRole("code")).toHaveTextContent("npm install my-lib")
  })

  it("shows a prompt instead of a command for the agent option", async () => {
    const user = userEvent.setup()

    render(
      <InstallCommand run="shadcn@latest add tabs" prompt="Read the docs." />
    )

    await user.click(screen.getByRole("button", { name: "agent" }))

    expect(screen.getByRole("code")).toHaveTextContent("Read the docs.")
  })

  it("copies whatever is showing", async () => {
    const user = userEvent.setup()

    render(<InstallCommand run="shadcn@latest add tabs" add="my-lib" />)

    await user.click(screen.getByRole("button", { name: "package" }))
    await user.click(screen.getByRole("button", { name: "Copy" }))

    expect(await navigator.clipboard.readText()).toBe("npm install my-lib")
  })
})

describe("CopyForAi", () => {
  it("copies the markdown rather than the address", async () => {
    const user = userEvent.setup()

    render(<CopyForAi markdown="# Tabs" markdownUrl="https://x.dev/tabs.md" />)

    await user.click(screen.getByRole("button", { name: /copy page/i }))

    expect(await navigator.clipboard.readText()).toBe("# Tabs")
  })

  it("keeps the menu shut until it is asked for", async () => {
    const user = userEvent.setup()

    render(<CopyForAi markdown="# Tabs" markdownUrl="https://x.dev/tabs.md" />)

    expect(screen.queryByRole("menu")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /more page actions/i }))
    expect(screen.getByRole("menu")).toBeVisible()
  })

  it("points every destination at the markdown", async () => {
    const user = userEvent.setup()

    render(<CopyForAi markdown="# Tabs" markdownUrl="https://x.dev/tabs.md" />)

    await user.click(screen.getByRole("button", { name: /more page actions/i }))

    for (const name of ["ChatGPT", "Claude"]) {
      const link = screen.getByRole("menuitem", { name: `Open in ${name}` })
      expect(link.getAttribute("href")).toContain(
        encodeURIComponent("https://x.dev/tabs.md")
      )
    }
  })

  it("omits the markdown link when there is no address for it", async () => {
    const user = userEvent.setup()

    render(<CopyForAi markdown="# Tabs" />)

    await user.click(screen.getByRole("button", { name: /more page actions/i }))

    expect(
      screen.queryByRole("menuitem", { name: /view as markdown/i })
    ).not.toBeInTheDocument()
  })

  it("closes on Escape", async () => {
    const user = userEvent.setup()

    render(<CopyForAi markdown="# Tabs" />)

    await user.click(screen.getByRole("button", { name: /more page actions/i }))
    await user.keyboard("{Escape}")

    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
  })
})

describe("TableOfContents", () => {
  const sections = [
    { id: "install", label: "Install" },
    { id: "usage", label: "Usage" },
  ]

  // The component reads positions on an animation frame, so assertions wait
  // for it rather than assuming the scroll event settled synchronously.
  function place(id: string, top: number) {
    const element = document.createElement("section")
    element.id = id
    element.dataset.placed = "true"
    element.getBoundingClientRect = () => ({ top }) as DOMRect
    document.body.append(element)
  }

  beforeEach(() => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 10_000,
    })
  })

  afterEach(() => {
    for (const element of document.querySelectorAll("[data-placed]")) {
      element.remove()
    }
  })

  const current = (name: string) =>
    screen.getByRole("link", { name }).getAttribute("aria-current")

  it("marks the first section before anything has scrolled", async () => {
    place("install", 0)
    place("usage", 900)

    render(<TableOfContents sections={sections} />)

    await waitFor(() => expect(current("Install")).toBe("location"))
  })

  it("follows the heading most recently passed", async () => {
    place("install", -500)
    place("usage", 40)

    render(<TableOfContents sections={sections} />)
    fireEvent.scroll(window)

    await waitFor(() => expect(current("Usage")).toBe("location"))
  })

  it("ignores a heading that has not reached the line yet", async () => {
    place("install", 0)
    place("usage", 400)

    render(<TableOfContents sections={sections} offset={96} />)
    fireEvent.scroll(window)

    await waitFor(() => expect(current("Install")).toBe("location"))
    expect(current("Usage")).toBeNull()
  })
})

describe("a clipboard that refuses", () => {
  // Denied permission, an insecure context, or a sandboxed frame all reject.
  function breakClipboard() {
    const write = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockRejectedValue(new Error("denied"))
    return () => write.mockRestore()
  }

  it("InstallCommand says so instead of claiming success", async () => {
    const user = userEvent.setup()
    const restore = breakClipboard()

    render(<InstallCommand add="my-lib" />)
    await user.click(screen.getByRole("button", { name: "Copy" }))

    expect(
      await screen.findByRole("button", { name: "Copy failed" })
    ).toBeInTheDocument()
    restore()
  })

  it("CopyForAi does not announce a copy that never happened", async () => {
    const user = userEvent.setup()
    const restore = breakClipboard()

    render(<CopyForAi markdown="# Tabs" />)
    await user.click(screen.getByRole("button", { name: /copy page/i }))

    expect(screen.queryByText("Copied")).not.toBeInTheDocument()
    restore()
  })

  it("does not leave the rejection unhandled", async () => {
    const user = userEvent.setup()
    const restore = breakClipboard()
    const unhandled = vi.fn()
    process.on("unhandledRejection", unhandled)

    render(<InstallCommand add="my-lib" />)
    await user.click(screen.getByRole("button", { name: "Copy" }))
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(unhandled).not.toHaveBeenCalled()
    process.off("unhandledRejection", unhandled)
    restore()
  })
})
