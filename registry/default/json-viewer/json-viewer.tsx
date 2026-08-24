"use client"

import * as React from "react"
import { Check, ChevronRight, Clipboard } from "lucide-react"

import { cn } from "@/lib/utils"

export type JsonViewerProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  value: unknown
  rootName?: string
  defaultExpandedDepth?: number
  maxStringLength?: number
  copyable?: boolean
  label?: string
}

type Kind =
  "object" | "array" | "string" | "number" | "boolean" | "null" | "other"

type Row = {
  path: string
  key: string | null
  value: unknown
  kind: Kind
  level: number
  branch: boolean
  expanded: boolean
  index: number | null
}

function kindOf(value: unknown): Kind {
  if (value === null) return "null"
  if (Array.isArray(value)) return "array"

  switch (typeof value) {
    case "object":
      return "object"
    case "string":
      return "string"
    case "number":
      return "number"
    case "boolean":
      return "boolean"
    default:
      return "other"
  }
}

function entriesOf(value: unknown): [string, unknown][] {
  if (Array.isArray(value)) {
    return value.map((entry, index) => [String(index), entry])
  }

  return Object.entries(value as Record<string, unknown>)
}

function size(value: unknown) {
  return Array.isArray(value)
    ? value.length
    : Object.keys(value as Record<string, unknown>).length
}

/** What a collapsed branch says about itself, without unfolding it. */
function summarise(value: unknown, kind: Kind) {
  const count = size(value)
  const noun = count === 1 ? "item" : "items"

  return kind === "array" ? `[ ${count} ${noun} ]` : `{ ${count} ${noun} }`
}

/**
 * A JSON path in the notation somebody would paste back into code, so the copy
 * is worth taking: `data.rows[0].name` rather than a list of segments.
 */
function joinPath(parent: string, key: string, inArray: boolean) {
  if (inArray) return `${parent}[${key}]`
  return /^[A-Za-z_$][\w$]*$/.test(key)
    ? `${parent}.${key}`
    : `${parent}[${JSON.stringify(key)}]`
}

function flatten(
  value: unknown,
  expanded: Set<string>,
  rootName: string
): Row[] {
  const walk = (
    node: unknown,
    key: string | null,
    path: string,
    level: number,
    index: number | null
  ): Row[] => {
    const kind = kindOf(node)
    const branch = (kind === "object" || kind === "array") && size(node) > 0
    const open = branch && expanded.has(path)
    const self: Row = {
      path,
      key,
      value: node,
      kind,
      level,
      branch,
      expanded: open,
      index,
    }

    if (!open) return [self]

    const inArray = kind === "array"

    return [
      self,
      ...entriesOf(node).flatMap(([childKey, child], at) =>
        walk(
          child,
          childKey,
          joinPath(path, childKey, inArray),
          level + 1,
          inArray ? at : null
        )
      ),
    ]
  }

  return walk(value, null, rootName, 1, null)
}

/** Every path down to the requested depth, so the first view is not one line. */
function pathsToDepth(value: unknown, rootName: string, depth: number) {
  const open = new Set<string>()

  const walk = (node: unknown, path: string, level: number) => {
    const kind = kindOf(node)
    if (kind !== "object" && kind !== "array") return
    if (size(node) === 0 || level > depth) return

    open.add(path)

    const inArray = kind === "array"
    for (const [key, child] of entriesOf(node)) {
      walk(child, joinPath(path, key, inArray), level + 1)
    }
  }

  walk(value, rootName, 1)

  return open
}

const VALUE_CLASS: Record<Kind, string> = {
  string: "text-emerald-600 dark:text-emerald-400",
  number: "text-sky-600 dark:text-sky-400",
  boolean: "text-violet-600 dark:text-violet-400",
  null: "text-muted-foreground",
  other: "text-muted-foreground",
  object: "text-muted-foreground",
  array: "text-muted-foreground",
}

