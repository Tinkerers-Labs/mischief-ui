"use client"

import * as React from "react"
import { Check, FileDiff, X } from "lucide-react"

import { cn } from "@/lib/utils"

export type DiffLineKind = "context" | "add" | "remove"

export type DiffLine = {
  kind: DiffLineKind
  text: string
  beforeNumber?: number
  afterNumber?: number
}

export type DiffHunk = {
  header?: string
  lines: readonly DiffLine[]
}

export type DiffViewProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  before?: string
  after?: string
  /** Precomputed hunks. Supplied hunks win over before and after. */
  hunks?: readonly DiffHunk[]
  filename?: string
  view?: "unified" | "split"
  /** Unchanged lines kept either side of a change. Defaults to 3. */
  context?: number
  showLineNumbers?: boolean
  onAccept?: () => void
  onReject?: () => void
  acceptLabel?: string
  rejectLabel?: string
  status?: "pending" | "accepted" | "rejected"
}

/**
 * Past this many cells the quadratic table costs more than the result is
 * worth, so the two sides are reported as one wholesale replacement instead.
 */
const MAX_CELLS = 2_000_000

function splitLines(value: string) {
  return value === "" ? [] : value.replace(/\n$/, "").split("\n")
}

/**
 * A line-level diff. Common prefixes and suffixes are peeled off first, which
 * is what keeps an edit to one line of a long file cheap, and the remaining
 * middles go through a longest-common-subsequence table.
 */
export function diffLines(before: string, after: string): DiffLine[] {
  const left = splitLines(before)
  const right = splitLines(after)

  let head = 0
  while (
    head < left.length &&
    head < right.length &&
    left[head] === right[head]
  ) {
    head++
  }

  let tail = 0
  while (
    tail < left.length - head &&
    tail < right.length - head &&
    left[left.length - 1 - tail] === right[right.length - 1 - tail]
  ) {
    tail++
  }

  const leftMiddle = left.slice(head, left.length - tail)
  const rightMiddle = right.slice(head, right.length - tail)

  const lines: DiffLine[] = []
  let beforeNumber = 1
  let afterNumber = 1

  for (let i = 0; i < head; i++) {
    lines.push({
      kind: "context",
      text: left[i]!,
      beforeNumber: beforeNumber++,
      afterNumber: afterNumber++,
    })
  }

  const middle =
    leftMiddle.length * rightMiddle.length > MAX_CELLS
      ? [
          ...leftMiddle.map((text) => ({ kind: "remove" as const, text })),
          ...rightMiddle.map((text) => ({ kind: "add" as const, text })),
        ]
      : commonSubsequenceDiff(leftMiddle, rightMiddle)

  for (const line of middle) {
    lines.push({
      ...line,
      beforeNumber: line.kind === "add" ? undefined : beforeNumber++,
      afterNumber: line.kind === "remove" ? undefined : afterNumber++,
    })
  }

  for (let i = left.length - tail; i < left.length; i++) {
    lines.push({
      kind: "context",
      text: left[i]!,
      beforeNumber: beforeNumber++,
      afterNumber: afterNumber++,
    })
  }

  return lines
}

function commonSubsequenceDiff(
  left: readonly string[],
  right: readonly string[]
) {
  const rows = left.length
  const columns = right.length
  const table: number[][] = Array.from({ length: rows + 1 }, () =>
    new Array<number>(columns + 1).fill(0)
  )

  for (let i = rows - 1; i >= 0; i--) {
    for (let j = columns - 1; j >= 0; j--) {
      table[i]![j] =
        left[i] === right[j]
          ? table[i + 1]![j + 1]! + 1
          : Math.max(table[i + 1]![j]!, table[i]![j + 1]!)
    }
  }

  const lines: { kind: DiffLineKind; text: string }[] = []
  let i = 0
  let j = 0

  while (i < rows && j < columns) {
    if (left[i] === right[j]) {
      lines.push({ kind: "context", text: left[i]! })
      i++
      j++
    } else if (table[i + 1]![j]! >= table[i]![j + 1]!) {
      lines.push({ kind: "remove", text: left[i]! })
      i++
    } else {
      lines.push({ kind: "add", text: right[j]! })
      j++
    }
  }

  while (i < rows) lines.push({ kind: "remove", text: left[i++]! })
  while (j < columns) lines.push({ kind: "add", text: right[j++]! })

  return lines
}

