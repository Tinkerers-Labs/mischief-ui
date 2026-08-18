"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { componentDocs } from "@/lib/component-docs"
import { CommandPalette } from "@/registry/default/command-palette/command-palette"

const items = componentDocs.slice(0, 12).map((component) => ({
  id: component.slug,
  label: component.name,
  description: component.summary,
  group: component.family,
}))

export function CommandPaletteDemo() {
  const [open, setOpen] = React.useState(false)
  const [chosen, setChosen] = React.useState<string>()

  return (
    <div className="grid w-full max-w-sm justify-items-center gap-3">
      <button
        type="button"
        className="border-border hover:bg-muted focus-visible:ring-ring inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
        onClick={() => setOpen(true)}
      >
        <Search aria-hidden="true" size={14} />
        Open the palette
        <kbd className="border-border text-muted-foreground rounded border px-1 font-[family-name:var(--font-mono),monospace] text-[0.65rem]">
          ⌘K
        </kbd>
      </button>

      <p className="text-muted-foreground text-center text-xs">
        {chosen
          ? `Chose ${chosen}.`
          : "Type to filter, arrows to move, Enter to pick."}
      </p>

      <CommandPalette
        items={items}
        label="Search components"
        open={open}
        placeholder="Search components…"
        onOpenChange={setOpen}
        onSelect={(item) => setChosen(item.label)}
      />
    </div>
  )
}
