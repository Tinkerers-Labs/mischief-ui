"use client"

import { ConstellationField } from "@/registry/default/constellation-field/constellation-field"

export function ConstellationFieldDemo() {
  return (
    <ConstellationField className="border-border bg-card w-full max-w-xl rounded-[var(--radius)] border">
      <div className="px-8 py-16 text-center">
        <h3 className="text-2xl font-semibold">Move your pointer across it</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          The points nearest the pointer brighten and swell. Everything else
          keeps drifting.
        </p>
      </div>
    </ConstellationField>
  )
}
