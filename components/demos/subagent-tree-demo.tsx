"use client"

import { SubagentTree } from "@/registry/default/subagent-tree/subagent-tree"

const runs = [
  {
    id: "plan",
    label: "Read the issue and split the work",
    status: "done" as const,
    duration: 4.2,
    children: [
      {
        id: "search",
        label: "Find every call site",
        status: "done" as const,
        duration: 11.6,
        detail: "14 files, 31 calls.",
      },
      {
        id: "migrate",
        label: "Rewrite the call sites",
        status: "running" as const,
        duration: 42.8,
        children: [
          {
            id: "a",
            label: "src/upload",
            status: "done" as const,
            duration: 8.1,
          },
          { id: "b", label: "src/queue", status: "running" as const },
          { id: "c", label: "src/workers", status: "queued" as const },
        ],
      },
      {
        id: "types",
        label: "Check the generated types",
        status: "failed" as const,
        duration: 6.4,
        detail: "Two entries still point at the old signature.",
      },
    ],
  },
]

export function SubagentTreeDemo() {
  return (
    <div className="w-full max-w-lg">
      <SubagentTree runs={runs} />
    </div>
  )
}
