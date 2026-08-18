"use client"

import * as React from "react"

import { RestartButton } from "@/components/demos/restart-button"
import { StreamingText } from "@/registry/default/streaming-text/streaming-text"

const script =
  "I checked the three files you changed. The migration looks right, but `users.email` is still nullable, so the unique index will fail on the second empty row. Want me to add the backfill first?"

export function StreamingTextDemo() {
  const [runId, setRunId] = React.useState(0)
  const [done, setDone] = React.useState(false)

  return (
    <div className="grid w-full max-w-xl gap-4">
      <StreamingText
        key={runId}
        text={script}
        speed={55}
        className="text-[0.95rem] leading-relaxed"
        onDone={() => setDone(true)}
      />

      {done ? (
        <RestartButton
          onClick={() => {
            setDone(false)
            setRunId((current) => current + 1)
          }}
        />
      ) : null}
    </div>
  )
}
