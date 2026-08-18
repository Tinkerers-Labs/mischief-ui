"use client"

import { DemoVariants } from "@/components/demos/demo-variants"
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

function LiveRun() {
  const { state, elapsedMs, isFinished, restart, runId } =
    useScriptedTimeline(steps)

  return (
    <div className="grid gap-4">
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

export function ThinkingStateDemo() {
  return (
    <DemoVariants
      label="Thinking state"
      variants={[
        { id: "live", label: "Live run", render: () => <LiveRun /> },
        {
          id: "reasoning",
          label: "Reasoning open",
          render: () => (
            <ThinkingState
              status="done"
              elapsedMs={4200}
              reasoning={<p>{reasoning}</p>}
              defaultOpen
            />
          ),
        },
        {
          id: "error",
          label: "Failed",
          render: () => <ThinkingState status="error" elapsedMs={1900} />,
        },
      ]}
    />
  )
}
