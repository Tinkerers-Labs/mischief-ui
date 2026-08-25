"use client"

import * as React from "react"

import { Response } from "@/registry/default/response/response"

const answer = `The renewal is **automatic** unless notice is given.

- Notice window: 60 days
- Governing law: \`England and Wales\`

\`\`\`ts
const renews = !noticeGiven(contract, { days: 60 })
\`\`\`

Ask again if you want the clause quoted in full.`

export function ResponseDemo() {
  const [shown, setShown] = React.useState(answer.length)
  const [streaming, setStreaming] = React.useState(false)

  React.useEffect(() => {
    if (!streaming) return

    const timer = setInterval(() => {
      setShown((n) => {
        if (n >= answer.length) {
          setStreaming(false)
          return n
        }
        return n + 3
      })
    }, 24)

    return () => clearInterval(timer)
  }, [streaming])

  return (
    <div className="w-full max-w-md space-y-3">
      <Response streaming={streaming}>{answer.slice(0, shown)}</Response>
      <button
        type="button"
        className="border-border hover:bg-muted focus-visible:ring-ring inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold focus-visible:ring-2 focus-visible:outline-none"
        onClick={() => {
          setShown(0)
          setStreaming(true)
        }}
      >
        Stream it again
      </button>
    </div>
  )
}
