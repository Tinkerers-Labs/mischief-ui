"use client"

import { RestartButton } from "@/components/demos/restart-button"
import {
  useScriptedTimeline,
  type TimelineStep,
} from "@/components/demos/use-scripted-timeline"
import { StreamingText } from "@/registry/default/streaming-text/streaming-text"
import {
  ThinkingState,
  type ThinkingStatus,
} from "@/registry/default/thinking-state/thinking-state"

const steps: [TimelineStep<ThinkingStatus>, ...TimelineStep<ThinkingStatus>[]] =
  [
    { state: "thinking", holdMs: 4200 },
    { state: "done", holdMs: 0 },
  ]

const reasoning =
  "The index is created before the backfill runs, so any row still holding a null email will collide. Reordering the two statements is enough."

export function ThinkingStateDemo() {
  const { state, elapsedMs, isFinished, restart, runId } =
    useScriptedTimeline(steps)

  return (
    <div className="grid w-full max-w-xl gap-4">
      <ThinkingState
        key={runId}
        status={state}
        elapsedMs={elapsedMs}
        reasoning={<StreamingText key={runId} text={reasoning} speed={70} />}
      />

      {isFinished ? <RestartButton onClick={restart} /> : null}
    </div>
  )
}
