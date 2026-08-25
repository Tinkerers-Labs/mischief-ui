"use client"

import * as React from "react"

import { MemoryChips } from "@/registry/default/memory-chips/memory-chips"

const remembered = [
  { id: "1", text: "Prefers pnpm" },
  { id: "2", text: "Works in TypeScript", source: "from a PR review" },
  { id: "3", text: "Uses merge commits, never squash" },
  { id: "4", text: "Timezone is IST" },
]

export function MemoryChipsDemo() {
  const [memories, setMemories] = React.useState(remembered)

  return (
    <div className="w-full max-w-md space-y-3">
      <MemoryChips
        memories={memories}
        onForget={(id) => setMemories((all) => all.filter((m) => m.id !== id))}
        onForgetAll={() => setMemories([])}
      />

      {memories.length < remembered.length ? (
        <button
          type="button"
          onClick={() => setMemories(remembered)}
          className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-4"
        >
          Put them back
        </button>
      ) : null}
    </div>
  )
}
