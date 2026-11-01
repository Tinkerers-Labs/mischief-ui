"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, GitFork } from "lucide-react"

import { cn } from "@/lib/utils"

export type BranchNode = {
  id: string
  parentId: string | null
  /** A short line of the message, shown in the branch overview. */
  label?: string
}

export type MessageBranchesProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onSelect"
> & {
  nodes: readonly BranchNode[]
  /** Message ids from the first message to the one at the bottom of the view. */
  activePath: readonly string[]
  /** The message this control sits on. */
  messageId: string
  onSelect: (branchId: string) => void
  overview?: boolean
  label?: string
}

type Segment = {
  start: BranchNode
  ids: string[]
  children: Segment[]
}

/**
 * A run of messages with no fork in it is one row. Only the places where the
 * conversation actually split get their own level, so a long thread that was
 * edited once stays two rows deep.
 */
function segmentsFrom(
  starts: readonly BranchNode[],
  childrenOf: Map<string | null, BranchNode[]>
): Segment[] {
  return starts.map((start) => {
    const ids = [start.id]
    let kids = childrenOf.get(start.id) ?? []

    while (kids.length === 1) {
      ids.push(kids[0]!.id)
      kids = childrenOf.get(kids[0]!.id) ?? []
    }

    return { start, ids, children: segmentsFrom(kids, childrenOf) }
  })
}

const iconButton =
  "text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring relative inline-flex size-7 items-center justify-center rounded-md transition-colors duration-150 after:absolute after:-inset-1.5 after:content-[''] focus-visible:ring-2 focus-visible:outline-none aria-disabled:pointer-events-none aria-disabled:opacity-40 motion-reduce:transition-none"

