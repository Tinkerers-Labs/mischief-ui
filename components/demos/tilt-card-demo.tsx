"use client"

import { TiltCard } from "@/registry/default/tilt-card/tilt-card"

export function TiltCardDemo() {
  return (
    <TiltCard glare className="w-full max-w-xs p-6">
      <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
        Boarding pass
      </p>
      <p className="mt-3 text-2xl font-semibold">Reykjavik</p>
      <p className="text-muted-foreground mt-1 text-sm">
        Seat 4A, window, wing behind you.
      </p>
      <p className="text-muted-foreground mt-6 text-xs">
        Point at the card and it leans toward you.
      </p>
    </TiltCard>
  )
}
