"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import { componentDocs } from "@/lib/component-docs"
import { CommandPalette } from "@/registry/default/command-palette/command-palette"

const items = componentDocs.map((component) => ({
  id: component.slug,
  label: component.name,
  description: component.summary,
  group: component.family,
  keywords: [component.slug, component.kind],
}))

export function SiteSearch() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <button
        type="button"
        data-slot="site-search-trigger"
        aria-label="Search components"
        aria-keyshortcuts="Meta+K Control+K"
        className="group focus-visible:ring-ring inline-flex h-11 items-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
        onClick={() => setOpen(true)}
      >
        {/* The tap target stays 44px while the visible field stays small. */}
        <span className="bg-muted/70 text-muted-foreground group-hover:bg-muted group-hover:text-foreground inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-colors duration-150 motion-reduce:transition-none">
          <Search aria-hidden="true" size={13} className="shrink-0" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="border-border/70 text-muted-foreground/80 ml-0.5 hidden rounded border px-1 font-[family-name:var(--font-mono),monospace] text-[0.6rem] leading-[1.35] lg:inline">
            ⌘K
          </kbd>
        </span>
      </button>

      <CommandPalette
        items={items}
        label="Search components"
        open={open}
        placeholder="Search components…"
        onOpenChange={setOpen}
        onSelect={(item) => router.push(`/docs/components/${item.id}`)}
      />
    </>
  )
}
