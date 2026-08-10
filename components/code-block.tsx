"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false)
  const resetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current)
    },
    []
  )

  async function copyCode() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    if (resetTimer.current) clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className="docs-code-block">
      <pre>
        <code>{code}</code>
      </pre>
      <button
        aria-label={copied ? "Code copied" : "Copy code"}
        onClick={copyCode}
        title={copied ? "Copied" : "Copy code"}
        type="button"
      >
        {copied ? (
          <Check aria-hidden="true" size={16} />
        ) : (
          <Copy aria-hidden="true" size={16} />
        )}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Code copied to clipboard." : ""}
      </span>
    </div>
  )
}
