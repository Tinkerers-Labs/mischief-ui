import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Accordion } from "../registry/default/accordion/accordion"
import { ComponentPreview } from "../registry/default/component-preview/component-preview"
import { ThemeToggle } from "../registry/default/theme-toggle/theme-toggle"

describe("ThemeToggle", () => {
  afterEach(() => {
    document.documentElement.classList.remove("dark")
    document.documentElement.style.colorScheme = ""
    window.localStorage.clear()
  })

  it("names the mode it will move to, not the one it is in", () => {
    render(<ThemeToggle />)

    expect(
      screen.getByRole("button", { name: "Switch to dark mode" })
    ).toBeInTheDocument()
  })

  it("applies the class and remembers the choice", async () => {
    const user = userEvent.setup()

    render(<ThemeToggle storageKey="demo-theme" />)

    await user.click(screen.getByRole("button"))

    expect(document.documentElement).toHaveClass("dark")
    expect(document.documentElement.style.colorScheme).toBe("dark")
    expect(window.localStorage.getItem("demo-theme")).toBe("dark")
  })

  it("cycles through every mode it was given", async () => {
    const user = userEvent.setup()
    const onThemeChange = vi.fn()

    render(
      <ThemeToggle
        storageKey="demo-theme"
        modes={["light", "dark", "system"]}
        onThemeChange={onThemeChange}
      />
    )

    // Nothing is stored, so it starts on system and the cycle carries on from
    // there rather than from the first mode in the list.
    await user.click(screen.getByRole("button"))
    expect(onThemeChange).toHaveBeenLastCalledWith("light")

    await user.click(screen.getByRole("button"))
    expect(onThemeChange).toHaveBeenLastCalledWith("dark")

    await user.click(screen.getByRole("button"))
    expect(onThemeChange).toHaveBeenLastCalledWith("system")
  })

  it("forgets the choice when it hands back to the system", async () => {
    const user = userEvent.setup()

    window.localStorage.setItem("demo-theme", "dark")

    render(<ThemeToggle storageKey="demo-theme" modes={["dark", "system"]} />)

    await user.click(screen.getByRole("button"))

    expect(window.localStorage.getItem("demo-theme")).toBeNull()
  })

  it("uses a custom dark class", async () => {
    const user = userEvent.setup()

    render(<ThemeToggle storageKey="demo-theme" darkClass="night" />)

    await user.click(screen.getByRole("button"))

    expect(document.documentElement).toHaveClass("night")
    expect(document.documentElement).not.toHaveClass("dark")
    document.documentElement.classList.remove("night")
  })
})

describe("Accordion", () => {
  const items = [
    { id: "one", title: "First", content: "First answer" },
    { id: "two", title: "Second", content: "Second answer" },
  ]

  it("opens only what it was told to", () => {
    const { container } = render(
      <Accordion items={items} defaultOpen={["two"]} />
    )

    const panels = container.querySelectorAll("details")

    expect(panels[0]).not.toHaveAttribute("open")
    expect(panels[1]).toHaveAttribute("open")
  })

  it("shares a name so only one stays open", () => {
    const { container } = render(<Accordion items={items} />)

    const names = [...container.querySelectorAll("details")].map((panel) =>
      panel.getAttribute("name")
    )

    expect(names[0]).toBeTruthy()
    expect(names[0]).toBe(names[1])
  })

  it("drops the shared name when several may be open", () => {
    const { container } = render(<Accordion items={items} exclusive={false} />)

    expect(
      [...container.querySelectorAll("details")].every(
        (panel) => !panel.getAttribute("name")
      )
    ).toBe(true)
  })

  it("keeps the content in the page while collapsed, so it stays findable", () => {
    render(<Accordion items={items} />)

    expect(screen.getByText("First answer")).toBeInTheDocument()
  })
})

describe("ComponentPreview", () => {
  it("shows only the preview when there is no source", () => {
    render(
      <ComponentPreview>
        <p>Live</p>
      </ComponentPreview>
    )

    expect(screen.getAllByRole("tab")).toHaveLength(1)
  })

  it("swaps panels without unmounting the example", async () => {
    const user = userEvent.setup()

    render(
      <ComponentPreview code="const a = 1">
        <p>Live</p>
      </ComponentPreview>
    )

    const preview = screen.getByText("Live")

    await user.click(screen.getByRole("tab", { name: "Code" }))

    expect(preview).toBeInTheDocument()
    expect(preview.closest("[role='tabpanel']")).not.toBeVisible()
    expect(screen.getByText("const a = 1")).toBeVisible()
  })

  it("moves between tabs with the arrow keys", async () => {
    const user = userEvent.setup()

    render(
      <ComponentPreview code="const a = 1">
        <p>Live</p>
      </ComponentPreview>
    )

    await user.click(screen.getByRole("tab", { name: "Preview" }))
    await user.keyboard("{ArrowRight}")

    expect(screen.getByRole("tab", { name: "Code" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
  })

  it("keeps only the selected tab in the tab order", () => {
    render(
      <ComponentPreview code="const a = 1">
        <p>Live</p>
      </ComponentPreview>
    )

    expect(screen.getByRole("tab", { name: "Preview" })).toHaveAttribute(
      "tabindex",
      "0"
    )
    expect(screen.getByRole("tab", { name: "Code" })).toHaveAttribute(
      "tabindex",
      "-1"
    )
  })

  it("copies the source", async () => {
    const user = userEvent.setup()

    render(
      <ComponentPreview code="const a = 1">
        <p>Live</p>
      </ComponentPreview>
    )

    await user.click(screen.getByRole("button", { name: "Copy code" }))

    expect(await navigator.clipboard.readText()).toBe("const a = 1")
  })
})
