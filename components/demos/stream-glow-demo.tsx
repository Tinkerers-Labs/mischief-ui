"use client"

import * as React from "react"
import { StreamGlow } from "@/registry/default/stream-glow/stream-glow"

export function StreamGlowDemo() {
  const [streaming, setStreaming] = React.useState(true)

  return (
    <div className="grid w-full max-w-md gap-4">
      <StreamGlow
        active={streaming}
        rate={0.8}
        className="border-border bg-card rounded-[var(--radius)] border p-6"
      >
        <p className="text-sm">
          The edge breathes while tokens land, and stops the moment they do.
        </p>
        <p className="text-muted-foreground mt-2 text-xs" role="status">
          {streaming ? "Answering" : "Finished"}
        </p>
      </StreamGlow>

      <button
        type="button"
        className="border-border mx-auto inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold"
        onClick={() => setStreaming((value) => !value)}
      >
        {streaming ? "Stop" : "Start"}
      </button>
    </div>
  )
}
