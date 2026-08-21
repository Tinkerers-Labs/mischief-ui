import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it, vi } from "vitest"

import {
  CommandPalette,
  rankCommandItem,
  type CommandItem,
} from "../registry/default/command-palette/command-palette"

// jsdom knows the dialog element but not its modal behaviour.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function close() {
    this.open = false
    this.dispatchEvent(new Event("close"))
  }
})

const items: CommandItem[] = [
  { id: "hold", label: "Hold Button", group: "Controls" },
  { id: "tabs", label: "Magnetic Tabs", group: "Controls" },
  {
    id: "redaction",
    label: "Redaction",
    group: "Documents",
    description: "Mark regions to black out",
    keywords: ["privacy"],
  },
]

describe("CommandPalette", () => {
  it("stays closed until it is opened", () => {
    render(<CommandPalette items={items} />)

    expect(screen.queryByRole("option")).not.toBeInTheDocument()
  })

  it("opens on the shortcut and lists everything", async () => {
    render(<CommandPalette items={items} />)

    fireEvent.keyDown(window, { key: "k", metaKey: true })

    expect(await screen.findAllByRole("option")).toHaveLength(3)
  })

  it("ranks an exact label above a description match", async () => {
    const user = userEvent.setup()

    render(<CommandPalette items={items} defaultOpen />)

    await user.type(screen.getByRole("combobox"), "redaction")

    const options = screen.getAllByRole("option")
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent("Redaction")
  })

  it("matches hidden keywords", async () => {
    const user = userEvent.setup()

    render(<CommandPalette items={items} defaultOpen />)

    await user.type(screen.getByRole("combobox"), "privacy")

    expect(screen.getAllByRole("option")).toHaveLength(1)
    expect(screen.getByRole("option")).toHaveTextContent("Redaction")
  })

  it("moves the selection with the arrow keys without moving focus", async () => {
    const user = userEvent.setup()

    render(<CommandPalette items={items} defaultOpen />)

    const field = screen.getByRole("combobox")
    await user.click(field)
    await user.keyboard("{ArrowDown}")

    const options = screen.getAllByRole("option")
    expect(options[1]).toHaveAttribute("aria-selected", "true")
    expect(field).toHaveFocus()
    expect(field.getAttribute("aria-activedescendant")).toBe(options[1]!.id)
  })

  it("chooses the highlighted item on Enter", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(<CommandPalette items={items} defaultOpen onSelect={onSelect} />)

    await user.click(screen.getByRole("combobox"))
    await user.keyboard("{ArrowDown}{Enter}")

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "tabs" })
    )
  })

  it("reports nothing found rather than showing an empty list", async () => {
    const user = userEvent.setup()

    render(<CommandPalette items={items} defaultOpen />)

    await user.type(screen.getByRole("combobox"), "zzzz")

    expect(screen.queryByRole("option")).not.toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("zzzz")
  })

  it("caps how many results are shown", async () => {
    render(<CommandPalette items={items} defaultOpen maxResults={2} />)

    expect(await screen.findAllByRole("option")).toHaveLength(2)
  })

  it("binds nothing when the shortcut is turned off", () => {
    const onOpenChange = vi.fn()

    render(
      <CommandPalette
        items={items}
        shortcut={false}
        onOpenChange={onOpenChange}
      />
    )

    fireEvent.keyDown(window, { key: "k", metaKey: true })

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it("stays controlled when open is supplied", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(<CommandPalette items={items} open onOpenChange={onOpenChange} />)

    await user.click(screen.getByRole("button", { name: /hold button/i }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.getAllByRole("option")).toHaveLength(3)
  })
})

describe("two palettes on one page", () => {
  const other: CommandItem[] = [{ id: "docs", label: "Search the docs" }]

  it("opens one of them, not both", async () => {
    render(
      <>
        <CommandPalette items={items} label="Components" />
        <CommandPalette items={other} label="Docs" />
      </>
    )

    fireEvent.keyDown(window, { key: "k", metaKey: true })

    const listboxes = await screen.findAllByRole("listbox")
    expect(listboxes).toHaveLength(1)
  })

  it("leaves a palette on its own chord alone", async () => {
    render(
      <>
        <CommandPalette items={items} label="Components" />
        <CommandPalette items={other} label="Docs" shortcut="j" />
      </>
    )

    fireEvent.keyDown(window, { key: "j", metaKey: true })

    const listbox = await screen.findByRole("listbox")
    expect(listbox).toHaveAccessibleName("Docs")
  })
})

