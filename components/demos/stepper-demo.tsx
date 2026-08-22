"use client"

import * as React from "react"
import { Stepper } from "@/registry/default/stepper/stepper"

const steps = [
  { id: "account", label: "Account", description: "Name and email" },
  { id: "workspace", label: "Workspace", description: "Where things live" },
  { id: "invite", label: "Invite", description: "Bring the others" },
  { id: "done", label: "Done" },
]

export function StepperDemo() {
  const [current, setCurrent] = React.useState(1)

  return (
    <div className="grid w-full max-w-xl gap-6">
      <Stepper steps={steps} current={current} onSelect={setCurrent} />

      <div className="flex justify-center gap-2">
        <button
          type="button"
          className="border-border inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold disabled:opacity-40"
          disabled={current === 0}
          onClick={() => setCurrent((value) => value - 1)}
        >
          Back
        </button>
        <button
          type="button"
          className="bg-primary text-primary-foreground inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold disabled:opacity-40"
          disabled={current === steps.length - 1}
          onClick={() => setCurrent((value) => value + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}
