"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type SortDirection = "asc" | "desc"

export type DataTableSort = { column: string; direction: SortDirection }

export type SortValue = string | number | boolean | Date | null | undefined

export type Column<TRow> = {
  /** Identifies the column, and names the field read when there is no value. */
  key: string
  header: React.ReactNode
  /** What the cell shows. Defaults to the field named by key. */
  cell?: (row: TRow, index: number) => React.ReactNode
  /** What the column is worth when sorted. Defaults to the field named by key. */
  value?: (row: TRow) => SortValue
  /** Any CSS width. Columns without one share what is left over. */
  width?: string
  /** Narrowest this column may be dragged, in pixels. Defaults to 64. */
  minWidth?: number
  /** Widest it may be dragged. Unbounded by default. */
  maxWidth?: number
  align?: "start" | "center" | "end"
  /** Holds the column against the left edge while the rest scrolls past. */
  pinned?: "start"
  /** Lets the cell run onto a second line instead of being cut short. */
  wrap?: boolean
  /** A summary under the column. Given the rows, in the order shown. */
  footer?: React.ReactNode | ((rows: readonly TRow[]) => React.ReactNode)
  /** true for the built-in comparator, or your own. Absent means not sortable. */
  sort?: boolean | ((a: TRow, b: TRow) => number)
  /** Which way the first press sorts. Numbers usually want the largest first. */
  sortFirst?: SortDirection
  /** Excludes one column while the rest stay resizable. */
  resizable?: boolean
  headerClassName?: string
  cellClassName?: string
}

export type DataTableProps<TRow> = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onSelect"
> & {
  rows: readonly TRow[]
  columns: readonly Column<TRow>[]
  /** Identity that survives sorting. Selection is kept in these. */
  getKey: (row: TRow) => string
  /** Names a row, for the checkbox that selects it. */
  getLabel?: (row: TRow) => string
  /** Names the table itself. Becomes its caption. */
  label: string

  sort?: DataTableSort | null
  defaultSort?: DataTableSort
  onSortChange?: (sort: DataTableSort | null) => void

  selected?: readonly string[]
  defaultSelected?: readonly string[]
  onSelectionChange?: (keys: string[]) => void

  /** Lets the reader drag the boundary between two columns. */
  resizable?: boolean
  onColumnResize?: (key: string, width: number) => void

  density?: "comfortable" | "compact"
  striped?: boolean
  stickyHeader?: boolean
  /** Shows placeholder rows shaped like the real ones. */
  loading?: boolean
  /** How many placeholder rows to show. Defaults to 5. */
  loadingRows?: number
  rowClassName?: (row: TRow, index: number) => string | undefined
  /**
   * A convenience for the pointer. It is never the only way to reach whatever
   * it does: put a link or a button in a cell for that.
   */
  onRowClick?: (row: TRow, index: number) => void
  empty?: React.ReactNode
}

const MIN_WIDTH = 64
const KEY_STEP = 16

/** Held back so a fast answer never flashes a skeleton on the way past. */
const LOADING_DELAY_MS = 120

/**
 * The same shades as muted/60 and the rest, mixed against the surface rather
 * than laid over it. A held column is painted over whatever is sliding beneath
 * it, and a background that is only mostly opaque shows both at once.
 */
const SURFACE = {
  head: "bg-[color-mix(in_oklch,var(--muted)_60%,var(--card))]",
  stripe: "even:bg-[color-mix(in_oklch,var(--muted)_40%,var(--card))]",
  hover: "hover:bg-[color-mix(in_oklch,var(--muted)_40%,var(--card))]",
  picked: "bg-[color-mix(in_oklch,var(--primary)_7%,var(--card))]",
  pickedHover: "hover:bg-[color-mix(in_oklch,var(--primary)_12%,var(--card))]",
  foot: "bg-[color-mix(in_oklch,var(--muted)_40%,var(--card))]",
} as const

const ALIGN = {
  start: "text-left",
  center: "text-center",
  end: "text-right tabular-nums",
} as const

function readValue<TRow>(column: Column<TRow>, row: TRow): SortValue {
  if (column.value) return column.value(row)
  return (row as Record<string, unknown>)[column.key] as SortValue
}

function isBlank(value: SortValue) {
  return value === null || value === undefined || value === ""
}

