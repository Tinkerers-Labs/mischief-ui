import * as React from "react"
import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  DataTable,
  type Column,
} from "../registry/default/data-table/data-table"

type Person = {
  id: string
  name: string
  seats: number
  plan: "Sketch" | "Studio" | "Workshop"
  note?: string
}

const people: Person[] = [
  { id: "c", name: "Radia", seats: 12, plan: "Studio" },
  { id: "a", name: "Ada", seats: 2, plan: "Workshop", note: "founder" },
  { id: "b", name: "Grace", seats: 40, plan: "Sketch" },
]

const RANK = { Sketch: 0, Studio: 1, Workshop: 2 }

const columns: Column<Person>[] = [
  { key: "name", header: "Name", sort: true },
  { key: "seats", header: "Seats", sort: true, align: "end" },
  { key: "plan", header: "Plan", sort: (a, b) => RANK[a.plan] - RANK[b.plan] },
  { key: "note", header: "Note", sort: true },
]

function names() {
  const body = screen.getAllByRole("rowgroup")[1]!
  return within(body)
    .getAllByRole("row")
    .map((row) => within(row).getAllByRole("cell")[0]!.textContent)
}

function table(
  props: Partial<React.ComponentProps<typeof DataTable<Person>>> = {}
) {
  return (
    <DataTable
      rows={people}
      columns={columns}
      getKey={(person) => person.id}
      getLabel={(person) => person.name}
      label="People"
      {...props}
    />
  )
}

describe("DataTable sorting", () => {
  it("only makes a heading pressable when the column can be sorted", () => {
    render(
      table({
        columns: [
          { key: "name", header: "Name", sort: true },
          { key: "seats", header: "Seats" },
        ],
      })
    )

    expect(screen.getByRole("button", { name: /Name/ })).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /Seats/ })
    ).not.toBeInTheDocument()
  })

  it("cycles ascending, descending, then back to the original order", async () => {
    const user = userEvent.setup()
    render(table())

    expect(names()).toEqual(["Radia", "Ada", "Grace"])

    await user.click(screen.getByRole("button", { name: /Name/ }))
    expect(names()).toEqual(["Ada", "Grace", "Radia"])
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
      "aria-sort",
      "ascending"
    )

    await user.click(screen.getByRole("button", { name: /Name/ }))
    expect(names()).toEqual(["Radia", "Grace", "Ada"])
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
      "aria-sort",
      "descending"
    )

    await user.click(screen.getByRole("button", { name: /Name/ }))
    expect(names()).toEqual(["Radia", "Ada", "Grace"])
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
      "aria-sort",
      "none"
    )
  })

  it("compares numbers as numbers rather than as text", async () => {
    const user = userEvent.setup()
    render(table())

    await user.click(screen.getByRole("button", { name: /Seats/ }))

    expect(names()).toEqual(["Ada", "Radia", "Grace"])
  })

  it("uses a column's own comparator when it has one", async () => {
    const user = userEvent.setup()
    render(table())

    await user.click(screen.getByRole("button", { name: /Plan/ }))

    expect(names()).toEqual(["Grace", "Radia", "Ada"])
  })

  it("keeps blank cells at the bottom whichever way the column points", async () => {
    const user = userEvent.setup()
    render(table())

    await user.click(screen.getByRole("button", { name: /Note/ }))
    expect(names()[0]).toBe("Ada")
    expect(names()[2]).not.toBe("Ada")

    await user.click(screen.getByRole("button", { name: /Note/ }))
    expect(names()[0]).toBe("Ada")
  })

  it("reports the sort instead of holding it when it is controlled", async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()

    render(table({ sort: null, onSortChange }))

    await user.click(screen.getByRole("button", { name: /Name/ }))

    expect(onSortChange).toHaveBeenCalledWith({
      column: "name",
      direction: "asc",
    })
    expect(names()).toEqual(["Radia", "Ada", "Grace"])
  })
})

