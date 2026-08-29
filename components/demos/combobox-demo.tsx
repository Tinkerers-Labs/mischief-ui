"use client"

import * as React from "react"

import {
  Combobox,
  type ComboboxOption,
} from "@/registry/default/combobox/combobox"

const startingLabels: ComboboxOption[] = [
  { value: "bug", label: "Bug", group: "Kind" },
  { value: "feature", label: "Feature", group: "Kind" },
  { value: "chore", label: "Chore", group: "Kind" },
  { value: "docs", label: "Docs", group: "Area", keywords: ["writing"] },
  { value: "registry", label: "Registry", group: "Area" },
  {
    value: "accessibility",
    label: "Accessibility",
    group: "Area",
    keywords: ["a11y"],
  },
]

export function ComboboxDemo() {
  const [options, setOptions] = React.useState(startingLabels)
  const [labels, setLabels] = React.useState(["bug"])

  return (
    <div className="grid w-full max-w-md gap-3 pb-56">
      <Combobox
        multiple
        max={4}
        label="Labels"
        placeholder="Search labels"
        options={options}
        value={labels}
        onValueChange={setLabels}
        onCreate={(label) => {
          const created = { value: label.toLowerCase(), label }
          setOptions((current) => [...current, created])
          setLabels((current) => [...current, created.value])
        }}
      />
      <p className="text-muted-foreground text-xs">
        Four at most. Type to narrow the list, or add a label that is not on it
        yet. Backspace on an empty field takes the last one back.
      </p>
    </div>
  )
}
