"use client"

import * as React from "react"
import {
  PresenceField,
  type AgentPresence,
} from "@/registry/default/presence-field/presence-field"

const states: AgentPresence[] = [
  "idle",
  "thinking",
  "streaming",
  "done",
  "error",
]

export function PresenceFieldDemo() {
  const [state, setState] = React.useState<AgentPresence>("thinking")

  return (
    <div className="grid w-full max-w-xl gap-4">
      <PresenceField
        state={state}
        className="border-border rounded-[var(--radius)] border"
      >
        <div className="px-8 py-16 text-center">
          <p className="text-sm font-semibold capitalize">{state}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            The room changes with the assistant, and settles rather than snaps.
          </p>
        </div>
      </PresenceField>

      <div
        role="group"
        aria-label="Assistant state"
        className="border-border bg-background/70 mx-auto inline-flex flex-wrap justify-center gap-1 rounded-full border p-1"
      >
        {states.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={state === option}
            className={
              state === option
                ? "bg-foreground text-background rounded-full px-3 py-1.5 text-xs font-semibold capitalize"
                : "text-muted-foreground hover:text-foreground rounded-full px-3 py-1.5 text-xs font-semibold capitalize"
            }
            onClick={() => setState(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