export function JsonViewer({
  value,
  rootName = "root",
  defaultExpandedDepth = 1,
  maxStringLength = 120,
  copyable = true,
  label = "JSON",
  className,
  ...rootProps
}: JsonViewerProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(() =>
    pathsToDepth(value, rootName, defaultExpandedDepth)
  )
  const [copied, setCopied] = React.useState<string | null>(null)
  // The row the tree would return to. A tree is one tab stop, so something has
  // to hold which row that is, and it is also what aria-selected reports.
  const [activePath, setActivePath] = React.useState<string | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const rows = React.useMemo(
    () => flatten(value, expanded, rootName),
    [value, expanded, rootName]
  )

  // Collapsing a branch can take the active row with it, so fall back to the
  // first row rather than leaving the tree with no way in.
  const active =
    activePath && rows.some((row) => row.path === activePath)
      ? activePath
      : rows[0]?.path

  const toggle = (path: string, open?: boolean) => {
    setExpanded((current) => {
      const shouldOpen = open ?? !current.has(path)
      if (shouldOpen === current.has(path)) return current

      const next = new Set(current)
      if (shouldOpen) next.add(path)
      else next.delete(path)
      return next
    })
  }

  const focusRow = (index: number) => {
    const target = rows[index]
    if (!target) return

    setActivePath(target.path)
    containerRef.current
      ?.querySelector<HTMLElement>(`[data-path="${CSS.escape(target.path)}"]`)
      ?.focus()
  }

  async function copyValue(row: Row) {
    try {
      await navigator.clipboard.writeText(
        typeof row.value === "string"
          ? row.value
          : JSON.stringify(row.value, null, 2)
      )
      setCopied(row.path)
    } catch {
      // Denied permission, an insecure context, or a sandboxed frame.
      setCopied(null)
    }

    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(null), 1400)
  }

  const onKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    row: Row,
    index: number
  ) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        focusRow(Math.min(index + 1, rows.length - 1))
        break
      case "ArrowUp":
        event.preventDefault()
        focusRow(Math.max(index - 1, 0))
        break
      case "ArrowRight":
        event.preventDefault()
        if (row.branch && !row.expanded) toggle(row.path, true)
        else if (row.branch) focusRow(index + 1)
        break
      case "ArrowLeft": {
        event.preventDefault()
        if (row.branch && row.expanded) {
          toggle(row.path, false)
          break
        }
        const back = rows
          .slice(0, index)
          .reverse()
          .findIndex((entry) => entry.level < row.level)
        if (back >= 0) focusRow(index - 1 - back)
        break
      }
      case "Home":
        event.preventDefault()
        focusRow(0)
        break
      case "End":
        event.preventDefault()
        focusRow(rows.length - 1)
        break
      case "Enter":
      case " ":
        if (!row.branch) break
        event.preventDefault()
        toggle(row.path)
        break
      default:
        break
    }
  }

  return (
    <div
      data-slot="json-viewer"
      ref={containerRef}
      className={cn(
        "border-border bg-muted/40 min-w-0 overflow-hidden rounded-[calc(var(--radius)+0.15rem)] border font-mono text-xs",
        className
      )}
      {...rootProps}
    >
      <div
        role="tree"
        aria-label={label}
        className="max-h-96 overflow-auto py-1"
      >
        {rows.map((row, index) => {
          const preview =
            row.kind === "string"
              ? JSON.stringify(row.value as string).length > maxStringLength
                ? `${JSON.stringify(row.value as string).slice(0, maxStringLength)}…"`
                : JSON.stringify(row.value as string)
              : row.branch || row.kind === "object" || row.kind === "array"
                ? summarise(row.value, row.kind)
                : String(row.value)

          return (
            <div
              key={row.path}
              data-path={row.path}
              role="treeitem"
              aria-level={row.level}
              aria-expanded={row.branch ? row.expanded : undefined}
              aria-selected={row.path === active}
              tabIndex={row.path === active ? 0 : -1}
              onFocus={() => setActivePath(row.path)}
              onKeyDown={(event) => onKeyDown(event, row, index)}
              onClick={() => row.branch && toggle(row.path)}
              style={{ paddingInlineStart: `${row.level * 0.85}rem` }}
              className={cn(
                "group hover:bg-muted/70 focus-visible:ring-ring flex min-h-7 items-center gap-1.5 pr-2 focus-visible:ring-2 focus-visible:outline-none",
                row.branch && "cursor-pointer"
              )}
            >
              <ChevronRight
                aria-hidden="true"
                size={13}
                className={cn(
                  "text-muted-foreground shrink-0 transition-transform",
                  !row.branch && "invisible",
                  row.expanded && "rotate-90"
                )}
              />

              {row.key !== null ? (
                <span className="text-foreground shrink-0">
                  {row.index === null ? `${row.key}:` : `${row.index}:`}
                </span>
              ) : (
                <span className="text-muted-foreground shrink-0">
                  {rootName}
                </span>
              )}

              <span className={cn("truncate", VALUE_CLASS[row.kind])}>
                {preview}
              </span>

              {copyable ? (
                <button
                  type="button"
                  aria-label={
                    copied === row.path ? "Copied" : `Copy ${row.path}`
                  }
                  onClick={(event) => {
                    event.stopPropagation()
                    void copyValue(row)
                  }}
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-ring ml-auto hidden size-6 shrink-0 items-center justify-center rounded group-focus-within:flex group-hover:flex focus-visible:ring-2 focus-visible:outline-none"
                >
                  {copied === row.path ? (
                    <Check aria-hidden="true" size={12} />
                  ) : (
                    <Clipboard aria-hidden="true" size={12} />
                  )}
                </button>
              ) : null}
            </div>
          )
        })}
      </div>

      <span aria-live="polite" className="sr-only">
        {copied ? `${copied} copied to clipboard.` : ""}
      </span>
    </div>
  )
}
