"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import { componentDocs } from "@/lib/component-docs"

type Result = {
  slug: string
  name: string
  family: string
  summary: string
}

const entries: Result[] = componentDocs.map((component) => ({
  slug: component.slug,
  name: component.name,
  family: component.family,
  summary: component.summary,
}))

function score(entry: Result, query: string) {
  const name = entry.name.toLowerCase()

  if (name === query) return 0
  if (name.startsWith(query)) return 1
  if (name.includes(query)) return 2
  if (entry.family.toLowerCase().includes(query)) return 3
  if (entry.summary.toLowerCase().includes(query)) return 4

  return Number.POSITIVE_INFINITY
}

function search(query: string) {
  const trimmed = query.trim().toLowerCase()

  if (!trimmed) return entries.slice(0, 8)

  return entries
    .map((entry) => ({ entry, rank: score(entry, trimmed) }))
    .filter(({ rank }) => Number.isFinite(rank))
    .sort((a, b) => a.rank - b.rank || a.entry.name.localeCompare(b.entry.name))
    .slice(0, 8)
    .map(({ entry }) => entry)
}

export function SiteSearch() {
  const router = useRouter()
  const listId = React.useId()
  const dialogRef = React.useRef<HTMLDialogElement>(null)
  const fieldRef = React.useRef<HTMLInputElement>(null)

  const [query, setQuery] = React.useState("")
  const [highlighted, setHighlighted] = React.useState(0)

  const results = React.useMemo(() => search(query), [query])
  const active = results[Math.min(highlighted, results.length - 1)]

  const open = () => {
    setQuery("")
    setHighlighted(0)
    dialogRef.current?.showModal()
    fieldRef.current?.focus()
  }

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "k" || !(event.metaKey || event.ctrlKey)) return

      event.preventDefault()
      if (dialogRef.current?.open) dialogRef.current.close()
      else open()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const go = (slug: string) => {
    dialogRef.current?.close()
    router.push(`/docs/components/${slug}`)
  }

  return (
    <>
      <button
        type="button"
        data-slot="site-search-trigger"
        aria-label="Search components"
        aria-keyshortcuts="Meta+K Control+K"
        className="text-muted-foreground hover:text-foreground border-border hover:border-foreground/25 focus-visible:ring-ring ml-1 inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-semibold focus-visible:ring-2 focus-visible:outline-none"
        onClick={open}
      >
        <Search aria-hidden="true" size={14} />
        <span className="hidden sm:inline">Search</span>
        <kbd className="text-muted-foreground hidden font-[family-name:var(--font-mono),monospace] text-[0.65rem] lg:inline">
          ⌘K
        </kbd>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Search components"
        className="site-search-dialog"
        onClose={() => setQuery("")}
        onClick={(event) => {
          // A click on the backdrop lands on the dialog itself.
          if (event.target === dialogRef.current) dialogRef.current?.close()
        }}
      >
        <div className="site-search-panel">
          <div className="site-search-field">
            <Search
              aria-hidden="true"
              size={15}
              className="text-muted-foreground shrink-0"
            />
            <input
              ref={fieldRef}
              type="text"
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={
                active ? `${listId}-${active.slug}` : undefined
              }
              autoComplete="off"
              placeholder="Search components…"
              aria-label="Search components"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setHighlighted(0)
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault()
                  setHighlighted((current) =>
                    Math.min(current + 1, results.length - 1)
                  )
                } else if (event.key === "ArrowUp") {
                  event.preventDefault()
                  setHighlighted((current) => Math.max(current - 1, 0))
                } else if (event.key === "Enter" && active) {
                  event.preventDefault()
                  go(active.slug)
                }
              }}
            />
          </div>

          <ul id={listId} role="listbox" aria-label="Results">
            {results.map((result) => (
              <li
                key={result.slug}
                id={`${listId}-${result.slug}`}
                role="option"
                aria-selected={result.slug === active?.slug}
                data-active={result.slug === active?.slug || undefined}
              >
                <button type="button" onClick={() => go(result.slug)}>
                  <span className="site-search-name">{result.name}</span>
                  <span className="site-search-family">{result.family}</span>
                  <span className="site-search-summary">{result.summary}</span>
                </button>
              </li>
            ))}
          </ul>

          {results.length === 0 ? (
            <p className="site-search-empty" role="status">
              Nothing matches “{query.trim()}”.
            </p>
          ) : null}
        </div>
      </dialog>
    </>
  )
}