/** Drops runs of unchanged lines longer than twice the context window. */
export function toHunks(
  lines: readonly DiffLine[],
  context: number
): DiffHunk[] {
  const changed = lines
    .map((line, index) => (line.kind === "context" ? -1 : index))
    .filter((index) => index >= 0)

  if (changed.length === 0) return []

  const ranges: [number, number][] = []

  for (const index of changed) {
    const start = Math.max(0, index - context)
    const end = Math.min(lines.length - 1, index + context)
    const last = ranges[ranges.length - 1]

    if (last && start <= last[1] + 1) last[1] = Math.max(last[1], end)
    else ranges.push([start, end])
  }

  return ranges.map(([start, end]) => {
    const slice = lines.slice(start, end + 1)
    const first = slice[0]!

    return {
      header: `@@ -${first.beforeNumber ?? 1} +${first.afterNumber ?? 1} @@`,
      lines: slice,
    }
  })
}

type Row = { left?: DiffLine; right?: DiffLine }

/** Pairs each removal with the addition that replaced it, for the split view. */
function toRows(lines: readonly DiffLine[]): Row[] {
  const rows: Row[] = []
  let removed: DiffLine[] = []

  const flush = () => {
    for (const line of removed) rows.push({ left: line })
    removed = []
  }

  for (const line of lines) {
    if (line.kind === "remove") {
      removed.push(line)
    } else if (line.kind === "add") {
      rows.push({ left: removed.shift(), right: line })
    } else {
      flush()
      rows.push({ left: line, right: line })
    }
  }

  flush()

  return rows
}

const tone: Record<DiffLineKind, string> = {
  add: "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)]",
  remove: "bg-[color-mix(in_oklab,var(--destructive)_14%,transparent)]",
  context: "",
}

const sign: Record<DiffLineKind, string> = {
  add: "+",
  remove: "-",
  context: " ",
}

