"use client"

import * as React from "react"
import {
  DataTable,
  type Column,
} from "@/registry/default/data-table/data-table"

type Person = {
  id: string
  name: string
  email: string
  plan: "Sketch" | "Studio" | "Workshop"
  seats: number
  renews: string
}

const people: Person[] = [
  {
    id: "1",
    name: "Ada Lovelace",
    email: "ada@analytical.co",
    plan: "Workshop",
    seats: 24,
    renews: "2026-11-02",
  },
  {
    id: "2",
    name: "Grace Hopper",
    email: "grace@compiler.dev",
    plan: "Studio",
    seats: 8,
    renews: "2026-09-18",
  },
  {
    id: "3",
    name: "Radia Perlman",
    email: "radia@spanning.net",
    plan: "Studio",
    seats: 12,
    renews: "2027-01-24",
  },
  {
    id: "4",
    name: "Barbara Liskov",
    email: "barbara@substitute.io",
    plan: "Sketch",
    seats: 1,
    renews: "2026-08-30",
  },
  {
    id: "5",
    name: "Katherine Johnson",
    email: "katherine@trajectory.org",
    plan: "Workshop",
    seats: 40,
    renews: "2026-12-11",
  },
]

// Plans have an order that is not alphabetical, so the column brings its own.
const RANK = { Sketch: 0, Studio: 1, Workshop: 2 }

// Fixed locale and zone, so the server and the browser agree on the text.
const renewsOn = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

const columns: Column<Person>[] = [
  {
    key: "name",
    header: "Name",
    sort: true,
    pinned: "start",
    width: "11rem",
    footer: (rows) => `${rows.length} people`,
    cell: (person) => <span className="font-medium">{person.name}</span>,
  },
  {
    key: "email",
    header: "Email",
    cell: (person) => (
      <a
        href={`mailto:${person.email}`}
        className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        onClick={(event) => event.stopPropagation()}
      >
        {person.email}
      </a>
    ),
  },
  {
    key: "plan",
    header: "Plan",
    width: "7rem",
    sort: (a, b) => RANK[a.plan] - RANK[b.plan],
    cell: (person) => (
      <span className="border-border inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold">
        {person.plan}
      </span>
    ),
  },
  {
    key: "seats",
    header: "Seats",
    width: "5rem",
    align: "end",
    sort: true,
    sortFirst: "desc",
    footer: (rows) => rows.reduce((total, person) => total + person.seats, 0),
  },
  {
    key: "renews",
    header: "Renews",
    width: "7.5rem",
    align: "end",
    sort: true,
    cell: (person) => renewsOn.format(new Date(person.renews)),
  },
]

export function DataTableDemo() {
  const [selected, setSelected] = React.useState<string[]>(["2"])
  const [density, setDensity] = React.useState<"comfortable" | "compact">(
    "comfortable"
  )
  const [striped, setStriped] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  return (
    <div className="grid w-full max-w-3xl gap-3">
      <DataTable
        rows={people}
        columns={columns}
        getKey={(person) => person.id}
        getLabel={(person) => person.name}
        label="Subscriptions"
        defaultSort={{ column: "name", direction: "asc" }}
        selected={selected}
        onSelectionChange={setSelected}
        density={density}
        striped={striped}
        loading={loading}
        resizable
      />

      <div className="flex flex-wrap items-center gap-2">
        <p className="text-muted-foreground mr-auto text-xs">
          {selected.length} of {people.length} selected. Drag a column edge, or
          focus one and use the arrow keys.
        </p>

        <button
          type="button"
          aria-pressed={density === "compact"}
          className="border-border inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold"
          onClick={() =>
            setDensity((value) =>
              value === "compact" ? "comfortable" : "compact"
            )
          }
        >
          {density === "compact" ? "Comfortable" : "Compact"}
        </button>

        <button
          type="button"
          className="border-border inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold"
          onClick={() => {
            setLoading(true)
            window.setTimeout(() => setLoading(false), 1600)
          }}
        >
          Reload
        </button>

        <button
          type="button"
          aria-pressed={striped}
          className="border-border inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold"
          onClick={() => setStriped((value) => !value)}
        >
          {striped ? "Plain rows" : "Striped rows"}
        </button>
      </div>
    </div>
  )
}