export function MessageBranches({
  nodes,
  activePath,
  messageId,
  onSelect,
  overview = true,
  label = "Versions of this message",
  className,
  ...rootProps
}: MessageBranchesProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const panelId = React.useId()

  const [open, setOpen] = React.useState(false)
  const [direction, setDirection] = React.useState<"back" | "forward" | null>(
    null
  )

  const { childrenOf, roots, siblings } = React.useMemo(() => {
    const known = new Set(nodes.map((node) => node.id))
    const childrenOf = new Map<string | null, BranchNode[]>()

    for (const node of nodes) {
      const parent =
        node.parentId != null && known.has(node.parentId) ? node.parentId : null
      childrenOf.set(parent, [...(childrenOf.get(parent) ?? []), node])
    }

    const self = nodes.find((node) => node.id === messageId)
    const parent =
      self?.parentId != null && known.has(self.parentId) ? self.parentId : null

    return {
      childrenOf,
      roots: childrenOf.get(null) ?? [],
      siblings: self ? (childrenOf.get(parent) ?? []) : [],
    }
  }, [nodes, messageId])

  const segments = React.useMemo(
    () => (open ? segmentsFrom(roots, childrenOf) : []),
    [open, roots, childrenOf]
  )

  const onPath = new Set(activePath)
  const deepest = activePath[activePath.length - 1]
  const index = siblings.findIndex((node) => node.id === messageId)
  const count = siblings.length

  React.useEffect(() => {
    if (!open) return

    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener("pointerdown", close)
    return () => document.removeEventListener("pointerdown", close)
  }, [open])

  React.useLayoutEffect(() => {
    const panel = panelRef.current
    if (!open || !panel) return

    // Open toward whichever side has room, so a control under a message on
    // the right edge of a phone does not push its panel off screen.
    panel.style.left = "0px"
    panel.style.right = "auto"
    if (panel.getBoundingClientRect().right > window.innerWidth - 8) {
      panel.style.left = "auto"
      panel.style.right = "0px"
    }

    const current =
      panel.querySelector<HTMLElement>('[aria-current="true"]') ??
      panel.querySelector<HTMLElement>("button")
    current?.focus()
  }, [open])

  if (count < 2) return null

  const step = (by: -1 | 1) => {
    const next = siblings[index + by]
    if (!next) return
    setDirection(by < 0 ? "back" : "forward")
    onSelect(next.id)
  }

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const choose = (id: string) => {
    setDirection(null)
    close()
    onSelect(id)
  }

  const moveFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const rows = Array.from(
      panelRef.current?.querySelectorAll<HTMLButtonElement>(
        '[data-slot="message-branches-row"]'
      ) ?? []
    )
    const at = rows.indexOf(document.activeElement as HTMLButtonElement)

    const target =
      event.key === "ArrowDown"
        ? rows[Math.min(at + 1, rows.length - 1)]
        : event.key === "ArrowUp"
          ? rows[Math.max(at - 1, 0)]
          : event.key === "Home"
            ? rows[0]
            : event.key === "End"
              ? rows[rows.length - 1]
              : null

    if (event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      close()
    } else if (target) {
      event.preventDefault()
      target.focus()
    }
  }

  const renderSegments = (list: Segment[], depth: number): React.ReactNode => (
    <ul className={cn(depth > 0 && "border-border ms-3 border-s ps-1.5")}>
      {list.map((segment) => {
        const active = segment.ids.some((id) => onPath.has(id))
        const here = deepest != null && segment.ids.includes(deepest)
        const holds = segment.ids.includes(messageId)
        const messages = segment.ids.length
        const name = [
          segment.start.label ?? "Message",
          messages === 1 ? "1 message" : `${messages} messages`,
          holds ? "contains this message" : "",
          active ? "shown" : "",
        ]
          .filter(Boolean)
          .join(", ")

        return (
          <li key={segment.start.id}>
            <button
              type="button"
              data-slot="message-branches-row"
              data-active={active ? "" : undefined}
              aria-label={name}
              aria-current={here ? "true" : undefined}
              onClick={() => choose(segment.start.id)}
              className={cn(
                "hover:bg-muted focus-visible:ring-ring flex min-h-9 w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  active ? "bg-primary" : "bg-border"
                )}
              />
              <span className="min-w-0 flex-1 truncate">
                {segment.start.label ?? "Message"}
              </span>
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                {messages}
              </span>
            </button>
            {segment.children.length > 0
              ? renderSegments(segment.children, depth + 1)
              : null}
          </li>
        )
      })}
    </ul>
  )

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={label}
      data-slot="message-branches"
      data-state={open ? "open" : "closed"}
      className={cn(
        "text-muted-foreground relative inline-flex items-center gap-0.5 text-xs",
        className
      )}
      {...rootProps}
    >
      <button
        type="button"
        aria-label="Previous version"
        aria-disabled={index <= 0 || undefined}
        onClick={() => step(-1)}
        className={iconButton}
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
      </button>

      <span className="min-w-[4ch] overflow-hidden text-center tabular-nums">
        <span
          key={index}
          aria-hidden="true"
          className={cn(
            "inline-block transition-[translate,opacity] duration-200 ease-out motion-reduce:transition-none",
            direction === "forward" && "starting:translate-y-1.5",
            direction === "back" && "starting:-translate-y-1.5",
            direction && "starting:opacity-0"
          )}
        >
          {index + 1} / {count}
        </span>
        <span className="sr-only">
          Version {index + 1} of {count}
        </span>
      </span>

      <button
        type="button"
        aria-label="Next version"
        aria-disabled={index >= count - 1 || undefined}
        onClick={() => step(1)}
        className={iconButton}
      >
        <ChevronRight aria-hidden="true" className="size-4" />
      </button>

      {overview ? (
        <>
          <button
            ref={triggerRef}
            type="button"
            aria-label="Show conversation branches"
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
            onClick={() => setOpen((value) => !value)}
            className={cn(iconButton, "ms-0.5", open && "bg-muted")}
          >
            <GitFork aria-hidden="true" className="size-3.5" />
          </button>

          {open ? (
            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-label="Conversation branches"
              onKeyDown={moveFocus}
              className="border-border bg-popover text-popover-foreground absolute top-full z-50 mt-1.5 w-72 max-w-[calc(100vw-2rem)] rounded-[calc(var(--radius)+0.25rem)] border p-1.5 shadow-lg transition-[opacity,translate] duration-150 ease-out motion-reduce:transition-none starting:-translate-y-1 starting:opacity-0"
            >
              <p className="text-muted-foreground px-2 pt-1 pb-1.5 text-xs">
                Each row is a run of messages. Indented rows began as an edit or
                a regenerated reply.
              </p>
              <nav aria-label="Branches">{renderSegments(segments, 0)}</nav>
            </div>
          ) : null}
        </>
      ) : null}

      <span aria-live="polite" className="sr-only">
        {direction ? `Version ${index + 1} of ${count}` : ""}
      </span>
    </div>
  )
}
