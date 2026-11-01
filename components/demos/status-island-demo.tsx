"use client"

import * as React from "react"

import {
  StatusIsland,
  type StatusIslandTask,
} from "@/registry/default/status-island/status-island"

type DemoTask = StatusIslandTask & { step: number; failAt?: number }

let next = 0

function task(label: string, step: number, failAt?: number): DemoTask {
  next += 1
  return {
    id: `task-${next}`,
    label,
    progress: 0,
    status: "running",
    step,
    failAt,
  }
}

const syncing: DemoTask = {
  id: "sync",
  label: "Syncing project files",
  progress: 0,
  status: "running",
  step: 0.045,
}

const action =
  "border-border hover:bg-muted focus-visible:ring-ring/50 min-h-9 rounded-[var(--radius)] border px-3 text-sm outline-none focus-visible:ring-4 disabled:opacity-50"

export function StatusIslandDemo() {
  const [tasks, setTasks] = React.useState<DemoTask[]>([syncing])
  const active = tasks.some((item) => item.status === "running")

  React.useEffect(() => {
    if (!active) return

    const timer = setInterval(() => {
      setTasks((list) =>
        list.map((item) => {
          if (item.status !== "running") return item
          const progress = Math.min((item.progress ?? 0) + item.step, 1)
          if (item.failAt !== undefined && progress >= item.failAt) {
            return {
              ...item,
              progress,
              status: "error",
              detail: "The connection dropped",
            }
          }
          return {
            ...item,
            progress,
            status: progress >= 1 ? "done" : "running",
          }
        })
      )
    }, 300)

    return () => clearInterval(timer)
  }, [active])

  function start(added: DemoTask[]) {
    setTasks((list) => [
      ...list.filter((item) => item.status !== "done"),
      ...added,
    ])
  }

  return (
    <div className="bg-background border-border relative flex min-h-[22rem] w-full max-w-[34rem] flex-col justify-end gap-3 overflow-hidden rounded-[1.25rem] border p-6 shadow-sm">
      <StatusIsland
        className="absolute"
        tasks={tasks}
        onCancel={(id) =>
          setTasks((list) => list.filter((item) => item.id !== id))
        }
        onRetry={(id) =>
          setTasks((list) =>
            list.map((item) =>
              item.id === id
                ? {
                    ...item,
                    progress: 0,
                    status: "running",
                    detail: undefined,
                    failAt: undefined,
                  }
                : item
            )
          )
        }
      />

      <p className="text-muted-foreground text-sm">
        Start some work, then open the island to see every task.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={action}
          onClick={() =>
            start([
              task("site-plan.pdf", 0.06),
              task("kitchen-photos.zip", 0.035),
            ])
          }
        >
          Upload two files
        </button>
        <button
          type="button"
          className={action}
          onClick={() => start([task("March invoices.csv", 0.08, 0.6)])}
        >
          Export that fails once
        </button>
      </div>
    </div>
  )
}
