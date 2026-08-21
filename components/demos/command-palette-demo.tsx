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
  const [query, setQuery] = React.useState("")
  const [applied, setApplied] = React.useState({ query: "", hits: items })

  // Loading is the gap between what was typed and what has been answered, so
  // nothing has to be set at the moment the effect runs.
  const loading = open && query.trim() !== applied.query

  // Stands in for a search endpoint: the wait is real, the results are local.
  React.useEffect(() => {
    if (!open) return

    const needle = query.trim().toLowerCase()
    const timer = setTimeout(() => {
      setApplied({
        query: query.trim(),
        hits: needle
          ? items.filter((item) => item.label.toLowerCase().includes(needle))
          : items,
      })
    }, 350)

    return () => clearTimeout(timer)
  }, [query, open])

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
      {/* The results arrive from somewhere else, so the palette does not
          rank them again and says it is searching while they are in flight. */}
      <CommandPalette
        items={applied.hits}
        filter={false}
        label="Search components"
        loading={loading}
        open={open}
        placeholder="Search components…"
        shortcut="j"
        onOpenChange={setOpen}
        onQueryChange={setQuery}
        onSelect={(item) => setChosen(item.label)}
      />
    </div>
  )
}
