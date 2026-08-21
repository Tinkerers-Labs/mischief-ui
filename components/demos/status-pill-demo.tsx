"use client"

import { StatusPill } from "@/registry/default/status-pill/status-pill"

export function StatusPillDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <StatusPill>All systems operational</StatusPill>
      <StatusPill tone="warn">Degraded: search is slow</StatusPill>
      <StatusPill tone="down">Ingest is down</StatusPill>
      <StatusPill tone="idle" plain>
        Market closed
      </StatusPill>
    </div>
  )
}
