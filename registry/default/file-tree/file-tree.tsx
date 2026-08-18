"use client"

import * as React from "react"
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export type FileTreeNode = {
  id: string
  name: string
  kind?: "file" | "folder"
  children?: FileTreeNode[]
  meta?: React.ReactNode
  icon?: React.ReactNode
}

export type FileTreeProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onSelect"
> & {
  nodes: FileTreeNode[]
  expandedIds?: string[]
  defaultExpandedIds?: string[]
  onExpandedChange?: (ids: string[]) => void
  selectedId?: string | null
  defaultSelectedId?: string | null
  onSelect?: (node: FileTreeNode) => void
  label?: string
}

type FlatNode = {
  node: FileTreeNode
  level: number
  isFolder: boolean
  isExpanded: boolean
}

function isFolder(node: FileTreeNode) {
  return node.kind === "folder" || Array.isArray(node.children)
}

function flatten(
  nodes: FileTreeNode[],
  expanded: Set<string>,
  level = 1
): FlatNode[] {
  return nodes.flatMap((node) => {
    const folder = isFolder(node)
    const open = folder && expanded.has(node.id)
    const self: FlatNode = { node, level, isFolder: folder, isExpanded: open }

    if (!open || !node.children) return [self]

    return [self, ...flatten(node.children, expanded, level + 1)]
  })
}

export function FileTree({
  nodes,
  expandedIds,
  defaultExpandedIds = [],
  onExpandedChange,
  selectedId,
  defaultSelectedId = null,
  onSelect,
  label = "Files",
  className,
  ...rootProps
}: FileTreeProps) {
  const [uncontrolledExpanded, setUncontrolledExpanded] =
    React.useState<string[]>(defaultExpandedIds)
  const [uncontrolledSelected, setUncontrolledSelected] = React.useState<
    string | null
  >(defaultSelectedId)

  const expandedList = expandedIds ?? uncontrolledExpanded
  const expanded = React.useMemo(() => new Set(expandedList), [expandedList])
  const selected = selectedId === undefined ? uncontrolledSelected : selectedId

  const rows = React.useMemo(() => flatten(nodes, expanded), [nodes, expanded])

  const containerRef = React.useRef<HTMLDivElement>(null)

  const setExpanded = (ids: string[]) => {
    if (expandedIds === undefined) setUncontrolledExpanded(ids)
    onExpandedChange?.(ids)
  }

  const toggle = (id: string, open?: boolean) => {
    const shouldOpen = open ?? !expanded.has(id)
    if (shouldOpen === expanded.has(id)) return

    setExpanded(
      shouldOpen
        ? [...expandedList, id]
        : expandedList.filter((entry) => entry !== id)
    )
  }

  const select = (node: FileTreeNode) => {
    if (selectedId === undefined) setUncontrolledSelected(node.id)
    onSelect?.(node)
  }

  const focusRow = (index: number) => {
    const target = rows[index]
    if (!target) return

    containerRef.current
      ?.querySelector<HTMLElement>(
        `[data-node="${CSS.escape(target.node.id)}"]`
      )
      ?.focus()
  }

  const onKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    row: FlatNode,
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
        if (row.isFolder && !row.isExpanded) toggle(row.node.id, true)
        else if (row.isFolder) focusRow(index + 1)
        break
      case "ArrowLeft": {
        event.preventDefault()
        if (row.isFolder && row.isExpanded) {
          toggle(row.node.id, false)
          break
        }
        const parent = rows
          .slice(0, index)
          .reverse()
          .findIndex((entry) => entry.level < row.level)
        if (parent >= 0) focusRow(index - 1 - parent)
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
        event.preventDefault()
        if (row.isFolder) toggle(row.node.id)
        select(row.node)
        break
      default:
    }
  }

  const activeIndex = Math.max(
    rows.findIndex((row) => row.node.id === selected),
    0
  )

  return (
    <div
      ref={containerRef}
      data-slot="file-tree"
      className={cn(
        "border-border bg-card text-card-foreground rounded-[var(--radius)] border p-1.5",
        className
      )}
      {...rootProps}
    >
      <div role="tree" aria-label={label}>
        {rows.map((row, index) => {
          const isSelected = row.node.id === selected
          const Icon = row.isFolder
            ? row.isExpanded
              ? FolderOpen
              : Folder
            : File

          return (
            <div
              key={row.node.id}
              role="treeitem"
              data-node={row.node.id}
              data-slot="file-tree-item"
              aria-level={row.level}
              aria-selected={isSelected}
              aria-expanded={row.isFolder ? row.isExpanded : undefined}
              tabIndex={index === activeIndex ? 0 : -1}
              className={cn(
                "focus-visible:ring-ring flex min-h-9 cursor-default items-center gap-1.5 rounded-[calc(var(--radius)-0.35rem)] pr-2 text-sm focus-visible:ring-2 focus-visible:outline-none",
                isSelected ? "bg-muted font-semibold" : "hover:bg-muted/60"
              )}
              style={{ paddingLeft: `${(row.level - 1) * 0.85 + 0.35}rem` }}
              onClick={() => {
                if (row.isFolder) toggle(row.node.id)
                select(row.node)
              }}
              onKeyDown={(event) => onKeyDown(event, row, index)}
            >
              <span className="flex size-4 shrink-0 items-center justify-center">
                {row.isFolder ? (
                  <ChevronRight
                    aria-hidden="true"
                    size={13}
                    className={cn(
                      "text-muted-foreground transition-transform duration-150 motion-reduce:transition-none",
                      row.isExpanded && "rotate-90"
                    )}
                  />
                ) : null}
              </span>

              <span
                aria-hidden="true"
                className="text-muted-foreground shrink-0"
              >
                {row.node.icon ?? <Icon size={15} />}
              </span>

              <span className="min-w-0 flex-1 truncate">{row.node.name}</span>

              {row.node.meta ? (
                <span className="text-muted-foreground shrink-0 text-xs">
                  {row.node.meta}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
