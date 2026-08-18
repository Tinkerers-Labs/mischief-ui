"use client"

import { Copy, RefreshCw } from "lucide-react"

import { Message } from "@/registry/default/message/message"

function Action({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="hover:text-foreground focus-visible:ring-ring inline-flex size-7 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
    >
      {icon}
    </button>
  )
}

export function MessageDemo() {
  return (
    <div className="w-full max-w-xl">
      <Message role="user" avatar="You" timestamp="2:14 PM">
        Can you check the migration before I merge it?
      </Message>

      <Message
        role="assistant"
        avatar="M"
        timestamp="2:14 PM"
        actions={
          <>
            <Action icon={<Copy aria-hidden="true" size={13} />} label="Copy" />
            <Action
              icon={<RefreshCw aria-hidden="true" size={13} />}
              label="Regenerate"
            />
          </>
        }
      >
        The index is created before the backfill runs, so any row still holding
        a null email will collide. Reordering the two statements fixes it.
      </Message>
    </div>
  )
}
