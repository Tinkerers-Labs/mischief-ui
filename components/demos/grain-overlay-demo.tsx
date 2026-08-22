"use client"

import { GrainOverlay } from "@/registry/default/grain-overlay/grain-overlay"

export function GrainOverlayDemo() {
  return (
    <div className="border-border relative isolate w-full max-w-md overflow-hidden rounded-[var(--radius)] border">
      <div className="from-primary/70 to-background bg-gradient-to-br px-6 py-14">
        <h3 className="text-2xl font-semibold">Reel one, take four</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          A flat gradient bands on wide screens. The grain hides the steps and
          gives the panel a surface.
        </p>
      </div>
      <GrainOverlay />
    </div>
  )
}
