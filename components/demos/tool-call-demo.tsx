"use client"

import { DemoVariants } from "@/components/demos/demo-variants"
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

const input = { pattern: "nullable email", path: "migrations/", limit: 5 }

function LiveRun() {
  const { state, elapsedMs, isFinished, restart, runId } =
    useScriptedTimeline(steps)

  return (
    <div className="grid gap-4">
      <ToolCall
        key={runId}
        name="search_files"
        status={state}
        durationMs={state === "pending" ? undefined : elapsedMs}
        input={input}
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

export function ToolCallDemo() {
  return (
    <DemoVariants
      label="Tool call state"
      variants={[
        { id: "live", label: "Live run", render: () => <LiveRun /> },
        {
          id: "queued",
          label: "Queued",
          render: () => (
            <ToolCall name="search_files" status="pending" input={input} />
          ),
        },
        {
          id: "error",
          label: "Failed",
          render: () => (
            <ToolCall
              name="write_file"
              status="error"
              input={{ path: "migrations/0004_add_email_index.sql" }}
              error="Permission denied. The migrations directory is read-only."
              durationMs={120}
              defaultOpen
            />
          ),
        },
      ]}
    />
  )
}
