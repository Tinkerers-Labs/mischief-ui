"use client"

import * as React from "react"

import { CopyButton } from "@/registry/default/copy-button/copy-button"

const key = "sk_live_7f3a91c2b8e04d5aa1"

export function CopyButtonDemo() {
  const [copied, setCopied] = React.useState(0)

  return (
    <div className="grid w-full max-w-md gap-4">
      <div className="border-border bg-muted/40 flex items-center gap-2 rounded-[calc(var(--radius)+0.15rem)] border px-3 py-2">
        <code className="min-w-0 flex-1 truncate font-[family-name:var(--font-mono),monospace] text-xs">
          {key}
        </code>
        <CopyButton value={key} onCopied={() => setCopied((n) => n + 1)} />
      </div>

      <CopyButton
        className="border-border w-fit border px-3"
        value={key}
        onCopied={() => setCopied((n) => n + 1)}
      >
        Copy key
      </CopyButton>

      <p className="text-muted-foreground text-xs" role="status">
        {copied === 0 ? "Not copied yet" : `Copied ${copied}×`}
      </p>
    </div>
  )
}