describe("results fetched elsewhere", () => {
  it("reports the query as it is typed", async () => {
    const user = userEvent.setup()
    const onQueryChange = vi.fn()

    render(
      <CommandPalette items={items} defaultOpen onQueryChange={onQueryChange} />
    )

    await user.type(screen.getByRole("combobox"), "red")

    expect(onQueryChange).toHaveBeenLastCalledWith("red")
  })

  it("leaves the order alone when filtering is off", async () => {
    const user = userEvent.setup()

    render(<CommandPalette items={items} defaultOpen filter={false} />)

    // "zzzz" matches nothing, yet server-supplied items must still show.
    await user.type(screen.getByRole("combobox"), "zzzz")

    expect(screen.getAllByRole("option")).toHaveLength(items.length)
    expect(screen.getAllByRole("option")[0]).toHaveTextContent("Hold Button")
  })

  it("still ranks by default", async () => {
    const user = userEvent.setup()

    render(<CommandPalette items={items} defaultOpen />)
    await user.type(screen.getByRole("combobox"), "zzzz")

    expect(screen.queryByRole("option")).not.toBeInTheDocument()
  })

  it("says it is searching rather than claiming nothing matched", () => {
    render(<CommandPalette items={[]} defaultOpen loading filter={false} />)

    expect(screen.getByRole("status")).toHaveTextContent("Searching…")
    expect(screen.queryByText(/Nothing matches/)).not.toBeInTheDocument()
  })

  it("marks the list busy while results are on their way", () => {
    const { rerender } = render(
      <CommandPalette items={[]} defaultOpen loading filter={false} />
    )

    expect(screen.getByRole("listbox")).toHaveAttribute("aria-busy", "true")

    rerender(<CommandPalette items={items} defaultOpen filter={false} />)
    expect(screen.getByRole("listbox")).not.toHaveAttribute("aria-busy")
  })

  it("takes its own wording for the wait", () => {
    render(
      <CommandPalette
        items={[]}
        defaultOpen
        loading
        loadingMessage="Asking the server…"
        filter={false}
      />
    )

    expect(screen.getByRole("status")).toHaveTextContent("Asking the server…")
  })
})

describe("ranking of your own", () => {
  it("uses the ranker it is given", async () => {
    const user = userEvent.setup()

    // Match only on the group, which the built-in ranks far below the label.
    render(
      <CommandPalette
        items={items}
        defaultOpen
        rank={(item, query) =>
          item.group?.toLowerCase().includes(query.toLowerCase()) ? 0 : false
        }
      />
    )

    await user.type(screen.getByRole("combobox"), "documents")

    expect(screen.getAllByRole("option")).toHaveLength(1)
    expect(screen.getByRole("option")).toHaveTextContent("Redaction")
  })

  it("lets a ranker fall back to the built-in one", async () => {
    const user = userEvent.setup()
    const boost = vi.fn((item, query) =>
      item.id === "tabs" ? -1 : rankCommandItem(item, query)
    )

    render(<CommandPalette items={items} defaultOpen rank={boost} />)
    await user.type(screen.getByRole("combobox"), "hold")

    // Magnetic Tabs does not match "hold", but the ranker pulled it to the top.
    expect(screen.getAllByRole("option")[0]).toHaveTextContent("Magnetic Tabs")
    expect(boost).toHaveBeenCalled()
  })

  it("drops an item the ranker refuses", async () => {
    const user = userEvent.setup()

    render(<CommandPalette items={items} defaultOpen rank={() => false} />)
    await user.type(screen.getByRole("combobox"), "hold")

    expect(screen.queryByRole("option")).not.toBeInTheDocument()
  })
})
