"use client"

import * as React from "react"

import {
  ModelPicker,
  type Model,
} from "@/registry/default/model-picker/model-picker"

const models: Model[] = [
  {
    id: "opus",
    name: "Opus",
    description: "The deepest reasoning, for work that is worth the wait.",
    badges: ["reasoning", "vision"],
  },
  {
    id: "sonnet",
    name: "Sonnet",
    description: "The everyday balance of speed and judgement.",
    badges: ["balanced", "vision"],
  },
  {
    id: "haiku",
    name: "Haiku",
    description: "Quick answers where latency matters more than depth.",
    badges: ["fast"],
  },
  {
    id: "legacy",
    name: "Legacy",
    description: "Retired. Kept here so old links still resolve.",
    disabled: true,
  },
]

export function ModelPickerDemo() {
  const [value, setValue] = React.useState("sonnet")

  return (
    <div className="grid w-full max-w-sm gap-3">
      <ModelPicker models={models} value={value} onValueChange={setValue} />
      <p className="text-muted-foreground text-xs" role="status">
        Answering with {models.find((model) => model.id === value)?.name}
      </p>
    </div>
  )
}
