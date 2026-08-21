"use client"

import * as React from "react"

import { SidePanel } from "@/registry/default/side-panel/side-panel"

const button =
  "border-border hover:bg-muted inline-flex min-h-9 items-center rounded-full border px-3 text-sm"

export function SidePanelDemo() {
  const [open, setOpen] = React.useState(false)
  const [child, setChild] = React.useState(false)
  const [beside, setBeside] = React.useState(false)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button className={button} type="button" onClick={() => setOpen(true)}>
        Open a panel
      </button>
      <button className={button} type="button" onClick={() => setBeside(true)}>
        Open one you can work beside
      </button>

      <SidePanel
        description="Open another from inside it; this one stays visible behind."
        footer={
          <button
            className={button}
            type="button"
            onClick={() => setOpen(false)}
          >
            Done
          </button>
        }
        open={open}
        title="Northwind Traders"
        onOpenChange={setOpen}
      >
        <div className="grid gap-3 text-sm">
          <button
            className={button}
            type="button"
            onClick={() => setChild(true)}
          >
            Open the invoice
          </button>
          {Array.from({ length: 12 }, (_, index) => (
            <p key={index} className="text-muted-foreground">
              Line {index + 1} — the body scrolls while the header and footer
              stay where they are.
            </p>
          ))}

          <SidePanel
            open={child}
            title="Invoice 4021"
            onOpenChange={setChild}
            footer={
              <button
                className={button}
                type="button"
                onClick={() => setChild(false)}
              >
                Back
              </button>
            }
          >
            <p className="text-muted-foreground text-sm">
              Opened from inside the panel behind it, and set in from the edge
              so that one is still there.
            </p>
          </SidePanel>
        </div>
      </SidePanel>

      <SidePanel
        description="The page behind stays scrollable and clickable."
        hideBackdrop
        modal="trap-focus"
        open={beside}
        title="Inspector"
        onOpenChange={setBeside}
      >
        <p className="text-muted-foreground text-sm">
          Focus is still kept inside, so tabbing does not wander off into the
          page. Nothing behind is locked.
        </p>
      </SidePanel>
    </div>
  )
}
