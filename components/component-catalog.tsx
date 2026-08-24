"use client"

import * as React from "react"
import Link from "next/link"
import { Search } from "lucide-react"

import { componentDocs, componentFamilies } from "@/lib/component-docs"

const ALL = "All"

const families = [
  { name: ALL, count: componentDocs.length },
  ...componentFamilies.map((family) => ({
    name: family.name,
    count: family.components.length,
  })),
]

/**
 * The families stay as they were, because their descriptions are the reason to
 * read the page in the first place. What is new is a way to narrow them:
 * ninety four components is more than anyone reads top to bottom.
 */
export function ComponentCatalog() {
  const [family, setFamily] = React.useState(ALL)
  const [query, setQuery] = React.useState("")
  const reactId = React.useId()

  const needle = query.trim().toLowerCase()

  const shown = React.useMemo(
    () =>
      componentFamilies
        .filter((entry) => family === ALL || entry.name === family)
        .map((entry) => ({
          ...entry,
          components: entry.components.filter(
            (component) =>
              needle === "" ||
              component.name.toLowerCase().includes(needle) ||
              component.summary.toLowerCase().includes(needle) ||
              component.family.toLowerCase().includes(needle)
          ),
        }))
        .filter((entry) => entry.components.length > 0),
    [family, needle]
  )

  const total = shown.reduce(
    (count, entry) => count + entry.components.length,
    0
  )

  return (
    <>
      <section className="docs-section" aria-labelledby="browse-heading">
        <h2 id="browse-heading">
          Browse
          <span className="docs-family-count">{total}</span>
        </h2>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div
            role="group"
            aria-label="Filter by family"
            className="flex flex-wrap gap-1.5"
          >
            {families.map((entry) => (
              <button
                key={entry.name}
                type="button"
                aria-pressed={family === entry.name}
                onClick={() => setFamily(entry.name)}
                className={
                  family === entry.name
                    ? "bg-foreground text-background inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold"
                    : "border-border text-muted-foreground hover:text-foreground inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold"
                }
              >
                {entry.name}
                <span className="opacity-60">{entry.count}</span>
              </button>
            ))}
          </div>

          <div className="relative lg:ml-auto lg:w-60">
            <Search
              aria-hidden="true"
              size={15}
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            />
            <label className="sr-only" htmlFor={`${reactId}-search`}>
              Search components
            </label>
            <input
              id={`${reactId}-search`}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search components"
              className="border-border bg-background focus-visible:border-ring focus-visible:ring-ring min-h-9 w-full rounded-full border pr-3 pl-9 text-sm focus-visible:ring-2 focus-visible:outline-none"
            />
          </div>
        </div>
      </section>

      {shown.length === 0 ? (
        <section className="docs-section">
          <p>
            Nothing {family === ALL ? "" : `in ${family} `}matches{" "}
            {`"${query}"`}.
          </p>

          {/* A family filter is the usual reason a search comes back empty,
              and it is not always obvious that one is still on. */}
          {family !== ALL && (
            <button
              type="button"
              onClick={() => setFamily(ALL)}
              className="border-border mt-3 inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold"
            >
              Search all {componentDocs.length} instead
            </button>
          )}
        </section>
      ) : (
        shown.map((entry) => (
          <section className="docs-section" key={entry.name}>
            <h2>
              {entry.name}
              <span className="docs-family-count">
                {entry.components.length}
              </span>
            </h2>
            <p>{entry.description}</p>
            <div className="docs-component-list">
              {entry.components.map((component) => (
                <Link
                  key={component.slug}
                  href={`/docs/components/${component.slug}`}
                >
                  <span>{component.number}</span>
                  <strong>{component.name}</strong>
                  <p>{component.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </>
  )
}
