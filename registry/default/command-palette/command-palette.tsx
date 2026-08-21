"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

export type CommandItem = {
  id: string
  label: string
  description?: string
  group?: string
  /** Extra words that should match, without being shown. */
  keywords?: string[]
}

export type CommandPaletteProps = Omit<
  React.HTMLAttributes<HTMLDialogElement>,
  "children" | "onSelect"
> & {
  items: CommandItem[]
  onSelect?: (item: CommandItem) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Key used with Meta or Control to toggle. Pass false to bind nothing. */
  shortcut?: string | false
  placeholder?: string
  label?: string
  emptyMessage?: (query: string) => React.ReactNode
  maxResults?: number
  /** Called as the query changes, for fetching the results yourself. */
  onQueryChange?: (query: string) => void
  /** Says results are on their way. Pair it with onQueryChange. */
  loading?: boolean
  loadingMessage?: React.ReactNode
  /**
   * Rank and filter the items here. Turn it off when they arrive already
   * matched and ordered, so a server's ranking is not overruled.
   */
  filter?: boolean
  /**
   * Score an item against the query yourself: fuzzy matching, a field we do
   * not know about, a weighting of your own. Lower is a better match, and
   * false or nothing drops the item.
   */
  rank?: CommandRanker
}

export type CommandRanker = (
  item: CommandItem,
  query: string
) => number | false | null | undefined

/**
 * Lower is a better match; Infinity, false, or nothing means no match. It is
 * exported so a ranker of your own can fall back to it rather than reproduce
 * it.
 */
export function rankCommandItem(item: CommandItem, rawQuery: string) {
  const query = rawQuery.trim().toLowerCase()
  const label = item.label.toLowerCase()

  if (label === query) return 0
  if (label.startsWith(query)) return 1
  if (label.includes(query)) return 2
  if (item.group?.toLowerCase().includes(query)) return 3
  if (item.keywords?.some((word) => word.toLowerCase().includes(query)))
    return 4
  if (item.description?.toLowerCase().includes(query)) return 5

  return Number.POSITIVE_INFINITY
}

