"use client"

import * as React from "react"

const TICK_MS = 100

export type TimelineStep<TState> = {
  state: TState
  holdMs: number
}

export function useScriptedTimeline<TState>(
  steps: [TimelineStep<TState>, ...TimelineStep<TState>[]]
) {
  const [index, setIndex] = React.useState(0)
  const [elapsedMs, setElapsedMs] = React.useState(0)
  const [runId, setRunId] = React.useState(0)

  const isFinished = index >= steps.length - 1

  React.useEffect(() => {
    if (isFinished) return

    const timer = window.setTimeout(
      () => setIndex((current) => current + 1),
      (steps[index] ?? steps[0]).holdMs
    )

    return () => window.clearTimeout(timer)
  }, [index, isFinished, steps])

  React.useEffect(() => {
    if (isFinished) return

    const timer = window.setInterval(
      () => setElapsedMs((current) => current + TICK_MS),
      TICK_MS
    )

    return () => window.clearInterval(timer)
  }, [isFinished])

  const restart = React.useCallback(() => {
    setIndex(0)
    setElapsedMs(0)
    setRunId((current) => current + 1)
  }, [])

  return {
    state: (steps[index] ?? steps[0]).state,
    elapsedMs,
    isFinished,
    restart,
    runId,
  }
}
