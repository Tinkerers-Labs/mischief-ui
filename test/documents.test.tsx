import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { BoundingBoxes } from "../registry/default/bounding-boxes/bounding-boxes"
import { DocumentSplits } from "../registry/default/document-splits/document-splits"
import { FileTree } from "../registry/default/file-tree/file-tree"
import { PageNavigator } from "../registry/default/page-navigator/page-navigator"
import { SchemaBuilder } from "../registry/default/schema-builder/schema-builder"
import { SignaturePad } from "../registry/default/signature-pad/signature-pad"

describe("BoundingBoxes", () => {
  const boxes = [
    { id: "total", label: "Total", x: 0.1, y: 0.2, width: 0.3, height: 0.05 },
    { id: "date", label: "Date", x: 0.6, y: 0.1, width: 0.2, height: 0.04 },
  ]

  it("positions each region as a percentage of the page", () => {
    render(<BoundingBoxes alt="Invoice" boxes={boxes} src="/page-1.png" />)

    const region = screen.getByRole("button", { name: "Total" }).parentElement

    expect(region).toHaveStyle({ left: "10%", top: "20%", width: "30%" })
  })

  it("toggles selection and reports it", async () => {
    const user = userEvent.setup()
    const onActiveChange = vi.fn()

    render(
      <BoundingBoxes
        alt="Invoice"
        boxes={boxes}
        src="/page-1.png"
        onActiveChange={onActiveChange}
      />
    )

    const total = screen.getByRole("button", { name: "Total" })
    await user.click(total)

    expect(onActiveChange).toHaveBeenCalledWith("total")
    expect(total).toHaveAttribute("aria-pressed", "true")

    await user.click(total)
    expect(onActiveChange).toHaveBeenLastCalledWith(null)
  })

  it("clamps coordinates that fall outside the page", () => {
    render(
      <BoundingBoxes
        alt="Invoice"
        boxes={[
          { id: "wide", label: "Wide", x: -1, y: 0, width: 5, height: 1 },
        ]}
        src="/page-1.png"
      />
    )

    const region = screen.getByRole("button", { name: "Wide" }).parentElement
    expect(region).toHaveStyle({ left: "0%", width: "100%" })
  })
})

describe("PageNavigator", () => {
  const pages = [{ number: 1 }, { number: 2 }, { number: 3 }]

  it("marks the active page and moves with arrow keys", async () => {
    const onActivePageChange = vi.fn()

    render(
      <PageNavigator
        pages={pages}
        defaultActivePage={1}
        onActivePageChange={onActivePageChange}
      />
    )

    const tabs = screen.getAllByRole("tab")
    expect(tabs[0]).toHaveAttribute("aria-selected", "true")
    expect(tabs[1]).toHaveAttribute("tabindex", "-1")

    fireEvent.keyDown(tabs[0]!, { key: "ArrowDown" })
    expect(onActivePageChange).toHaveBeenCalledWith(2)

    fireEvent.keyDown(screen.getAllByRole("tab")[1]!, { key: "End" })
    expect(onActivePageChange).toHaveBeenLastCalledWith(3)
  })

  it("does not move past the first page", () => {
    const onActivePageChange = vi.fn()

    render(
      <PageNavigator
        pages={pages}
        defaultActivePage={1}
        onActivePageChange={onActivePageChange}
      />
    )

    fireEvent.keyDown(screen.getAllByRole("tab")[0]!, { key: "ArrowUp" })
    expect(onActivePageChange).toHaveBeenCalledWith(1)
  })
})

describe("FileTree", () => {
  const nodes = [
    {
      id: "invoices",
      name: "invoices",
      kind: "folder" as const,
      children: [
        { id: "jan", name: "january.pdf" },
        { id: "feb", name: "february.pdf" },
      ],
    },
    { id: "readme", name: "readme.md" },
  ]

  it("exposes tree semantics with levels and expansion", () => {
    render(<FileTree nodes={nodes} defaultExpandedIds={["invoices"]} />)

    const items = screen.getAllByRole("treeitem")
    expect(items).toHaveLength(4)
    expect(items[0]).toHaveAttribute("aria-expanded", "true")
    expect(items[0]).toHaveAttribute("aria-level", "1")
    expect(items[1]).toHaveAttribute("aria-level", "2")
    expect(items[1]).not.toHaveAttribute("aria-expanded")
  })

  it("hides children of a collapsed folder", () => {
    render(<FileTree nodes={nodes} />)

    expect(screen.getAllByRole("treeitem")).toHaveLength(2)
    expect(screen.queryByText("january.pdf")).not.toBeInTheDocument()
  })

  it("expands with ArrowRight and collapses with ArrowLeft", () => {
    render(<FileTree nodes={nodes} />)

    const folder = screen.getAllByRole("treeitem")[0]!
    fireEvent.keyDown(folder, { key: "ArrowRight" })
    expect(screen.getAllByRole("treeitem")).toHaveLength(4)

    fireEvent.keyDown(screen.getAllByRole("treeitem")[0]!, { key: "ArrowLeft" })
    expect(screen.getAllByRole("treeitem")).toHaveLength(2)
  })

  it("reports the selected node", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(<FileTree nodes={nodes} onSelect={onSelect} />)

    await user.click(screen.getByText("readme.md"))

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "readme" })
    )
  })
})