export function CommandPalette({
  items,
  onSelect,
  open,
  defaultOpen = false,
  onOpenChange,
  shortcut = "k",
  placeholder = "Search…",
  label = "Search",
  emptyMessage = (query) => `Nothing matches “${query}”.`,
  onQueryChange,
  loading = false,
  loadingMessage = "Searching…",
  filter = true,
  rank = rankCommandItem,
  maxResults = 8,
  className,
  ...dialogProps
}: CommandPaletteProps) {
  const listId = React.useId()
  const dialogRef = React.useRef<HTMLDialogElement>(null)
  const fieldRef = React.useRef<HTMLInputElement>(null)

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const [query, setQuery] = React.useState("")
  const [highlighted, setHighlighted] = React.useState(0)

  const isOpen = open ?? uncontrolledOpen

  const results = React.useMemo(() => {
    // Already matched and ordered by whoever fetched them.
    if (!filter) return items.slice(0, maxResults)

    // The ranker is handed the query as typed, so one of your own can be
    // case-sensitive if it wants to be. The built-in lowercases internally.
    const trimmed = query.trim()

    if (!trimmed) return items.slice(0, maxResults)

    return items
      .map((item) => ({ item, score: rank(item, trimmed) }))
      .filter(
        (entry): entry is { item: CommandItem; score: number } =>
          typeof entry.score === "number" && Number.isFinite(entry.score)
      )
      .sort(
        (a, b) => a.score - b.score || a.item.label.localeCompare(b.item.label)
      )
      .slice(0, maxResults)
      .map(({ item }) => item)
  }, [items, query, maxResults, filter, rank])

  const active = results[Math.min(highlighted, results.length - 1)]

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (open === undefined) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [open, onOpenChange]
  )

  // The dialog element owns its own visibility, so it is driven from state
  // rather than rendered conditionally, which keeps focus handling native.
  React.useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      setQuery("")
      setHighlighted(0)
      dialog.showModal()
      fieldRef.current?.focus()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  React.useEffect(() => {
    if (shortcut === false) return

    const onKeyDown = (event: KeyboardEvent) => {
      // Another palette, or the page itself, may already have claimed this
      // chord. Without the check every listener bound to it opens, and the
      // reader gets a stack of modals from one keypress.
      if (event.defaultPrevented) return
      if (event.key.toLowerCase() !== shortcut.toLowerCase()) return
      if (!event.metaKey && !event.ctrlKey) return

      event.preventDefault()
      setOpen(!dialogRef.current?.open)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [shortcut, setOpen])

  const choose = (item: CommandItem) => {
    setOpen(false)
    onSelect?.(item)
  }

  return (
    <dialog
      ref={dialogRef}
      data-slot="command-palette"
      aria-label={label}
      className={cn(
        "bg-transparent p-0 text-inherit backdrop:bg-black/45 backdrop:backdrop-blur-[3px] open:m-0 open:max-h-dvh open:w-dvw open:max-w-dvw",
        className
      )}
      onClose={() => setOpen(false)}
      onClick={(event) => {
        // A click on the backdrop lands on the dialog itself.
        if (event.target === dialogRef.current) setOpen(false)
      }}
      {...dialogProps}
    >
      <div
        data-slot="command-palette-panel"
        className="border-border bg-card text-card-foreground mx-auto mt-20 w-[calc(100vw-2rem)] max-w-[34rem] overflow-hidden rounded-2xl border shadow-2xl"
      >
        <div
          data-slot="command-palette-field"
          className="border-border text-muted-foreground flex items-center gap-2.5 border-b px-4"
        >
          <Search aria-hidden="true" size={15} className="shrink-0" />
          <input
            ref={fieldRef}
            type="text"
            role="combobox"
            aria-expanded
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              active ? `${listId}-${active.id}` : undefined
            }
            aria-label={label}
            autoComplete="off"
            placeholder={placeholder}
            value={query}
            className="text-foreground placeholder:text-muted-foreground min-h-13 w-full min-w-0 bg-transparent text-[0.95rem] outline-none"
            onChange={(event) => {
              setQuery(event.target.value)
              setHighlighted(0)
              onQueryChange?.(event.target.value)
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
                choose(active)
              }
            }}
          />
        </div>

        <ul
          id={listId}
          role="listbox"
          aria-busy={loading || undefined}
          aria-label={label}
          className="m-0 grid max-h-[22rem] list-none overflow-y-auto overscroll-contain p-1.5"
        >
          {results.map((item) => (
            <li
              key={item.id}
              id={`${listId}-${item.id}`}
              role="option"
              aria-selected={item.id === active?.id}
              data-active={item.id === active?.id || undefined}
              className="[&[data-active]>button]:bg-muted"
            >
              <button
                type="button"
                className="hover:bg-muted grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 rounded-[calc(var(--radius)-0.15rem)] px-3 py-2 text-left transition-colors duration-150 motion-reduce:transition-none"
                onClick={() => choose(item)}
              >
                <span
                  data-slot="command-palette-label"
                  className="truncate text-sm font-semibold"
                >
                  {item.label}
                </span>

                {item.group ? (
                  <span
                    data-slot="command-palette-group"
                    className="text-muted-foreground justify-self-end font-[family-name:var(--font-mono),monospace] text-[0.65rem] tracking-[0.06em] uppercase"
                  >
                    {item.group}
                  </span>
                ) : null}

                {item.description ? (
                  <span
                    data-slot="command-palette-description"
                    className="text-muted-foreground col-span-full line-clamp-2 text-xs leading-relaxed"
                  >
                    {item.description}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>

        {/* While results are coming, say so rather than claiming there are
            none: an empty list mid-flight is not an answer. */}
        {loading ? (
          <p
            data-slot="command-palette-loading"
            role="status"
            className="text-muted-foreground px-4 py-5 text-sm"
          >
            {loadingMessage}
          </p>
        ) : results.length === 0 ? (
          <p
            data-slot="command-palette-empty"
            role="status"
            className="text-muted-foreground px-4 py-5 text-sm"
          >
            {emptyMessage(query.trim())}
          </p>
        ) : null}
      </div>
    </dialog>
  )
}
