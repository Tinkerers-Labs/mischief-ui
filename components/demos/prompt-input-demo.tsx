"use client"

import * as React from "react"

import { PromptInput } from "@/registry/default/prompt-input/prompt-input"

export function PromptInputDemo() {
  const [sent, setSent] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<"ready" | "streaming">("ready")

  React.useEffect(() => {
    if (status !== "streaming") return

    const timer = window.setTimeout(() => setStatus("ready"), 2600)
    return () => window.clearTimeout(timer)
  }, [status])

  return (
    <div className="grid w-full max-w-xl gap-3">
      <PromptInput
        status={status}
        onSubmit={(value) => {
          setSent(value)
          setStatus("streaming")
        }}
        onStop={() => setStatus("ready")}
      />

      <p className="text-muted-foreground text-center text-xs">
        {status === "streaming"
          ? "Replying… press stop to cancel."
          : sent
            ? `Sent: ${sent}`
            : "Enter sends. Shift+Enter starts a new line."}
      </p>
    </div>
  )
}
