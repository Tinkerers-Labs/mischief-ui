"use client"

import { DemoVariants } from "@/components/demos/demo-variants"
import { RestartButton } from "@/components/demos/restart-button"
import {
  useScriptedTimeline,
  type TimelineStep,
} from "@/components/demos/use-scripted-timeline"
import {
  AgentChecklist,
  type AgentChecklistItem,
} from "@/registry/default/agent-checklist/agent-checklist"

const labels = [
  "Read the migration",
  "Check the column constraints",
  "Reorder the statements",
  "Run the test suite",
]

function frame(activeIndex: number): AgentChecklistItem[] {
  return labels.map((label, index) => ({
    id: String(index),
    label,
    status:
      index < activeIndex
        ? "done"
        : index === activeIndex
          ? "active"
          : "pending",
  }))
}

const steps: [
  TimelineStep<AgentChecklistItem[]>,
  ...TimelineStep<AgentChecklistItem[]>[],
] = [
  { state: frame(0), holdMs: 1600 },
  { state: frame(1), holdMs: 1600 },
  { state: frame(2), holdMs: 1600 },
  { state: frame(3), holdMs: 1600 },
  { state: frame(4), holdMs: 0 },
]

function LiveRun() {
  const { state, isFinished, restart, runId } = useScriptedTimeline(steps)

  return (
    <div className="grid gap-4">
      <AgentChecklist key={runId} items={state} title="Fixing the migration" />
      {isFinished ? <RestartButton onClick={restart} /> : null}
    </div>
  )
}

export function AgentChecklistDemo() {
  return (
    <DemoVariants
      label="Checklist state"
      variants={[
        { id: "live", label: "Live run", render: () => <LiveRun /> },
        {
          id: "failure",
          label: "With a failure",
          render: () => (
            <AgentChecklist
              title="Fixing the migration"
              items={[
                { id: "0", label: labels[0], status: "done" },
                { id: "1", label: labels[1], status: "done" },
                {
                  id: "2",
                  label: labels[2],
                  status: "error",
                  detail: "Permission denied on migrations/.",
                },
                { id: "3", label: labels[3], status: "skipped" },
              ]}
            />
          ),
        },
      ]}
    />
  )
}
