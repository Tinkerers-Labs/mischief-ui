"use client"

import * as React from "react"

import { UndoButton } from "@/registry/default/undo-button/undo-button"

const drafts = [
  { id: "launch", title: "Launch checklist", edited: "Edited yesterday" },
  { id: "retro", title: "Sprint retro notes", edited: "Edited 3 days ago" },
  {
    id: "hiring",
    title: "Interview loop questions",
    edited: "Edited last week",
  },
]

export function UndoButtonDemo() {
  const [items, setItems] = React.useState(drafts)
  const [leaving, setLeaving] = React.useState<string[]>([])

  return (
    <div className="bg-background border-border w-full max-w-[30rem] rounded-[1.25rem] border p-4 shadow-sm">
      <div className="flex items-baseline justify-between px-2 pb-2">
        <h3 className="text-sm font-semibold">Drafts</h3>
        <span className="text-muted-foreground text-xs">
          Hover the button to hold the clock
        </span>
      </div>

      {items.length ? (
        <ul className="divide-border divide-y">
          {items.map((item) => {
            const deleting = leaving.includes(item.id)

            return (
              <li
                key={item.id}
                className="flex items-center gap-3 px-2 py-3"
                data-deleting={deleting || undefined}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={
                      deleting
                        ? "text-muted-foreground truncate text-sm line-through"
                        : "truncate text-sm font-medium"
                    }
                  >
                    {item.title}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {deleting ? "Deleting" : item.edited}
                  </p>
                </div>
                <UndoButton
                  aria-label={deleting ? undefined : `Delete ${item.title}`}
                  message={`Deleted ${item.title}`}
                  onAction={() => setLeaving((ids) => [...ids, item.id])}
                  onUndo={() =>
                    setLeaving((ids) => ids.filter((id) => id !== item.id))
                  }
                  onCommit={() => {
                    setLeaving((ids) => ids.filter((id) => id !== item.id))
                    setItems((list) => list.filter((d) => d.id !== item.id))
                  }}
                />
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 px-2 py-8 text-center">
          <p className="text-muted-foreground text-sm">No drafts left.</p>
          <button
            type="button"
            className="border-border hover:bg-muted focus-visible:ring-ring/50 min-h-9 rounded-[var(--radius)] border px-3 text-sm outline-none focus-visible:ring-4"
            onClick={() => setItems(drafts)}
          >
            Bring them back
          </button>
        </div>
      )}
    </div>
  )
}
