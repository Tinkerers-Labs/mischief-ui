"use client"

import * as React from "react"
import { SortableList } from "@/registry/default/sortable-list/sortable-list"

type Task = { id: string; name: string; note: string }

const initial: Task[] = [
  { id: "read", name: "Read the brief", note: "Twice, slowly" },
  { id: "sketch", name: "Sketch three routes", note: "On paper" },
  { id: "build", name: "Build the likely one", note: "Thin slice first" },
  { id: "show", name: "Show someone", note: "Before it is finished" },
]

export function SortableListDemo() {
  const [tasks, setTasks] = React.useState(initial)

  return (
    <div className="w-full max-w-md">
      <SortableList
        items={tasks}
        getKey={(task) => task.id}
        getLabel={(task) => task.name}
        onReorder={setTasks}
        label="Tasks in order"
        renderItem={(task) => (
          <div>
            <p className="text-sm font-semibold">{task.name}</p>
            <p className="text-muted-foreground text-xs">{task.note}</p>
          </div>
        )}
      />
      <p className="text-muted-foreground mt-3 text-xs">
        Drag a handle, or focus one and press space to lift it.
      </p>
    </div>
  )
}
