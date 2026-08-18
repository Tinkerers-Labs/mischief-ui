"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

export type CsvTable = {
  fields: string[]
  rows: string[][]
}

export type CsvParser = (source: string | File) => Promise<CsvTable>

export type CsvViewerProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> & {
  source?: string | File
  table?: CsvTable
  parser?: CsvParser
  maxRows?: number
  label?: string
  emptyLabel?: React.ReactNode
  loadingLabel?: React.ReactNode
}

type Sort = { column: number; direction: "asc" | "desc" } | null

/** Hold the loading state back so a fast result never flashes it. */
const LOADING_DELAY_MS = 120

const MISSING_PAPAPARSE =
  'CsvViewer needs the "papaparse" package, or a `parser` prop that returns { fields, rows }.'

async function parseWithPapa(source: string | File): Promise<CsvTable> {
  let Papa: typeof import("papaparse")

  try {
    Papa = await import("papaparse")
  } catch {
    throw new Error(MISSING_PAPAPARSE)
  }

  // Bundlers disagree on whether this module arrives namespaced or default.
  const parse = (Papa as { default?: typeof Papa }).default ?? Papa

  return new Promise((resolve, reject) => {
    parse.parse<string[]>(source as string, {
      skipEmptyLines: true,
      complete: (result: { data: string[][] }) => {
        const [header = [], ...rows] = result.data
        resolve({ fields: header, rows })
      },
      error: reject,
    })
  })
}

function compare(a: string, b: string) {
  const left = Number(a)
  const right = Number(b)

  if (!Number.isNaN(left) && !Number.isNaN(right) && a !== "" && b !== "") {
    return left - right
  }

  return a.localeCompare(b)
}

export function CsvViewer({
  source,
  table,
  parser = parseWithPapa,
  maxRows = 200,
  label = "CSV contents",
  emptyLabel = "This file has no rows.",
  loadingLabel = "Reading the file…",
  className,
  ...rootProps
}: CsvViewerProps) {
  const [fetched, setFetched] = React.useState<CsvTable | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [sort, setSort] = React.useState<Sort>(null)

  const parsed = table ?? fetched

  React.useEffect(() => {
    if (table || source == null) return

    const controller = new AbortController()
    const spinner = window.setTimeout(() => setLoading(true), LOADING_DELAY_MS)

    void parser(source)
      .then((result) => {
        if (controller.signal.aborted) return
        setFetched(result)
        setError(null)
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setError(cause instanceof Error ? cause.message : String(cause))
      })
      .finally(() => {
        window.clearTimeout(spinner)
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => {
      controller.abort()
      window.clearTimeout(spinner)
    }
  }, [source, table, parser])

  const sorted = React.useMemo(() => {
    if (!parsed) return null
    if (!sort) return parsed.rows

    const factor = sort.direction === "asc" ? 1 : -1

    return [...parsed.rows].sort(
      (a, b) => compare(a[sort.column] ?? "", b[sort.column] ?? "") * factor
    )
  }, [parsed, sort])

  const visible = sorted?.slice(0, maxRows) ?? []
  const hidden = (sorted?.length ?? 0) - visible.length

  if (error) {
    return (
      <section
        data-slot="csv-viewer"
        data-state="error"
        className={cn(
          "border-border bg-card text-destructive flex items-center gap-2 rounded-[var(--radius)] border px-4 py-3 text-sm",
          className
        )}
        {...rootProps}
      >
        <TriangleAlert aria-hidden="true" size={15} className="shrink-0" />
        <p role="alert">{error}</p>
      </section>
    )
  }

  return (
    <section
      data-slot="csv-viewer"
      data-state={loading ? "loading" : "ready"}
      className={cn(
        "border-border bg-card text-card-foreground overflow-hidden rounded-[var(--radius)] border",
        className
      )}
      {...rootProps}
    >
      {loading && !parsed ? (
        <p className="text-muted-foreground px-4 py-6 text-sm">
          {loadingLabel}
        </p>
      ) : null}

      {parsed && parsed.rows.length === 0 ? (
        <p className="text-muted-foreground px-4 py-6 text-sm">{emptyLabel}</p>
      ) : null}

      {parsed && parsed.rows.length > 0 ? (
        <>
          <div className="max-h-[26rem] overflow-auto">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">{label}</caption>
              <thead className="bg-muted sticky top-0 z-10">
                <tr>
                  {parsed.fields.map((field, index) => {
                    const active = sort?.column === index
                    const direction = active ? sort.direction : undefined
                    const Icon = direction === "desc" ? ArrowDown : ArrowUp

                    return (
                      <th
                        key={`${field}-${index}`}
                        scope="col"
                        aria-sort={
                          active
                            ? direction === "asc"
                              ? "ascending"
                              : "descending"
                            : "none"
                        }
                        className="border-border border-b p-0 text-left font-semibold"
                      >
                        <button
                          type="button"
                          className="focus-visible:ring-ring hover:bg-background/60 flex min-h-11 w-full items-center gap-1.5 px-3 text-left transition-colors duration-150 focus-visible:ring-2 focus-visible:-outline-offset-2 focus-visible:outline-none motion-reduce:transition-none"
                          onClick={() =>
                            setSort(
                              active && direction === "asc"
                                ? { column: index, direction: "desc" }
                                : { column: index, direction: "asc" }
                            )
                          }
                        >
                          <span className="truncate">{field}</span>
                          {active ? (
                            <Icon
                              aria-hidden="true"
                              size={13}
                              className="text-muted-foreground shrink-0"
                            />
                          ) : null}
                        </button>
                      </th>
                    )
                  })}
                </tr>
              </thead>

              <tbody>
                {visible.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-border hover:bg-muted/40 border-b transition-colors duration-150 last:border-b-0 motion-reduce:transition-none"
                  >
                    {parsed.fields.map((_, columnIndex) => (
                      <td
                        key={columnIndex}
                        className="max-w-[18rem] truncate px-3 py-2"
                      >
                        {row[columnIndex] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p
            data-slot="csv-viewer-summary"
            className="text-muted-foreground border-border border-t px-3 py-2 text-xs"
          >
            {hidden > 0
              ? `Showing ${visible.length} of ${sorted?.length} rows`
              : `${visible.length} ${visible.length === 1 ? "row" : "rows"}`}
          </p>
        </>
      ) : null}
    </section>
  )
}