export function DiffView({
  before = "",
  after = "",
  hunks,
  filename,
  view = "unified",
  context = 3,
  showLineNumbers = true,
  onAccept,
  onReject,
  acceptLabel = "Accept",
  rejectLabel = "Reject",
  status = "pending",
  className,
  ...rootProps
}: DiffViewProps) {
  const resolved = React.useMemo(
    () => hunks ?? toHunks(diffLines(before, after), context),
    [hunks, before, after, context]
  )

  const counts = React.useMemo(() => {
    let added = 0
    let removed = 0

    for (const hunk of resolved) {
      for (const line of hunk.lines) {
        if (line.kind === "add") added++
        if (line.kind === "remove") removed++
      }
    }

    return { added, removed }
  }, [resolved])

  const gutter = React.useMemo(() => {
    const highest = resolved.flatMap((hunk) =>
      hunk.lines.map((line) =>
        Math.max(line.beforeNumber ?? 0, line.afterNumber ?? 0)
      )
    )

    return String(Math.max(1, ...highest)).length
  }, [resolved])

  const decided = status !== "pending"

  return (
    <div
      data-slot="diff-view"
      data-status={status}
      className={cn(
        "border-border bg-muted/40 min-w-0 overflow-hidden rounded-[calc(var(--radius)+0.15rem)] border",
        className
      )}
      {...rootProps}
    >
      <div
        data-slot="diff-view-bar"
        className="border-border flex items-center gap-2 border-b px-3 py-1.5"
      >
        <FileDiff
          aria-hidden="true"
          size={13}
          className="text-muted-foreground shrink-0"
        />
        <span className="text-foreground min-w-0 truncate font-[family-name:var(--font-mono),monospace] text-xs">
          {filename ?? "Proposed change"}
        </span>

        <span className="ml-auto shrink-0 font-[family-name:var(--font-mono),monospace] text-[0.6875rem]">
          <span className="text-[color-mix(in_oklab,var(--accent)_75%,var(--foreground))]">
            +{counts.added}
          </span>{" "}
          <span className="text-destructive">-{counts.removed}</span>
        </span>
      </div>

      {resolved.length === 0 ? (
        <p className="text-muted-foreground px-3 py-4 text-xs">No changes.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-[family-name:var(--font-mono),monospace] text-xs leading-relaxed">
            <caption className="sr-only">
              {filename ? `Changes to ${filename}` : "Proposed change"}:{" "}
              {counts.added} added, {counts.removed} removed
            </caption>
            <tbody>
              {resolved.map((hunk, hunkIndex) => (
                <React.Fragment key={hunkIndex}>
                  {hunk.header ? (
                    <tr>
                      <td
                        colSpan={view === "split" ? 4 : 2}
                        className="border-border text-muted-foreground bg-muted/60 border-y px-3 py-1 text-[0.6875rem]"
                      >
                        {hunk.header}
                      </td>
                    </tr>
                  ) : null}

                  {view === "split"
                    ? toRows(hunk.lines).map((row, index) => (
                        <tr key={index}>
                          <Side
                            line={row.left}
                            side="before"
                            gutter={gutter}
                            numbered={showLineNumbers}
                          />
                          <Side
                            line={row.right}
                            side="after"
                            gutter={gutter}
                            numbered={showLineNumbers}
                          />
                        </tr>
                      ))
                    : hunk.lines.map((line, index) => (
                        <tr key={index} className={tone[line.kind]}>
                          {showLineNumbers ? (
                            <td
                              aria-hidden="true"
                              className="text-muted-foreground/60 w-px pl-3 text-right align-top tabular-nums select-none"
                              style={{ minWidth: `${gutter}ch` }}
                            >
                              {line.afterNumber ?? line.beforeNumber}
                            </td>
                          ) : null}
                          <td className="w-full px-3 align-top">
                            <span
                              aria-hidden="true"
                              className="text-muted-foreground/70 select-none"
                            >
                              {sign[line.kind]}{" "}
                            </span>
                            <span className="break-words whitespace-pre-wrap">
                              {line.text === "" ? " " : line.text}
                            </span>
                          </td>
                        </tr>
                      ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {onAccept || onReject ? (
        <div
          data-slot="diff-view-decision"
          className="border-border flex items-center gap-2 border-t px-3 py-2"
        >
          {decided ? (
            <p className="text-muted-foreground text-xs" role="status">
              {status === "accepted" ? "Change accepted." : "Change rejected."}
            </p>
          ) : (
            <>
              {onReject ? (
                <button
                  type="button"
                  className="border-border text-muted-foreground hover:text-foreground hover:bg-card min-h-8 rounded-md border px-3 text-xs transition-colors duration-150 motion-reduce:transition-none"
                  onClick={onReject}
                >
                  <X aria-hidden="true" size={12} className="mr-1 inline" />
                  {rejectLabel}
                </button>
              ) : null}
              {onAccept ? (
                <button
                  type="button"
                  className="bg-primary text-primary-foreground min-h-8 rounded-md px-3 text-xs transition-opacity duration-150 hover:opacity-90 motion-reduce:transition-none"
                  onClick={onAccept}
                >
                  <Check aria-hidden="true" size={12} className="mr-1 inline" />
                  {acceptLabel}
                </button>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}

function Side({
  line,
  side,
  gutter,
  numbered,
}: {
  line?: DiffLine
  side: "before" | "after"
  gutter: number
  numbered: boolean
}) {
  const number = side === "before" ? line?.beforeNumber : line?.afterNumber

  return (
    <>
      {numbered ? (
        <td
          aria-hidden="true"
          className={cn(
            "text-muted-foreground/60 w-px pl-3 text-right align-top tabular-nums select-none",
            line && tone[line.kind]
          )}
          style={{ minWidth: `${gutter}ch` }}
        >
          {number}
        </td>
      ) : null}
      <td
        className={cn(
          "w-1/2 px-3 align-top",
          line ? tone[line.kind] : "bg-muted/30"
        )}
      >
        {line ? (
          <span className="break-words whitespace-pre-wrap">
            {line.text === "" ? " " : line.text}
          </span>
        ) : null}
      </td>
    </>
  )
}
