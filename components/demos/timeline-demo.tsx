"use client"

import { Timeline } from "@/registry/default/timeline/timeline"

const entries = [
  {
    id: "opened",
    title: "Pull request opened",
    time: "09:14",
    description: "Twelve files changed.",
    tone: "done" as const,
  },
  {
    id: "checks",
    title: "Checks passed",
    time: "09:21",
    tone: "done" as const,
  },
  {
    id: "review",
    title: "Waiting on review",
    time: "09:22",
    description: "Two reviewers asked.",
    tone: "active" as const,
  },
  { id: "merge", title: "Merge", tone: "todo" as const },
]

export function TimelineDemo() {
  return (
    <div className="w-full max-w-md">
      <Timeline entries={entries} label="Pull request history" />
    </div>
  )
}
