"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, X } from "lucide-react"

import { cn } from "@/lib/utils"

export type ComboboxOption = {
  value: string
  label: string
  description?: string
  /** Puts the option under a named heading in the list. */
  group?: string
  /** Extra words that should match, without being shown. */
  keywords?: readonly string[]
  disabled?: boolean
}

type ComboboxBaseProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> & {
  options: readonly ComboboxOption[]
  label?: string
  placeholder?: string
  emptyMessage?: (query: string) => React.ReactNode
  disabled?: boolean
  /** Called as the query changes, for fetching the options yourself. */
  onQueryChange?: (query: string) => void
  /** Says options are on their way. Pair it with onQueryChange. */
  loading?: boolean
  loadingMessage?: React.ReactNode
  /**
   * Rank and filter the options here. Turn it off when they arrive already
   * matched and ordered, so a server's ranking is not overruled.
   */
  filter?: boolean
  /**
   * Score an option against the query yourself: fuzzy matching, a field we do
   * not know about, a weighting of your own. Lower is a better match, and
   * false or nothing drops the option.
   */
  rank?: ComboboxRanker
  /**
   * Offers what was typed as a new option. You add it to options and to the
   * value; this only reports the text.
   */
  onCreate?: (label: string) => void
  createLabel?: (query: string) => React.ReactNode
}

export type ComboboxRanker = (
  option: ComboboxOption,
  query: string
) => number | false | null | undefined

export type ComboboxSingleProps = ComboboxBaseProps & {
  multiple?: false
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  max?: never
}

