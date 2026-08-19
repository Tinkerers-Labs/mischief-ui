"use client"

import * as React from "react"

import { RestartButton } from "@/components/demos/restart-button"
import { StopGenerating } from "@/registry/default/stop-generating/stop-generating"

const answer =
  "Rate limiting belongs in middleware so every route inherits it. Keep the counter in Redis with a sliding window, and return 429 once the window is full."

export function StopGeneratingDemo() {
  const [run, setRun] = React.useState(() => ({ id: 0, startedAt: Date.now() }))
  const [shown, setShown] = React.useState(0)
  const [stopped, setStopped] = React.useState(false)

  const words = answer.split(" ")
  const done = shown >= words.length
  const running = !done && !stopped

  React.useEffect(() => {
    if (!running) return

    const timer = setTimeout(() => setShown((count) => count + 1), 130)
    return () => clearTimeout(timer)
  }, [running, shown, run.id])

  return (
    <div className="grid w-full max-w-xl gap-4">
      <p className="text-foreground min-h-16 text-sm leading-relaxed">
        {words.slice(0, shown).join(" ")}
        {stopped && !done ? (
          <span className="text-muted-foreground"> … stopped</span>
        ) : null}
      </p>

      <div className="flex items-center gap-3">
        <StopGenerating
          running={running}
          startedAt={run.startedAt}
          onStop={() => setStopped(true)}
        />

        {running ? null : (
          <RestartButton
            onClick={() => {
              setShown(0)
              setStopped(false)
              setRun((current) => ({
                id: current.id + 1,
                startedAt: Date.now(),
              }))
            }}
          />
        )}
      </div>
    </div>
  )
}