describe("DocumentSplits", () => {
  const pages = [{ number: 1 }, { number: 2 }, { number: 3 }, { number: 4 }]

  it("treats the pages as one document until a split is added", () => {
    render(<DocumentSplits pages={pages} />)

    expect(screen.getByText("1 document")).toBeInTheDocument()
    expect(screen.getByText(/Document 1 · 4 pages/)).toBeInTheDocument()
  })

  it("splits into segments and reports the boundaries", async () => {
    const user = userEvent.setup()
    const onSplitChange = vi.fn()

    render(<DocumentSplits pages={pages} onSplitChange={onSplitChange} />)

    await user.click(
      screen.getByRole("button", { name: /split after page 2/i })
    )

    expect(onSplitChange).toHaveBeenCalledWith([2])
    expect(screen.getByText("2 documents")).toBeInTheDocument()
    expect(screen.getByText(/Document 1 · 2 pages/)).toBeInTheDocument()
    expect(screen.getByText(/Document 2 · 2 pages/)).toBeInTheDocument()
  })

  it("offers no split control after the final page", () => {
    render(<DocumentSplits pages={pages} />)

    expect(
      screen.queryByRole("button", { name: /split after page 4/i })
    ).not.toBeInTheDocument()
  })

  it("clears every split at once", async () => {
    const user = userEvent.setup()

    render(<DocumentSplits pages={pages} defaultSplitAfter={[1, 3]} />)
    expect(screen.getByText("3 documents")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /clear splits/i }))
    expect(screen.getByText("1 document")).toBeInTheDocument()
  })
})

describe("SchemaBuilder", () => {
  it("adds a field and reports the change", async () => {
    const user = userEvent.setup()
    const onFieldsChange = vi.fn()

    render(<SchemaBuilder onFieldsChange={onFieldsChange} />)

    await user.click(screen.getByRole("button", { name: "Add field" }))

    expect(onFieldsChange).toHaveBeenCalledWith([
      expect.objectContaining({ name: "", type: "string" }),
    ])
  })

  it("only nests inside object and array fields", async () => {
    const user = userEvent.setup()

    render(
      <SchemaBuilder
        defaultFields={[
          { id: "a", name: "total", type: "string" },
          { id: "b", name: "lines", type: "array" },
        ]}
      />
    )

    expect(
      screen.queryByRole("button", { name: /fields inside total/i })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /fields inside lines/i })
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole("button", { name: /add field inside lines/i })
    )

    expect(screen.getAllByPlaceholderText("field_name")).toHaveLength(3)
  })

  it("removes a field by name", async () => {
    const user = userEvent.setup()
    const onFieldsChange = vi.fn()

    render(
      <SchemaBuilder
        defaultFields={[
          { id: "a", name: "total", type: "string" },
          { id: "b", name: "date", type: "date" },
        ]}
        onFieldsChange={onFieldsChange}
      />
    )

    await user.click(screen.getByRole("button", { name: "Remove total" }))

    expect(onFieldsChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: "b" }),
    ])
  })

  it("stops nesting at maxDepth", () => {
    render(
      <SchemaBuilder
        maxDepth={1}
        defaultFields={[{ id: "a", name: "lines", type: "array" }]}
      />
    )

    expect(
      screen.queryByRole("button", { name: /fields inside lines/i })
    ).not.toBeInTheDocument()
  })
})

describe("SignaturePad", () => {
  it("offers a typed alternative to drawing", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<SignaturePad onChange={onChange} />)

    expect(
      screen.getByRole("img", { name: /drawing area/i })
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Type" }))

    const field = screen.getByRole("textbox", { name: "Signature" })
    await user.type(field, "Ada")

    expect(onChange).toHaveBeenLastCalledWith({ mode: "type", text: "Ada" })
  })

  it("keeps clear disabled until there is something to clear", async () => {
    const user = userEvent.setup()

    render(<SignaturePad defaultMode="type" />)

    const clear = screen.getByRole("button", { name: /clear/i })
    expect(clear).toBeDisabled()

    await user.type(screen.getByRole("textbox", { name: "Signature" }), "Ada")
    expect(clear).toBeEnabled()
  })

  it("reports an empty signature after clearing", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<SignaturePad defaultMode="type" onChange={onChange} />)

    await user.type(screen.getByRole("textbox", { name: "Signature" }), "Ada")
    await user.click(screen.getByRole("button", { name: /clear/i }))

    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(screen.getByRole("textbox", { name: "Signature" })).toHaveValue("")
  })
})