describe("DataTable selection", () => {
  it("stays off until it is asked for", () => {
    render(table())
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
  })

  it("names every checkbox with the row it selects", () => {
    render(table({ defaultSelected: [] }))

    expect(
      screen.getByRole("checkbox", { name: "Select Ada" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("checkbox", { name: "Select all 3 rows" })
    ).toBeInTheDocument()
  })

  it("keeps selection in keys, so sorting does not move it", async () => {
    const user = userEvent.setup()

    function Harness() {
      const [selected, setSelected] = React.useState<string[]>([])
      return table({ selected, onSelectionChange: setSelected })
    }

    render(<Harness />)

    await user.click(screen.getByRole("checkbox", { name: "Select Ada" }))
    await user.click(screen.getByRole("button", { name: /Name/ }))

    expect(screen.getByRole("checkbox", { name: "Select Ada" })).toBeChecked()
    expect(
      screen.getByRole("checkbox", { name: "Select Grace" })
    ).not.toBeChecked()
  })

  it("shows the in-between state when only some rows are chosen", async () => {
    const user = userEvent.setup()

    function Harness() {
      const [selected, setSelected] = React.useState<string[]>([])
      return table({ selected, onSelectionChange: setSelected })
    }

    render(<Harness />)
    const all = screen.getByRole("checkbox", { name: /Select all/ })

    await user.click(screen.getByRole("checkbox", { name: "Select Ada" }))
    expect((all as HTMLInputElement).indeterminate).toBe(true)

    await user.click(screen.getByRole("checkbox", { name: "Select Grace" }))
    await user.click(screen.getByRole("checkbox", { name: "Select Radia" }))
    expect((all as HTMLInputElement).indeterminate).toBe(false)
    expect(all).toBeChecked()
  })

  it("extends from the last checkbox touched when shift is held", async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()

    function Harness() {
      const [selected, setSelected] = React.useState<string[]>([])
      return table({
        selected,
        onSelectionChange: (keys) => {
          onSelectionChange(keys)
          setSelected(keys)
        },
      })
    }

    render(<Harness />)

    await user.click(screen.getByRole("checkbox", { name: "Select Radia" }))
    await user.keyboard("{Shift>}")
    await user.click(screen.getByRole("checkbox", { name: "Select Grace" }))
    await user.keyboard("{/Shift}")

    expect(onSelectionChange).toHaveBeenLastCalledWith(["c", "a", "b"])
  })

  it("counts what is chosen in a live region", async () => {
    const user = userEvent.setup()

    function Harness() {
      const [selected, setSelected] = React.useState<string[]>([])
      return table({ selected, onSelectionChange: setSelected })
    }

    render(<Harness />)

    expect(screen.getByRole("status")).toHaveTextContent("0 of 3 selected")
    await user.click(screen.getByRole("checkbox", { name: "Select Ada" }))
    expect(screen.getByRole("status")).toHaveTextContent("1 of 3 selected")
  })

  it("does not select a row when the row itself is clicked", async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    const onSelectionChange = vi.fn()

    render(table({ selected: [], onSelectionChange, onRowClick }))

    const body = screen.getAllByRole("rowgroup")[1]!
    await user.click(within(body).getAllByRole("row")[0]!)

    expect(onRowClick).toHaveBeenCalledOnce()
    expect(onSelectionChange).not.toHaveBeenCalled()
  })
})

