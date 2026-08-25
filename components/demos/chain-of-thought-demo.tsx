"use client"

import * as React from "react"

import { ChainOfThought } from "@/registry/default/chain-of-thought/chain-of-thought"

const thoughts = [
  {
    id: "read",
    label: "Read the retry handler",
    duration: 0.8,
    detail: "src/upload/retry.ts, 140 lines.",
  },
  {
    id: "trace",
    label: "Traced where the listener is added",
    duration: 2.1,
    detail: "onReconnect registers it again without removing the previous one.",
  },
  { id: "check", label: "Checked the reconnect tests", duration: 1.4 },
  { id: "write", label: "Wrote the failing case first", duration: 3.2 },
]

export function ChainOfThoughtDemo() {
  const [shown, setShown] = React.useState(2)

  React.useEffect(() => {
    if (shown >= thoughts.length) return

    const timer = setTimeout(() => setShown((count) => count + 1), 1400)
    return () => clearTimeout(timer)
  }, [shown])

  const thinking = shown < thoughts.length

  return (
    <div className="w-full max-w-lg space-y-3">
      <ChainOfThought
        thinking={thinking}
        thoughts={thoughts.slice(0, shown).map((thought, at) => ({
          ...thought,
          status: thinking && at === shown - 1 ? "active" : "done",
          duration: thinking && at === shown - 1 ? undefined : thought.duration,
        }))}
      />

      <button
        type="button"
        onClick={() => setShown(2)}
        className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-4"
      >
        Run it again
      </button>
    </div>
  )
}
