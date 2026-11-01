"use client"

import * as React from "react"

import {
  MessageQueue,
  type QueuedMessage,
} from "@/registry/default/message-queue/message-queue"
import { PromptInput } from "@/registry/default/prompt-input/prompt-input"

const initialQueue: QueuedMessage[] = [
  { id: "q1", text: "Then run the migration against the staging database." },
  { id: "q2", text: "Keep the old column until the backfill finishes." },
]

export function MessageQueueDemo() {
  const [busy, setBusy] = React.useState(true)
  const [queue, setQueue] = React.useState(initialQueue)
  const [sent, setSent] = React.useState<string[]>([
    "Add a nullable email column to the users table.",
  ])
  const nextId = React.useRef(3)

  React.useEffect(() => {
    if (!busy) return
    const timer = window.setTimeout(() => setBusy(false), 4000)
    return () => window.clearTimeout(timer)
  }, [busy])

  const send = (text: string) => {
    setSent((current) => [...current, text])
    setBusy(true)
  }

  return (
    <div className="grid w-full max-w-xl gap-3">
      <ol aria-label="Sent messages" className="grid gap-1.5">
        {sent.slice(-3).map((text, index) => (
          <li
            className="bg-muted text-foreground justify-self-end rounded-[var(--radius)] px-3 py-2 text-sm"
            key={`${index}-${text}`}
          >
            {text}
          </li>
        ))}
      </ol>

      <p className="text-muted-foreground text-xs" role="status">
        {busy ? "The agent is working." : "The agent is idle."}
      </p>

      <MessageQueue
        busy={busy}
        items={queue}
        onItemsChange={setQueue}
        onRelease={(item) => send(item.text)}
      />

      <PromptInput
        placeholder="Type a follow-up"
        status={busy ? "streaming" : "ready"}
        onStop={() => setBusy(false)}
        onSubmit={(text) => {
          if (busy) {
            setQueue((current) => [
              ...current,
              { id: `q${nextId.current++}`, text },
            ])
          } else {
            send(text)
          }
        }}
      />

      <p className="text-muted-foreground text-center text-xs">
        Enter adds to the queue while the agent works. Stopping it sends the
        next one.
      </p>
    </div>
  )
}
