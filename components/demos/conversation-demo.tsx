"use client"

import * as React from "react"

import { Conversation } from "@/registry/default/conversation/conversation"
import { Message } from "@/registry/default/message/message"

/** Stands in for a real profile picture, and is deliberately not square. */
const portrait =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 72">
      <rect width="120" height="72" fill="#d8cfc4"/>
      <circle cx="60" cy="30" r="15" fill="#8a7f72"/>
      <path d="M28 72c4-18 18-26 32-26s28 8 32 26z" fill="#8a7f72"/>
    </svg>`
  )

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
          avatar={
            turn.role === "user" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" src={portrait} />
            ) : (
              "M"
            )
          }
        >
          {turn.text}
        </Message>
      ))}
    </Conversation>
  )
}
