import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CsvViewer } from "../registry/default/csv-viewer/csv-viewer"
import { DocxViewer } from "../registry/default/docx-viewer/docx-viewer"
import { MarkdownBlocks } from "../registry/default/markdown-blocks/markdown-blocks"
import {
  PdfViewer,
  type PdfDocumentHandle,
} from "../registry/default/pdf-viewer/pdf-viewer"

describe("CsvViewer", () => {
  const table = {
    fields: ["name", "amount"],
    rows: [
      ["Beta", "20"],
      ["Alpha", "100"],
      ["Gamma", "3"],
    ],
  }

  it("renders a real table with a caption and column headers", () => {
    render(<CsvViewer table={table} />)

    expect(screen.getByRole("table", { name: "CSV contents" })).toBeVisible()
    expect(screen.getAllByRole("columnheader")).toHaveLength(2)
    expect(screen.getAllByRole("row")).toHaveLength(4)
  })

  it("sorts numerically rather than as text, and reports sort state", async () => {
    const user = userEvent.setup()

    render(<CsvViewer table={table} />)

    await user.click(screen.getByRole("button", { name: /amount/i }))

    const cells = screen.getAllByRole("cell").map((cell) => cell.textContent)
    expect(cells).toEqual(["Gamma", "3", "Beta", "20", "Alpha", "100"])
    expect(screen.getAllByRole("columnheader")[1]).toHaveAttribute(
      "aria-sort",
      "ascending"
    )
  })

  it("reverses on a second click", async () => {
    const user = userEvent.setup()

    render(<CsvViewer table={table} />)
    const header = screen.getByRole("button", { name: /amount/i })

    await user.click(header)
    await user.click(header)

    const cells = screen.getAllByRole("cell").map((cell) => cell.textContent)
    expect(cells).toEqual(["Alpha", "100", "Beta", "20", "Gamma", "3"])
  })

  it("caps rows and says how many are hidden", () => {
    render(<CsvViewer table={table} maxRows={2} />)

    expect(screen.getByText("Showing 2 of 3 rows")).toBeVisible()
  })

  it("parses through an injected parser", async () => {
    const parser = vi.fn(async () => table)

    render(<CsvViewer source="name,amount" parser={parser} />)

    await waitFor(() => expect(screen.getByRole("table")).toBeVisible())
    expect(parser).toHaveBeenCalledWith("name,amount")
  })

  it("surfaces a parser failure instead of rendering an empty table", async () => {
    const parser = vi.fn(async () => {
      throw new Error("Row 3 is malformed")
    })

    render(<CsvViewer source="broken" parser={parser} />)

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Row 3 is malformed")
    )
    expect(screen.queryByRole("table")).not.toBeInTheDocument()
  })
})

describe("DocxViewer", () => {
  it("renders converted content as elements", async () => {
    render(
      <DocxViewer
        result={{
          html: "<h1>Agreement</h1><p>Between <strong>two</strong> parties.</p>",
        }}
      />
    )

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Agreement" })).toBeVisible()
    )
    expect(screen.getByText("two").tagName).toBe("STRONG")
  })

  it("drops scripts and event handlers from a converted document", async () => {
    const { container } = render(
      <DocxViewer
        result={{
          html:
            "<p>Safe</p><script>window.__pwned = true</script>" +
            '<img src="x" onerror="window.__pwned = true">',
        }}
      />
    )

    await waitFor(() => expect(screen.getByText("Safe")).toBeVisible())

    expect(container.querySelector("script")).toBeNull()
    expect(container.querySelector("img")).not.toHaveAttribute("onerror")
    expect(
      (window as unknown as Record<string, unknown>).__pwned
    ).toBeUndefined()
  })

  it("discards script contents rather than showing them as text", async () => {
    render(
      <DocxViewer
        result={{ html: "<p>Before</p><script>var leaked = 1</script>" }}
      />
    )

    await waitFor(() => expect(screen.getByText("Before")).toBeVisible())
    expect(screen.queryByText(/var leaked/)).not.toBeInTheDocument()
  })

  it("does not put loose whitespace inside a table", async () => {
    const { container } = render(
      <DocxViewer
        result={{
          html: "<table>\n  <tbody>\n    <tr>\n      <td>A</td>\n    </tr>\n  </tbody>\n</table>",
        }}
      />
    )

    await waitFor(() => expect(screen.getByRole("table")).toBeVisible())

    const table = container.querySelector("table")!
    const strayText = [...table.childNodes].filter(
      (node) => node.nodeType === 3 && !node.textContent?.trim()
    )
    expect(strayText).toEqual([])
  })

  it("strips a javascript: link but keeps the text", async () => {
    render(
      <DocxViewer
        result={{ html: '<p><a href="javascript:alert(1)">Click me</a></p>' }}
      />
    )

    await waitFor(() => expect(screen.getByText("Click me")).toBeVisible())
    expect(screen.getByText("Click me")).not.toHaveAttribute("href")
  })

  it("keeps an ordinary link and makes it safe to open", async () => {
    render(
      <DocxViewer
        result={{ html: '<p><a href="https://example.com">Terms</a></p>' }}
      />
    )

    const link = await screen.findByRole("link", { name: "Terms" })
    expect(link).toHaveAttribute("href", "https://example.com")
    expect(link).toHaveAttribute("rel", "noreferrer noopener")
  })

  it("reports a converter failure", async () => {
    const converter = vi.fn(async () => {
      throw new Error("Not a .docx file")
    })

    render(<DocxViewer source={new ArrayBuffer(8)} converter={converter} />)

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Not a .docx file")
    )
  })
})

