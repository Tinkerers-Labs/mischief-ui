"use client"

import * as React from "react"
import { FileText, ListChecks, Search } from "lucide-react"

import { Suggestions } from "@/registry/default/suggestions/suggestions"

const prompts = [
  {
    id: "summary",
    label: "Summarise this document",
    icon: <FileText size={14} />,
  },
  { id: "risks", label: "Find the risks", icon: <Search size={14} /> },
  {
    id: "actions",
    label: "List the action items",
    icon: <ListChecks size={14} />,
  },
]

export function SuggestionsDemo() {
  const [chosen, setChosen] = React.useState<string | null>(null)

  return (
    <div className="grid w-full max-w-lg gap-3">
      <Suggestions suggestions={prompts} onSelect={(s) => setChosen(s.id)} />
      <p className="text-muted-foreground text-center text-xs">
        {chosen
          ? `Chose: ${prompts.find((p) => p.id === chosen)?.label}`
          : "Pick one to start."}
      </p>
    </div>
  )
}
