import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { JsonViewer } from "../registry/default/json-viewer/json-viewer"

const data = {
  name: "acme",
  active: true,
  score: 0.94,
  missing: null,
  tags: ["a", "b"],
  nested: { deep: { deeper: 1 } },
}

describe("JsonViewer", () => {
  it("is a tree, and opens to the depth it was asked for", () => {
    render(<JsonViewer value={data} rootName="doc" defaultExpandedDepth={1} />)

    const tree = screen.getByRole("tree", { name: "JSON" })
    expect(tree).toBeInTheDocument()

    // Depth 1 shows the root's own keys, not what is inside them.
    expect(screen.getByText("name:")).toBeInTheDocument()
    expect(screen.queryByText("deep:")).not.toBeInTheDocument()
  })

  it("says how big a closed branch is rather than hiding it", () => {
    render(<JsonViewer value={data} defaultExpandedDepth={1} />)

    expect(screen.getByText("[ 2 items ]")).toBeInTheDocument()
    expect(screen.getByText("{ 1 item }")).toBeInTheDocument()
  })

  it("opens a branch on click and reports it to assistive tech", async () => {
    const user = userEvent.setup()
    render(<JsonViewer value={data} defaultExpandedDepth={1} />)

    const branch = screen.getByText("nested:").closest("[role='treeitem']")!
    expect(branch).toHaveAttribute("aria-expanded", "false")

    await user.click(branch)
    expect(branch).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText("deep:")).toBeInTheDocument()
  })

  it("walks and folds with the arrow keys", async () => {
    const user = userEvent.setup()
    render(<JsonViewer value={data} rootName="doc" defaultExpandedDepth={1} />)

    const root = screen.getByText("doc").closest("[role='treeitem']")!
    ;(root as HTMLElement).focus()

    await user.keyboard("{ArrowDown}")
    expect(screen.getByText("name:").closest("[role='treeitem']")).toHaveFocus()

    // Left from a leaf climbs to its parent.
    await user.keyboard("{ArrowLeft}")
    expect(root).toHaveFocus()

    await user.keyboard("{ArrowLeft}")
    expect(root).toHaveAttribute("aria-expanded", "false")
  })

  it("is one tab stop, and remembers where it was", async () => {
    const user = userEvent.setup()
    render(<JsonViewer value={data} rootName="doc" defaultExpandedDepth={1} />)

    const rows = screen.getAllByRole("treeitem")
    expect(rows.filter((row) => row.tabIndex === 0)).toHaveLength(1)
    expect(rows[0]).toHaveAttribute("aria-selected", "true")

    await act(async () => {
      ;(rows[0] as HTMLElement).focus()
    })
    await user.keyboard("{ArrowDown}{ArrowDown}")

    const moved = screen.getAllByRole("treeitem")
    expect(moved.filter((row) => row.tabIndex === 0)).toHaveLength(1)
    expect(moved[2]).toHaveAttribute("aria-selected", "true")
    expect(moved[2]!.tabIndex).toBe(0)
  })

  it("keeps a way in when the active row is folded away", async () => {
    const user = userEvent.setup()
    render(<JsonViewer value={data} rootName="doc" defaultExpandedDepth={2} />)

    const nested = screen.getByText("deep:").closest("[role='treeitem']")!
    await act(async () => {
      ;(nested as HTMLElement).focus()
    })
    expect(nested).toHaveAttribute("aria-selected", "true")

    // Fold the branch that row lived in.
    await user.click(screen.getByText("nested:").closest("[role='treeitem']")!)

    expect(screen.queryByText("deep:")).not.toBeInTheDocument()
    const rows = screen.getAllByRole("treeitem")
    expect(rows.filter((row) => row.tabIndex === 0)).toHaveLength(1)
  })

  it("marks up each scalar by type, so they are told apart", () => {
    render(<JsonViewer value={data} defaultExpandedDepth={1} />)

    expect(screen.getByText('"acme"')).toBeInTheDocument()
    expect(screen.getByText("true")).toBeInTheDocument()
    expect(screen.getByText("0.94")).toBeInTheDocument()
    expect(screen.getByText("null")).toBeInTheDocument()
  })

  it("indexes array members by position", async () => {
    const user = userEvent.setup()
    render(<JsonViewer value={data} defaultExpandedDepth={1} />)

    await user.click(screen.getByText("tags:").closest("[role='treeitem']")!)

    expect(screen.getByText("0:")).toBeInTheDocument()
    expect(screen.getByText("1:")).toBeInTheDocument()
  })

  it("offers a copy that names the path it would copy", () => {
    render(<JsonViewer value={data} rootName="doc" defaultExpandedDepth={1} />)

    expect(
      screen.getByRole("button", { name: "Copy doc.name" })
    ).toBeInTheDocument()
  })

  it("brackets a key that would not survive dot notation", async () => {
    const user = userEvent.setup()
    render(
      <JsonViewer
        value={{ "not an ident": { ok: 1 } }}
        rootName="doc"
        defaultExpandedDepth={1}
      />
    )

    expect(
      screen.getByRole("button", { name: 'Copy doc["not an ident"]' })
    ).toBeInTheDocument()

    await user.click(
      screen.getByText("not an ident:").closest("[role='treeitem']")!
    )
    expect(
      screen.getByRole("button", { name: 'Copy doc["not an ident"].ok' })
    ).toBeInTheDocument()
  })

  it("leaves an empty container as a leaf, with nothing to open", () => {
    render(<JsonViewer value={{ empty: [], full: [1] }} />)

    const empty = screen.getByText("empty:").closest("[role='treeitem']")!
    expect(empty).not.toHaveAttribute("aria-expanded")
  })

  it("truncates a long string instead of letting it push the row", () => {
    render(
      <JsonViewer value={{ long: "x".repeat(400) }} maxStringLength={20} />
    )

    const shown = screen.getByText(/^"x+…"$/)
    expect(shown.textContent!.length).toBeLessThan(30)
  })
})
