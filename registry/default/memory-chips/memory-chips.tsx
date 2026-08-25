"use client"

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

export type Memory = {
  id: string
  text: string
  /** Where it came from, such as the conversation that produced it. */
  source?: string
}

export type MemoryChipsProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  memories: readonly Memory[]
  onForget?: (id: string) => void
  onForgetAll?: () => void
  label?: string
  emptyMessage?: string
}

/**
 * Everything an assistant has been told to remember about someone, each one
 * removable on its own.
 *
 * Memory that cannot be listed cannot be corrected, and memory that cannot be
 * removed one item at a time leaves forgetting all of it as the only way to
 * fix one wrong entry.
 */
export function MemoryChips({
  memories,
  onForget,
  onForgetAll,
  label = "Remembered about you",
  emptyMessage = "Nothing is being remembered about you.",
  className,
  ...rootProps
}: MemoryChipsProps) {
  const [said, setSaid] = React.useState("")

  return (
    <div
      data-slot="memory-chips"
      className={cn(
        "border-border bg-background w-full rounded-xl border p-3",
        className
      )}
      {...rootProps}
    >
      <p className="text-muted-foreground mb-2 flex items-baseline gap-2 text-xs">
        <span className="font-medium">{label}</span>
        <span className="ms-auto tabular-nums">{memories.length}</span>
      </p>

      {memories.length === 0 ? (
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {memories.map((memory) => (
            <li key={memory.id}>
              <span
                data-slot="memory-chip"
                className="border-border bg-muted/40 text-foreground inline-flex max-w-full items-center gap-1 rounded-full border py-1 ps-3 pe-1 text-sm"
              >
                <span className="min-w-0 truncate">
                  {memory.text}
                  {memory.source ? (
                    <span className="text-muted-foreground ms-1.5 text-xs">
                      {memory.source}
                    </span>
                  ) : null}
                </span>

                {onForget ? (
                  <button
                    type="button"
                    aria-label={`Forget: ${memory.text}`}
                    onClick={() => {
                      setSaid(`Forgotten: ${memory.text}`)
                      onForget(memory.id)
                    }}
                    className="text-muted-foreground hover:bg-background hover:text-foreground focus-visible:ring-ring inline-flex size-7 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
                  >
                    <X aria-hidden="true" size={13} />
                  </button>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      )}

      {onForgetAll && memories.length > 0 ? (
        <button
          type="button"
          onClick={() => {
            setSaid("All memories forgotten.")
            onForgetAll()
          }}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring mt-3 rounded-md text-xs underline underline-offset-4 transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
        >
          Forget all {memories.length}
        </button>
      ) : null}

      <span aria-live="polite" className="sr-only">
        {said}
      </span>
    </div>
  )
}
