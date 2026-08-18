"use client"

import { RestartButton } from "@/components/demos/restart-button"
import {
  useScriptedTimeline,
  type TimelineStep,
} from "@/components/demos/use-scripted-timeline"
import {
  ToolCall,
  type ToolCallStatus,
} from "@/registry/default/tool-call/tool-call"

const steps: [TimelineStep<ToolCallStatus>, ...TimelineStep<ToolCallStatus>[]] =
  [
    { state: "pending", holdMs: 900 },
    { state: "running", holdMs: 2400 },
    { state: "success", holdMs: 0 },
  ]

export function ToolCallDemo() {
  const { state, elapsedMs, isFinished, restart, runId } =
    useScriptedTimeline(steps)

  return (
    <div className="grid w-full max-w-xl gap-4">
      <ToolCall
        key={runId}
        name="search_files"
        status={state}
        durationMs={state === "pending" ? undefined : elapsedMs}
        input={{ pattern: "nullable email", path: "migrations/", limit: 5 }}
        output={
          isFinished ? (
            <p>
              2 matches in <code>0004_add_email_index.sql</code>
            </p>
          ) : undefined
        }
        defaultOpen
      />

      {isFinished ? <RestartButton onClick={restart} /> : null}
    </div>
  )
}
