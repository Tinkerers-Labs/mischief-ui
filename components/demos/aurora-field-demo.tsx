"use client"

import { AuroraField } from "@/registry/default/aurora-field/aurora-field"

export function AuroraFieldDemo() {
  return (
    <AuroraField className="border-border w-full max-w-xl rounded-[var(--radius)] border">
      <div className="px-8 py-16 text-center">
        <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
          Now in beta
        </p>
        <h3 className="mt-3 text-3xl font-semibold text-balance">
          Ship the interface you actually sketched
        </h3>
        <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm">
          The colours come from your theme, so this panel looks like the rest of
          your application.
        </p>
      </div>
    </AuroraField>
  )
}