/** Numbers as numbers, dates as dates, and everything else by the locale. */
function compare(a: SortValue, b: SortValue): number {
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === "number" && typeof b === "number") return a - b
  if (typeof a === "boolean" && typeof b === "boolean") {
    return Number(a) - Number(b)
  }

  const left = String(a)
  const right = String(b)
  const leftNumber = Number(left)
  const rightNumber = Number(right)

  if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
    return leftNumber - rightNumber
  }

  return left.localeCompare(right)
}

export function DataTable<TRow>({
  rows,
  columns,
  getKey,
  getLabel,
  label,
  sort,
  defaultSort,
  onSortChange,
  selected,
  defaultSelected,
  onSelectionChange,
  resizable = false,
  onColumnResize,
  density = "comfortable",
  striped = false,
  stickyHeader = false,
  loading = false,
  loadingRows = 5,
  rowClassName,
  onRowClick,
  empty = "Nothing to show.",
  className,
  ...rootProps
}: DataTableProps<TRow>) {
  const reactId = React.useId()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const tableRef = React.useRef<HTMLTableElement>(null)
  const cols = React.useRef<(HTMLTableColElement | null)[]>([])
  const heads = React.useRef<(HTMLTableCellElement | null)[]>([])
  const frozen = React.useRef(false)
  const lastPicked = React.useRef<number | null>(null)
  const [delayPassed, setDelayPassed] = React.useState(false)

  const [uncontrolledSort, setUncontrolledSort] =
    React.useState<DataTableSort | null>(defaultSort ?? null)
  const activeSort = sort !== undefined ? sort : uncontrolledSort

  const [uncontrolledSelection, setUncontrolledSelection] = React.useState<
    string[]
  >([...(defaultSelected ?? [])])
  const selection = selected ? [...selected] : uncontrolledSelection
  const selectable =
    selected !== undefined ||
    defaultSelected !== undefined ||
    onSelectionChange !== undefined

  React.useEffect(() => {
    // Cleared a tick after the data lands rather than during it, so the next
    // load waits its turn again. Nothing is on screen either way, because the
    // placeholders are only shown while loading is still true.
    const timer = window.setTimeout(
      () => setDelayPassed(loading),
      loading ? LOADING_DELAY_MS : 0
    )

    return () => window.clearTimeout(timer)
  }, [loading])

  const skeleton = loading && delayPassed

  const setSort = (next: DataTableSort | null) => {
    if (sort === undefined) setUncontrolledSort(next)
    onSortChange?.(next)
  }

  const setSelection = (next: string[]) => {
    if (selected === undefined) setUncontrolledSelection(next)
    onSelectionChange?.(next)
  }

  const ordered = React.useMemo(() => {
    if (!activeSort) return [...rows]

    const column = columns.find((entry) => entry.key === activeSort.column)
    if (!column?.sort) return [...rows]

    const reverse = activeSort.direction === "desc" ? -1 : 1
    const custom = typeof column.sort === "function" ? column.sort : undefined

    return [...rows].sort((a, b) => {
      if (custom) return custom(a, b) * reverse

      const left = readValue(column, a)
      const right = readValue(column, b)

      // Blanks sit at the bottom whichever way the column is pointing, because
      // a column of empty cells at the top is never what was being asked for.
      const leftBlank = isBlank(left)
      const rightBlank = isBlank(right)
      if (leftBlank && rightBlank) return 0
      if (leftBlank) return 1
      if (rightBlank) return -1

      return compare(left, right) * reverse
    })
  }, [activeSort, columns, rows])

  const keys = ordered.map(getKey)
  const chosen = new Set(selection)
  const picked = keys.filter((key) => chosen.has(key))
  const allPicked = keys.length > 0 && picked.length === keys.length
  const somePicked = picked.length > 0 && !allPicked

  const headerCheckbox = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (headerCheckbox.current)
      headerCheckbox.current.indeterminate = somePicked
  })

  const cycle = (column: Column<TRow>) => {
    if (!column.sort) return

    const first = column.sortFirst ?? "asc"

    if (activeSort?.column !== column.key) {
      setSort({ column: column.key, direction: first })
      return
    }

    // Third press returns the rows to the order they arrived in.
    setSort(
      activeSort.direction === first
        ? { column: column.key, direction: first === "asc" ? "desc" : "asc" }
        : null
    )
  }

  const toggleRow = (index: number, key: string, range: boolean) => {
    const next = new Set(selection)

    if (range && lastPicked.current !== null) {
      const [from, to] = [lastPicked.current, index].sort((a, b) => a - b)
      const shouldSelect = !chosen.has(key)

      for (let at = from!; at <= to!; at += 1) {
        const rowKey = keys[at]
        if (rowKey === undefined) continue
        if (shouldSelect) next.add(rowKey)
        else next.delete(rowKey)
      }
    } else if (chosen.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }

    lastPicked.current = index
    setSelection([...next])
  }

  /**
   * Every column is pinned to the width it currently has before the first drag,
   * so pulling one boundary does not make every other column jump.
   */
  const freezeWidths = () => {
    if (frozen.current) return
    for (const col of cols.current) {
      if (col) col.style.width = `${col.getBoundingClientRect().width}px`
    }
    frozen.current = true
  }

  const resizeTo = (index: number, width: number, column: Column<TRow>) => {
    const col = cols.current[index]
    if (!col) return

    let next = Math.max(column.minWidth ?? MIN_WIDTH, Math.round(width))
    if (column.maxWidth !== undefined) next = Math.min(column.maxWidth, next)

    col.style.width = `${next}px`
    syncPins()
    return next
  }

  const cellPadding = density === "compact" ? "px-3 py-1.5" : "px-3 py-2.5"
  const offset = selectable ? 1 : 0

  // Visual positions of the held columns. The checkbox is held too whenever
  // anything else is, since a column of checkboxes that scrolls away from its
  // rows is worse than none.
  const pinned = React.useMemo(() => {
    const held = columns
      .map((column, index) => (column.pinned === "start" ? index + offset : -1))
      .filter((index) => index >= 0)

    if (held.length === 0) return []
    return selectable ? [0, ...held] : held
  }, [columns, offset, selectable])

  const lastPinned = pinned[pinned.length - 1]
  const pinKey = pinned.join()

  /**
   * Writes each held column's distance from the left edge as a custom
   * property, so the offsets follow a drag without anything re-rendering.
   */
  const syncPins = React.useCallback(() => {
    const root = rootRef.current
    if (!root || pinKey === "") return

    let left = 0
    for (const index of pinKey.split(",").map(Number)) {
      root.style.setProperty(`--pin-${index}`, `${left}px`)
      left += heads.current[index]?.getBoundingClientRect().width ?? 0
    }
  }, [pinKey])

  React.useLayoutEffect(() => {
    syncPins()

    const table = tableRef.current
    if (!table || pinKey === "") return

    const observer = new ResizeObserver(syncPins)
    observer.observe(table)
    return () => observer.disconnect()
  }, [pinKey, syncPins])

  const pinStyle = (index: number): React.CSSProperties | undefined =>
    pinned.includes(index) ? { left: `var(--pin-${index})` } : undefined

  const pinClass = (index: number, layer: string) =>
    pinned.includes(index) &&
    cn("sticky", layer, index === lastPinned && "border-border border-r")

  return (
    <div
      ref={rootRef}
      data-slot="data-table"
      className={cn(
        "border-border bg-card text-card-foreground relative overflow-auto rounded-[var(--radius)] border",
        className
      )}
      {...rootProps}
    >
      <table
        ref={tableRef}
        aria-busy={loading || undefined}
        className="w-full table-fixed border-collapse text-sm"
      >
        <caption className="sr-only">{label}</caption>

        <colgroup>
          {selectable && (
            <col
              ref={(node) => {
                cols.current[0] = node
              }}
              style={{ width: "2.75rem" }}
            />
          )}
          {columns.map((column, index) => (
            <col
              key={column.key}
              ref={(node) => {
                cols.current[index + offset] = node
              }}
              style={column.width ? { width: column.width } : undefined}
            />
          ))}
        </colgroup>

        <thead
          className={cn(SURFACE.head, stickyHeader && "sticky top-0 z-20")}
        >
          <tr>
            {selectable && (
              <th
                scope="col"
                ref={(node) => {
                  heads.current[0] = node
                }}
                style={pinStyle(0)}
                className={cn(
                  "border-border border-b px-3",
                  SURFACE.head,
                  pinClass(0, "z-30")
                )}
              >
                <input
                  ref={headerCheckbox}
                  type="checkbox"
                  className="accent-primary focus-visible:ring-ring size-4 align-middle focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  checked={allPicked}
                  aria-label={
                    allPicked
                      ? `Clear all ${keys.length} rows`
                      : `Select all ${keys.length} rows`
                  }
                  onChange={() => {
                    lastPicked.current = null
                    setSelection(allPicked ? [] : keys)
                  }}
                />
              </th>
            )}

            {columns.map((column, index) => {
              const active = activeSort?.column === column.key
              const direction = active ? activeSort.direction : undefined
              const Icon =
                direction === "asc"
                  ? ArrowUp
                  : direction === "desc"
                    ? ArrowDown
                    : ChevronsUpDown

              // Boundaries between columns, so no handle on the last one:
              // there is nothing to its right to trade width with, and it
              // would sit on the container's own edge.
              const canResize =
                resizable &&
                column.resizable !== false &&
                index < columns.length - 1
              const at = index + offset

              return (
                <th
                  key={column.key}
                  scope="col"
                  ref={(node) => {
                    heads.current[at] = node
                  }}
                  style={pinStyle(at)}
                  aria-sort={
                    !column.sort
                      ? undefined
                      : active
                        ? direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                  }
                  className={cn(
                    "border-border text-muted-foreground relative border-b p-0 text-xs font-semibold",
                    SURFACE.head,
                    pinClass(at, "z-30"),
                    column.headerClassName
                  )}
                >
                  {column.sort ? (
                    <button
                      type="button"
                      onClick={() => cycle(column)}
                      className={cn(
                        "group focus-visible:ring-ring hover:text-foreground flex min-h-11 w-full items-center gap-1.5 px-3 transition-colors duration-150 focus-visible:ring-2 focus-visible:-outline-offset-2 focus-visible:outline-none motion-reduce:transition-none",
                        column.align === "end" && "justify-end",
                        column.align === "center" && "justify-center"
                      )}
                    >
                      <span className="truncate">{column.header}</span>
                      <Icon
                        aria-hidden="true"
                        size={13}
                        className={cn(
                          "shrink-0 transition-opacity duration-150 motion-reduce:transition-none",
                          active
                            ? "text-foreground opacity-100"
                            : "opacity-0 group-hover:opacity-40 group-focus-visible:opacity-40"
                        )}
                      />
                    </button>
                  ) : (
                    <div
                      className={cn(
                        "flex min-h-11 items-center px-3",
                        ALIGN[column.align ?? "start"],
                        column.align === "end" && "justify-end",
                        column.align === "center" && "justify-center"
                      )}
                    >
                      <span className="truncate">{column.header}</span>
                    </div>
                  )}

                  {canResize && (
                    <span
                      role="separator"
                      tabIndex={0}
                      aria-orientation="vertical"
                      aria-label={`Resize column ${column.key}`}
                      data-slot="data-table-resizer"
                      className="group/resize absolute inset-y-0 right-0 z-10 flex w-px cursor-col-resize touch-none justify-center focus-visible:outline-none"
                      onDoubleClick={() => {
                        const col = cols.current[at]
                        if (!col) return
                        col.style.width = column.width ?? ""
                        frozen.current = false
                      }}
                      onPointerDown={(event) => {
                        if (event.button !== 0) return
                        event.preventDefault()
                        event.currentTarget.setPointerCapture(event.pointerId)
                        freezeWidths()

                        const col = cols.current[at]
                        const startX = event.clientX
                        const startWidth =
                          col?.getBoundingClientRect().width ?? 0

                        const move = (moveEvent: PointerEvent) => {
                          resizeTo(
                            at,
                            startWidth + (moveEvent.clientX - startX),
                            column
                          )
                        }

                        const done = () => {
                          window.removeEventListener("pointermove", move)
                          window.removeEventListener("pointerup", done)
                          const width =
                            cols.current[at]?.getBoundingClientRect().width
                          if (width) onColumnResize?.(column.key, width)
                        }

                        window.addEventListener("pointermove", move)
                        window.addEventListener("pointerup", done)
                      }}
                      onKeyDown={(event) => {
                        const step =
                          event.key === "ArrowLeft"
                            ? -KEY_STEP
                            : event.key === "ArrowRight"
                              ? KEY_STEP
                              : 0

                        if (step === 0) return
                        event.preventDefault()
                        freezeWidths()

                        const current =
                          cols.current[at]?.getBoundingClientRect().width ?? 0
                        const width = resizeTo(at, current + step, column)
                        if (width) onColumnResize?.(column.key, width)
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="bg-border group-hover/resize:bg-ring group-focus-visible/resize:bg-ring absolute inset-y-1 w-px transition-colors duration-150 motion-reduce:transition-none"
                      />
                      {/* A one pixel line cannot be hit, so the target is wider
                          than the line it moves. */}
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 -right-2 -left-2"
                      />
                    </span>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody>
          {skeleton ? (
            // Shaped like the rows it stands in for, and the same height, so
            // nothing shifts underneath the reader when the data lands.
            Array.from({ length: Math.max(1, loadingRows) }, (_, row) => (
              <tr
                key={`placeholder-${row}`}
                className="border-border/60 border-b last:border-0"
              >
                {selectable && (
                  <td className={cellPadding}>
                    <span className="bg-muted block size-4 animate-pulse rounded-sm motion-reduce:animate-none" />
                  </td>
                )}
                {columns.map((column, index) => (
                  <td
                    key={column.key}
                    className={cn(cellPadding, column.cellClassName)}
                  >
                    <span
                      className={cn(
                        "bg-muted block h-4 animate-pulse rounded-sm motion-reduce:animate-none",
                        column.align === "end" && "ml-auto"
                      )}
                      style={{
                        width: `${58 + ((row * 7 + index * 13) % 34)}%`,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : ordered.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + offset}
                className="text-muted-foreground px-4 py-8 text-sm"
              >
                {empty}
              </td>
            </tr>
          ) : (
            ordered.map((row, index) => {
              const key = keys[index]!
              const isPicked = chosen.has(key)

              return (
                <tr
                  key={key}
                  data-selected={isPicked ? "" : undefined}
                  onClick={
                    onRowClick ? () => onRowClick(row, index) : undefined
                  }
                  className={cn(
                    "border-border/60 bg-card border-b transition-colors duration-100 last:border-0 motion-reduce:transition-none",
                    striped && SURFACE.stripe,
                    (onRowClick || selectable) && SURFACE.hover,
                    onRowClick && "cursor-pointer",
                    isPicked && [
                      SURFACE.picked,
                      SURFACE.pickedHover,
                      "shadow-[inset_2px_0_0_var(--primary)]",
                    ],
                    rowClassName?.(row, index)
                  )}
                >
                  {selectable && (
                    <td
                      style={pinStyle(0)}
                      className={cn(
                        cellPadding,
                        "align-middle",
                        pinned.includes(0) && "bg-inherit",
                        pinClass(0, "z-10")
                      )}
                    >
                      <input
                        type="checkbox"
                        className="accent-primary focus-visible:ring-ring size-4 align-middle focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                        checked={isPicked}
                        aria-label={`Select ${getLabel?.(row) ?? `row ${index + 1}`}`}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          toggleRow(
                            index,
                            key,
                            (event.nativeEvent as PointerEvent).shiftKey
                          )
                        }
                      />
                    </td>
                  )}

                  {columns.map((column, position) => (
                    <td
                      key={column.key}
                      style={pinStyle(position + offset)}
                      className={cn(
                        cellPadding,
                        "align-middle",
                        ALIGN[column.align ?? "start"],
                        pinned.includes(position + offset) && "bg-inherit",
                        pinClass(position + offset, "z-10"),
                        column.cellClassName
                      )}
                    >
                      <div
                        className={
                          column.wrap
                            ? "break-words whitespace-normal"
                            : "truncate"
                        }
                      >
                        {column.cell
                          ? column.cell(row, index)
                          : String(
                              (row as Record<string, unknown>)[column.key] ?? ""
                            )}
                      </div>
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>

        {columns.some((column) => column.footer !== undefined) && (
          <tfoot className={SURFACE.foot}>
            <tr>
              {selectable && (
                <td
                  style={pinStyle(0)}
                  className={cn(
                    "border-border border-t",
                    SURFACE.foot,
                    cellPadding,
                    pinClass(0, "z-10")
                  )}
                />
              )}
              {columns.map((column, position) => (
                <td
                  key={column.key}
                  style={pinStyle(position + offset)}
                  className={cn(
                    "border-border border-t text-xs font-semibold",
                    SURFACE.foot,
                    cellPadding,
                    ALIGN[column.align ?? "start"],
                    pinClass(position + offset, "z-10")
                  )}
                >
                  {skeleton ? (
                    // A total drawn from rows that are still arriving would be
                    // the previous answer sitting over the new one.
                    <span
                      className={cn(
                        "bg-muted block h-3 w-12 animate-pulse rounded-sm motion-reduce:animate-none",
                        column.align === "end" && "ml-auto"
                      )}
                    />
                  ) : typeof column.footer === "function" ? (
                    column.footer(ordered)
                  ) : (
                    column.footer
                  )}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>

      {selectable && (
        <span
          className="sr-only"
          role="status"
          aria-live="polite"
          id={`${reactId}-selection`}
        >
          {picked.length} of {keys.length} selected
        </span>
      )}
    </div>
  )
}
