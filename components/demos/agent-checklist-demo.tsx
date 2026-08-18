"use client"

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

export function AgentChecklistDemo() {
  const { state, isFinished, restart, runId } = useScriptedTimeline(steps)

  return (
    <div className="grid w-full max-w-xl gap-4">
      <AgentChecklist key={runId} items={state} title="Fixing the migration" />
      {isFinished ? <RestartButton onClick={restart} /> : null}
    </div>
  )
}
