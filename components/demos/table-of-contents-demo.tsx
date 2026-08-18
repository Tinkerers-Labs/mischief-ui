"use client"

import * as React from "react"

import { TableOfContents } from "@/registry/default/table-of-contents/table-of-contents"

const sections = [
  { id: "toc-demo-install", label: "Install" },
  { id: "toc-demo-usage", label: "Usage" },
  { id: "toc-demo-api", label: "API" },
]

export function TableOfContentsDemo() {
  return (
    <div className="grid w-full max-w-lg gap-4 sm:grid-cols-[1fr_9rem]">
      <div className="border-border h-64 overflow-y-auto rounded-[var(--radius)] border p-4">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="mb-6 last:mb-0">
            <h3 className="text-sm font-semibold">{section.label}</h3>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              Scroll this panel to watch the outline keep up. Sections here are
              deliberately uneven, which is what makes the tracking worth doing
              properly.
            </p>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              The outline marks whichever heading was passed most recently.
            </p>
          </section>
        ))}
      </div>

      <TableOfContents className="hidden sm:grid" sections={sections} />
    </div>
  )
}