describe("PdfViewer", () => {
  function fakeDocument(pageCount: number): PdfDocumentHandle {
    return {
      pageCount,
      getPage: async () => ({
        width: 200,
        height: 300,
        render: async () => undefined,
      }),
    }
  }

  it("shows the page count and disables the ends", async () => {
    render(<PdfViewer document={fakeDocument(3)} />)

    await waitFor(() => expect(screen.getByText("1 / 3")).toBeVisible())
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled()
  })

  it("moves between pages and reports the change", async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(<PdfViewer document={fakeDocument(3)} onPageChange={onPageChange} />)

    await user.click(screen.getByRole("button", { name: "Next page" }))

    expect(onPageChange).toHaveBeenCalledWith(2)
    expect(screen.getByText("2 / 3")).toBeVisible()
  })

  it("never runs past the last page", async () => {
    const user = userEvent.setup()

    render(<PdfViewer document={fakeDocument(2)} defaultPage={2} />)

    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Previous page" }))
    expect(screen.getByText("1 / 2")).toBeVisible()
  })

  it("clamps zoom to its bounds", async () => {
    const user = userEvent.setup()

    render(
      <PdfViewer document={fakeDocument(1)} defaultScale={1} maxScale={1.25} />
    )

    await user.click(screen.getByRole("button", { name: "Zoom in" }))
    expect(screen.getByText("125%")).toBeVisible()
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeDisabled()
  })

  it("reports a loader failure", async () => {
    const loader = vi.fn(async () => {
      throw new Error("Encrypted document")
    })

    render(<PdfViewer source="/secret.pdf" loader={loader} />)

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Encrypted document")
    )
  })

  it("names the canvas with the page it is showing", async () => {
    render(<PdfViewer document={fakeDocument(4)} defaultPage={3} />)

    expect(
      screen.getByRole("img", { name: "PDF document, page 3" })
    ).toBeInTheDocument()
  })
})

describe("MarkdownBlocks", () => {
  const blocks = [
    {
      id: "title",
      kind: "heading" as const,
      content: "# Master Agreement",
      page: 1,
    },
    {
      id: "terms",
      kind: "table" as const,
      content: "| Term | Value |\n| --- | --- |\n| Net | 30 |",
      page: 2,
    },
  ]

  it("renders markdown, including gfm tables", () => {
    render(<MarkdownBlocks blocks={blocks} />)

    expect(
      screen.getByRole("heading", { name: "Master Agreement" })
    ).toBeVisible()
    expect(screen.getByRole("table")).toBeVisible()
    expect(screen.getByRole("cell", { name: "30" })).toBeVisible()
  })

  it("does not render raw html embedded in a block", () => {
    const { container } = render(
      <MarkdownBlocks
        blocks={[{ id: "x", content: "<script>window.__md = true</script>ok" }]}
      />
    )

    expect(container.querySelector("script")).toBeNull()
    expect((window as unknown as Record<string, unknown>).__md).toBeUndefined()
  })

  it("toggles block selection", async () => {
    const user = userEvent.setup()
    const onActiveChange = vi.fn()

    render(<MarkdownBlocks blocks={blocks} onActiveChange={onActiveChange} />)

    const first = screen.getAllByRole("button")[0]!
    await user.click(first)
    expect(onActiveChange).toHaveBeenCalledWith("title")
    expect(first).toHaveAttribute("aria-pressed", "true")

    await user.click(first)
    expect(onActiveChange).toHaveBeenLastCalledWith(null)
  })

  it("shows the kind and page for each block", () => {
    render(<MarkdownBlocks blocks={blocks} />)

    expect(screen.getByText("Heading")).toBeVisible()
    expect(screen.getByText("p.2")).toBeVisible()
  })
})
