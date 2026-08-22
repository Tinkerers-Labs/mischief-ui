"use client"

import { CursorTrail } from "@/registry/default/cursor-trail/cursor-trail"

export function CursorTrailDemo() {
  return (
    <CursorTrail className="border-border bg-card grid h-56 w-full max-w-md place-items-center rounded-[var(--radius)] border">
      <p className="text-muted-foreground text-sm">
        Move the pointer through here
      </p>
    </CursorTrail>
  )
}
