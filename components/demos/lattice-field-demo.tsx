"use client"

import { LatticeField } from "@/registry/default/lattice-field/lattice-field"

export function LatticeFieldDemo() {
  return (
    <LatticeField className="border-border bg-card w-full max-w-xl rounded-[var(--radius)] border">
      <div className="px-8 py-16 text-center">
        <h3 className="text-2xl font-semibold">Press it and watch it drop</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          The grid parts around your pointer. Press once to break it, press
          again to let it climb back.
        </p>
      </div>
    </LatticeField>
  )
}
