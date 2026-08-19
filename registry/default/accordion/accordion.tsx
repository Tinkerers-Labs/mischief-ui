"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"

export type AccordionItem = {
  id: string
  title: React.ReactNode
  content: React.ReactNode
}

export type AccordionProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue"
> & {
  items: readonly AccordionItem[]
  /** Only one panel stays open at a time. Defaults to true. */
  exclusive?: boolean
  /** Ids open on first render. */
  defaultOpen?: readonly string[]
  icon?: React.ReactNode
  onToggle?: (id: string, open: boolean) => void
}

/**
 * Built on native disclosure elements, so the open and closed state, keyboard
 * handling, and find-in-page expansion come from the browser rather than from
 * scripted state. Exclusivity uses the shared name attribute for the same
 * reason.
 */
export function Accordion({
  items,
  exclusive = true,
  defaultOpen,
  icon,
  onToggle,
  className,
  ...rootProps
}: AccordionProps) {
  const groupName = React.useId()
  const open = React.useMemo(() => new Set(defaultOpen ?? []), [defaultOpen])

  return (
    <div
      data-slot="accordion"
      className={cn(
        "border-border divide-border min-w-0 divide-y overflow-hidden rounded-[calc(var(--radius)+0.15rem)] border",
        className
      )}
      {...rootProps}
    >
      {items.map((item) => (
        <details
          key={item.id}
          data-slot="accordion-item"
          name={exclusive ? groupName : undefined}
          open={open.has(item.id) || undefined}
          className="group bg-card/40 open:bg-card"
          onToggle={(event) =>
            onToggle?.(
              item.id,
              (event.currentTarget as HTMLDetailsElement).open
            )
          }
        >
          <summary
            data-slot="accordion-trigger"
            className="text-foreground hover:bg-muted/60 flex min-h-11 cursor-pointer list-none items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-inset motion-reduce:transition-none [&::-webkit-details-marker]:hidden"
          >
            <span className="min-w-0 flex-1">{item.title}</span>
            <span
              aria-hidden="true"
              className="text-muted-foreground shrink-0 transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
            >
              {icon ?? <Plus size={18} strokeWidth={1.8} />}
            </span>
          </summary>

          <div
            data-slot="accordion-content"
            className="text-muted-foreground px-4 pb-4 text-sm leading-relaxed"
          >
            {item.content}
          </div>
        </details>
      ))}
    </div>
  )
}
