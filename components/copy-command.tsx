"use client"

import * as React from "react"
import { Check, Clipboard } from "lucide-react"

export function CopyCommand({
  command,
  label,
}: {
  command: string
  label?: string
}) {
  const [copied, setCopied] = React.useState(false)

  async function copyCommand() {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <button className="install-command" onClick={copyCommand} type="button">
      {label && <span className="command-label">{label}</span>}
      <code>{command}</code>
      {copied ? (
        <Check aria-label="Copied" size={16} />
      ) : (
        <Clipboard aria-label="Copy" size={16} />
      )}
    </button>
  )
}
