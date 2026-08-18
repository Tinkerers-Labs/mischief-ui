"use client"

import * as React from "react"

import { Conversation } from "@/registry/default/conversation/conversation"
import { Message } from "@/registry/default/message/message"

const turns = [
  { id: 1, role: "user" as const, text: "Why is the migration failing?" },
  {
    id: 2,
    role: "assistant" as const,
    text: "The unique index is created before the backfill runs, so rows still holding a null email collide.",
  },
  { id: 3, role: "user" as const, text: "Can you reorder it?" },
  {
    id: 4,
    role: "assistant" as const,
    text: "Yes. Moving the backfill above the index is enough, and the test suite passes after that.",
  },
  { id: 5, role: "user" as const, text: "What about existing rows?" },
  {
    id: 6,
    role: "assistant" as const,
    text: "They are covered by the same backfill, so nothing else needs to change.",
  },
]

export function ConversationDemo() {
  return (
    <Conversation className="border-border bg-background h-72 w-full max-w-xl rounded-[var(--radius)] border px-3">
      {turns.map((turn) => (
        <Message
          key={turn.id}
          role={turn.role}
          avatar={turn.role === "user" ? "You" : "M"}
        >
          {turn.text}
        </Message>
      ))}
    </Conversation>
  )
}
