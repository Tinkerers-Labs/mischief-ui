"use client"

import * as React from "react"

import { SidePanel } from "@/registry/default/side-panel/side-panel"

const button =
  "border-border hover:bg-muted inline-flex min-h-9 items-center rounded-full border px-3 text-sm"

export function SidePanelDemo() {
  const [side, setSide] = React.useState<"left" | "right" | null>(null)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button className={button} type="button" onClick={() => setSide("left")}>
        Open from the left
      </button>
      <button className={button} type="button" onClick={() => setSide("right")}>
        Open from the right
      </button>

      <SidePanel
        description="Everything we hold about this record."
        footer={
          <button
            className={button}
            type="button"
            onClick={() => setSide(null)}
          >
            Done
          </button>
        }
        open={side !== null}
        side={side ?? "right"}
        title="Northwind Traders"
        toolbar={
          <p className="text-muted-foreground text-xs">
            Pinned above the body, and it stays put.
          </p>
        }
        onOpenChange={(open) => !open && setSide(null)}
      >
        <div className="grid gap-3 text-sm">
          {Array.from({ length: 14 }, (_, index) => (
            <p key={index} className="text-muted-foreground">
              Line {index + 1} — the body scrolls while the header, the toolbar,
              and the footer stay where they are.
            </p>
          ))}
        </div>
      </SidePanel>
    </div>
  )
}
