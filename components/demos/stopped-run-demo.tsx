"use client"

import * as React from "react"

import { StoppedRun } from "@/registry/default/stopped-run/stopped-run"

export function StoppedRunDemo() {
  const [reason, setReason] = React.useState<"stopped" | "error">("stopped")

  return (
    <div className="w-full max-w-lg space-y-3">
      <StoppedRun
        reason={reason}
        elapsed={7.4}
        onRetry={() => {}}
        onResume={reason === "stopped" ? () => {} : undefined}
      >
        <p>
          The retry helper backs off between attempts, so the fix is to keep the
          delay and remove the listener before adding it again. The reconnect
          path currently registers
        </p>
      </StoppedRun>

      <button
        type="button"
        onClick={() => setReason(reason === "stopped" ? "error" : "stopped")}
        className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-4"
      >
        Show it as {reason === "stopped" ? "a failure" : "a stop"}
      </button>
    </div>
  )
}