describe("DataTable columns", () => {
  it("stays a real table with a caption and scoped headers", () => {
    render(table())

    expect(screen.getByRole("table", { name: "People" })).toBeInTheDocument()
    for (const name of ["Name", "Seats", "Plan"]) {
      expect(
        screen.getByRole("columnheader", { name: new RegExp(name) })
      ).toBeInTheDocument()
    }
  })

  it("offers a resize handle only when it was asked for", () => {
    const { rerender } = render(table())
    expect(screen.queryAllByRole("separator")).toHaveLength(0)

    // Boundaries between columns, so one fewer handle than there are columns.
    rerender(table({ resizable: true }))
    expect(screen.getAllByRole("separator")).toHaveLength(columns.length - 1)
  })

  it("leaves a column out of resizing when it says so", () => {
    render(
      table({
        resizable: true,
        columns: [
          { key: "name", header: "Name" },
          { key: "seats", header: "Seats", resizable: false },
        ],
      })
    )

    expect(screen.getAllByRole("separator")).toHaveLength(1)
  })

  it("shows the empty state instead of rows when there are none", () => {
    render(table({ rows: [], empty: "No people yet" }))

    expect(screen.getByText("No people yet")).toBeInTheDocument()
  })
})

describe("DataTable columns, further", () => {
  it("sorts largest first when the column asks for it", async () => {
    const user = userEvent.setup()
    render(
      table({
        columns: [
          { key: "name", header: "Name" },
          { key: "seats", header: "Seats", sort: true, sortFirst: "desc" },
        ],
      })
    )

    await user.click(screen.getByRole("button", { name: /Seats/ }))
    expect(names()).toEqual(["Grace", "Radia", "Ada"])

    await user.click(screen.getByRole("button", { name: /Seats/ }))
    expect(names()).toEqual(["Ada", "Radia", "Grace"])
  })

  it("cuts a cell short unless the column asks to wrap", () => {
    const { container, rerender } = render(
      table({ columns: [{ key: "name", header: "Name" }] })
    )

    const cell = () => container.querySelector("tbody td > div") as HTMLElement

    expect(cell()).toHaveClass("truncate")

    rerender(table({ columns: [{ key: "name", header: "Name", wrap: true }] }))
    expect(cell()).not.toHaveClass("truncate")
    expect(cell()).toHaveClass("whitespace-normal")
  })

  it("adds a footer only when a column has one, and hands it the rows", () => {
    const { rerender } = render(table())
    expect(document.querySelector("tfoot")).not.toBeInTheDocument()

    rerender(
      table({
        columns: [
          { key: "name", header: "Name" },
          {
            key: "seats",
            header: "Seats",
            footer: (rows) => rows.reduce((total, p) => total + p.seats, 0),
          },
        ],
      })
    )

    expect(
      within(document.querySelector("tfoot")!).getByText("54")
    ).toBeInTheDocument()
  })

  it("holds a pinned column against the edge, checkbox included", () => {
    const { container } = render(
      table({
        defaultSelected: [],
        columns: [
          { key: "name", header: "Name", pinned: "start" },
          { key: "seats", header: "Seats" },
        ],
      })
    )

    const headers = container.querySelectorAll("thead th")
    expect(headers[0]).toHaveClass("sticky")
    expect(headers[1]).toHaveClass("sticky")
    expect(headers[2]).not.toHaveClass("sticky")
  })
})

describe("DataTable loading", () => {
  it("holds the placeholders back so a fast answer never flashes them", () => {
    vi.useFakeTimers()

    try {
      const { container } = render(table({ rows: [], loading: true }))
      expect(container.querySelectorAll("tbody tr")).toHaveLength(1)

      act(() => {
        vi.advanceTimersByTime(200)
      })

      expect(container.querySelectorAll("tbody tr").length).toBeGreaterThan(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it("says it is busy while it waits", () => {
    render(table({ loading: true }))
    expect(screen.getByRole("table", { name: "People" })).toHaveAttribute(
      "aria-busy",
      "true"
    )
  })

  it("shows one placeholder row per column, matching the real ones", () => {
    vi.useFakeTimers()

    try {
      const { container } = render(
        table({ rows: [], loading: true, loadingRows: 3 })
      )
      act(() => {
        vi.advanceTimersByTime(200)
      })

      const placeholders = container.querySelectorAll("tbody tr")
      expect(placeholders).toHaveLength(3)
      expect(placeholders[0]!.querySelectorAll("td")).toHaveLength(
        columns.length
      )
    } finally {
      vi.useRealTimers()
    }
  })
})