export type ComboboxMultipleProps = ComboboxBaseProps & {
  multiple: true
  value?: readonly string[]
  defaultValue?: readonly string[]
  onValueChange?: (value: string[]) => void
  /** How many may be chosen. The rest go unavailable once it is reached. */
  max?: number
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps

/**
 * Lower is a better match; Infinity, false, or nothing means no match. It is
 * exported so a ranker of your own can fall back to it rather than reproduce
 * it.
 */
export function rankComboboxOption(option: ComboboxOption, rawQuery: string) {
  const query = rawQuery.trim().toLowerCase()
  const label = option.label.toLowerCase()

  if (label === query) return 0
  if (label.startsWith(query)) return 1
  if (label.includes(query)) return 2
  if (option.group?.toLowerCase().includes(query)) return 3
  if (option.keywords?.some((word) => word.toLowerCase().includes(query)))
    return 4
  if (option.description?.toLowerCase().includes(query)) return 5

  return Number.POSITIVE_INFINITY
}

const defaultEmptyMessage = (query: string) =>
  query ? `Nothing matches “${query}”.` : "No options."

const defaultCreateLabel = (query: string) => `Create “${query}”`

/** The row that offers to make a new option, which is not one of them yet. */
const CREATE = "combobox-create"

type Row = ComboboxOption | typeof CREATE

function toValues(value: string | readonly string[] | undefined) {
  if (value === undefined) return undefined
  if (typeof value === "string") return value === "" ? [] : [value]
  return [...value]
}

type Section = { group?: string; options: ComboboxOption[] }

/** Same-named groups meet under one heading, in the order they first appear. */
function toSections(results: readonly ComboboxOption[]) {
  const sections: Section[] = []
  const named = new Map<string, Section>()

  for (const option of results) {
    if (option.group === undefined) {
      const last = sections[sections.length - 1]
      if (last && last.group === undefined) last.options.push(option)
      else sections.push({ options: [option] })
      continue
    }

    const existing = named.get(option.group)
    if (existing) {
      existing.options.push(option)
      continue
    }

    const section: Section = { group: option.group, options: [option] }
    named.set(option.group, section)
    sections.push(section)
  }

  return sections
}

export function Combobox(props: ComboboxProps) {
  const {
    options,
    label = "Options",
    placeholder = "Search",
    emptyMessage = defaultEmptyMessage,
    disabled = false,
    onQueryChange,
    loading = false,
    loadingMessage = "Searching…",
    filter = true,
    rank = rankComboboxOption,
    onCreate,
    createLabel = defaultCreateLabel,
    className,
    multiple,
    value,
    defaultValue,
    onValueChange,
    max,
    ...rootProps
  } = props

  const id = React.useId()
  const listId = `${id}-list`

  const container = React.useRef<HTMLDivElement>(null)
  const input = React.useRef<HTMLInputElement>(null)

  const controlled = toValues(value)
  const [own, setOwn] = React.useState(() => toValues(defaultValue) ?? [])
  const selected = controlled ?? own

  const selectedLabel = multiple
    ? ""
    : (options.find((option) => option.value === selected[0])?.label ?? "")

  // What was typed, or nothing typed yet. Holding the draft rather than the
  // field's text is what lets a single-value field fall back to the chosen
  // label without an effect writing it there.
  const [draft, setDraft] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(0)
  const [message, setMessage] = React.useState("")

  const text = draft ?? selectedLabel
  const search = draft === null ? "" : draft.trim()

  React.useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (container.current?.contains(event.target as Node)) return

      setOpen(false)
      if (!multiple) setDraft(null)
    }

    document.addEventListener("pointerdown", onPointerDown)

    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open, multiple])

  const results = React.useMemo(() => {
    // Already matched and ordered by whoever fetched them.
    if (!filter || !search) return [...options]

    return options
      .map((option, index) => ({ option, index, score: rank(option, search) }))
      .filter(
        (
          entry
        ): entry is { option: ComboboxOption; index: number; score: number } =>
          typeof entry.score === "number" && Number.isFinite(entry.score)
      )
      .sort((a, b) => a.score - b.score || a.index - b.index)
      .map((entry) => entry.option)
  }, [options, search, filter, rank])

  const full = max !== undefined && selected.length >= max

  const unavailable = (option: ComboboxOption) =>
    option.disabled === true || (full && !selected.includes(option.value))

  const choosable = results.filter((option) => !unavailable(option))

  const creating =
    onCreate !== undefined &&
    search !== "" &&
    !full &&
    !options.some(
      (option) => option.label.toLowerCase() === search.toLowerCase()
    )

  const rows: Row[] = creating ? [...choosable, CREATE] : choosable
  const activeRow = rows[Math.min(active, rows.length - 1)]
  const activeOption = activeRow === CREATE ? undefined : activeRow
  const activeId =
    activeRow === CREATE
      ? `${id}-create`
      : activeRow
        ? `${id}-option-${activeRow.value}`
        : undefined

  function commit(next: string[]) {
    if (controlled === undefined) setOwn(next)
    if (multiple) onValueChange?.(next)
    else onValueChange?.(next[0] ?? "")
  }

  function toggle(option: ComboboxOption) {
    if (unavailable(option)) return

    if (multiple) {
      const dropping = selected.includes(option.value)
      const next = dropping
        ? selected.filter((one) => one !== option.value)
        : [...selected, option.value]

      commit(next)
      setMessage(
        dropping
          ? `${option.label} removed.`
          : next.length === max
            ? `${option.label} added. That is the most you can choose.`
            : `${option.label} added.`
      )
      setDraft(null)
      setActive(0)
    } else {
      commit([option.value])
      setMessage(`${option.label} chosen.`)
      setDraft(null)
      setOpen(false)
    }

    input.current?.focus()
  }

  function create() {
    if (search === "") return

    onCreate?.(search)
    setMessage(`${search} created.`)
    setDraft(null)
    setActive(0)
    input.current?.focus()
  }

  function remove(one: string) {
    const option = options.find((entry) => entry.value === one)

    commit(selected.filter((entry) => entry !== one))
    setMessage(option ? `${option.label} removed.` : "Removed.")
    input.current?.focus()
  }

  function dismiss() {
    setOpen(false)
    if (!multiple) setDraft(null)
  }

  function reveal() {
    if (disabled) return

    const index = choosable.findIndex((option) => option.value === selected[0])
    setActive(multiple || index < 0 ? 0 : index)
    setOpen(true)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault()

      if (open) dismiss()
      else setDraft(null)

      return
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()

      if (!open) {
        reveal()
        return
      }

      const step = event.key === "ArrowDown" ? 1 : -1
      setActive(
        (current) => (current + step + rows.length) % Math.max(1, rows.length)
      )
      return
    }

    if (open && (event.key === "Home" || event.key === "End")) {
      event.preventDefault()
      setActive(event.key === "Home" ? 0 : rows.length - 1)
      return
    }

    if (event.key === "Enter" && open) {
      event.preventDefault()
      if (activeRow === CREATE) create()
      else if (activeRow) toggle(activeRow)
      return
    }

    if (event.key === "Backspace" && multiple && search === "") {
      const last = selected[selected.length - 1]
      if (last !== undefined) {
        event.preventDefault()
        remove(last)
      }
    }
  }

  const chips = multiple
    ? selected
        .map((one) => options.find((option) => option.value === one))
        .filter((option): option is ComboboxOption => option !== undefined)
    : []

  function renderOption(option: ComboboxOption) {
    const blocked = unavailable(option)
    const isSelected = selected.includes(option.value)

    return (
      <li
        key={option.value}
        id={`${id}-option-${option.value}`}
        role="option"
        aria-selected={isSelected}
        aria-disabled={blocked || undefined}
        data-active={option === activeOption || undefined}
        className={cn(
          "flex min-h-11 cursor-pointer items-start gap-2 rounded-md px-2.5 py-2",
          blocked && "cursor-not-allowed opacity-50",
          option === activeOption && "bg-muted"
        )}
        onPointerEnter={() => {
          const index = choosable.indexOf(option)
          if (index >= 0) setActive(index)
        }}
        onClick={() => toggle(option)}
      >
        <Check
          aria-hidden="true"
          size={14}
          className={cn(
            "mt-1 shrink-0",
            isSelected ? "text-primary" : "invisible"
          )}
        />

        <span className="min-w-0 flex-1">
          <span className="text-foreground block text-sm">{option.label}</span>
          {option.description ? (
            <span className="text-muted-foreground mt-0.5 block text-xs leading-snug">
              {option.description}
            </span>
          ) : null}
        </span>
      </li>
    )
  }

  return (
    <div
      ref={container}
      data-slot="combobox"
      className={cn("relative min-w-0", className)}
      onBlur={(event) => {
        if (!container.current?.contains(event.relatedTarget)) dismiss()
      }}
      {...rootProps}
    >
      <div
        data-slot="combobox-field"
        className={cn(
          "border-border bg-card focus-within:ring-ring flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-[calc(var(--radius)+0.15rem)] border px-2 py-1.5 transition-colors duration-150 focus-within:ring-2 motion-reduce:transition-none",
          disabled && "opacity-50"
        )}
        onClick={() => {
          input.current?.focus()
          if (!open) reveal()
        }}
      >
        {chips.map((option) => (
          <span
            key={option.value}
            data-slot="combobox-chip"
            className="bg-muted text-foreground flex items-center gap-1 rounded-md py-0.5 pr-1 pl-2 text-xs"
          >
            {option.label}
            <button
              type="button"
              aria-label={`Remove ${option.label}`}
              disabled={disabled}
              className="text-muted-foreground hover:text-foreground relative flex size-4 items-center justify-center rounded-sm transition-colors duration-150 after:absolute after:-inset-2.5 motion-reduce:transition-none"
              onClick={(event) => {
                event.stopPropagation()
                remove(option.value)
              }}
            >
              <X aria-hidden="true" size={12} />
            </button>
          </span>
        ))}

        <input
          ref={input}
          id={`${id}-input`}
          type="text"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          aria-label={label}
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={open ? activeId : undefined}
          placeholder={chips.length > 0 ? undefined : placeholder}
          value={text}
          className="text-foreground placeholder:text-muted-foreground min-w-24 flex-1 bg-transparent px-1 text-sm outline-none"
          onChange={(event) => {
            setDraft(event.target.value)
            setActive(0)
            setOpen(true)
            onQueryChange?.(event.target.value)
          }}
          onKeyDown={onKeyDown}
        />

        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled}
          className="text-muted-foreground shrink-0 px-1"
          onClick={(event) => {
            event.stopPropagation()
            input.current?.focus()
            if (open) dismiss()
            else reveal()
          }}
        >
          <ChevronsUpDown size={14} />
        </button>
      </div>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          aria-multiselectable={multiple || undefined}
          aria-busy={loading || undefined}
          className="border-border bg-card absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-[calc(var(--radius)+0.15rem)] border p-1 shadow-lg"
          onMouseDown={(event) => event.preventDefault()}
        >
          {loading && results.length === 0 ? (
            <li
              role="presentation"
              className="text-muted-foreground px-2.5 py-2 text-sm"
            >
              {loadingMessage}
            </li>
          ) : results.length === 0 && !creating ? (
            <li
              role="presentation"
              className="text-muted-foreground px-2.5 py-2 text-sm"
            >
              {emptyMessage(search)}
            </li>
          ) : (
            toSections(results).map((section, index) => {
              if (section.group === undefined) {
                return (
                  <React.Fragment key={`loose-${index}`}>
                    {section.options.map(renderOption)}
                  </React.Fragment>
                )
              }

              const headingId = `${id}-group-${index}`

              return (
                <li key={section.group} role="presentation">
                  <div
                    id={headingId}
                    className="text-muted-foreground px-2.5 pt-2 pb-1 text-xs font-medium"
                  >
                    {section.group}
                  </div>
                  <ul role="group" aria-labelledby={headingId}>
                    {section.options.map(renderOption)}
                  </ul>
                </li>
              )
            })
          )}

          {creating ? (
            <li
              id={`${id}-create`}
              role="option"
              aria-selected={false}
              data-active={activeRow === CREATE || undefined}
              className={cn(
                "text-foreground flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm",
                activeRow === CREATE && "bg-muted"
              )}
              onPointerEnter={() => setActive(rows.length - 1)}
              onClick={create}
            >
              <Plus aria-hidden="true" size={14} className="shrink-0" />
              {createLabel(search)}
            </li>
          ) : null}
        </ul>
      ) : null}

      <p role="status" aria-live="polite" className="sr-only">
        {message}
      </p>
    </div>
  )
}
