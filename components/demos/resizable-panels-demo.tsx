"use client"

import { ResizablePanels } from "@/registry/default/resizable-panels/resizable-panels"

export function ResizablePanelsDemo() {
  return (
    <ResizablePanels
      className="border-border h-56 w-full max-w-xl rounded-[var(--radius)] border"
      defaultSize={38}
      first={
        <nav className="p-4">
          <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            Files
          </p>
          <ul className="mt-3 grid gap-2 text-sm">
            <li>index.tsx</li>
            <li>styles.css</li>
            <li>readme.md</li>
          </ul>
        </nav>
      }
      second={
        <div className="p-4">
          <p className="text-sm font-semibold">index.tsx</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Drag the divider, or put focus on it and use the arrow keys.
          </p>
        </div>
      }
    />
  )
}
