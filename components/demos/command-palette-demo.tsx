"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { componentDocs } from "@/lib/component-docs"
import { CommandPalette } from "@/registry/default/command-palette/command-palette"
import { Kbd } from "@/registry/default/kbd/kbd"

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
        <Kbd keys="Mod+J" />
      </button>

      <p className="text-muted-foreground text-center text-xs">
        {chosen
          ? `Chose ${chosen}.`
          : "Type to filter, arrows to move, Enter to pick."}
      </p>

      {/* The site's own search already owns Mod+K, so this one takes its
          own chord rather than fighting for it. */}
      <CommandPalette
        items={items}
        label="Search components"
        open={open}
        placeholder="Search components…"
        shortcut="j"
        onOpenChange={setOpen}
        onSelect={(item) => setChosen(item.label)}
      />
    </div>
  )
}
