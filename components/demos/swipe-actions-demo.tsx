"use client"

import * as React from "react"
import { Archive, Mail, MailOpen, Trash2 } from "lucide-react"

import {
  SwipeActions,
  SwipeActionsItem,
} from "@/registry/default/swipe-actions/swipe-actions"

type Message = {
  id: string
  from: string
  subject: string
  preview: string
  time: string
  unread: boolean
}

const inbox: Message[] = [
  {
    id: "lease",
    from: "Marta Alves",
    subject: "Lease renewal for flat 3B",
    preview: "The new terms start in March. I attached the signed copy.",
    time: "9:41",
    unread: true,
  },
  {
    id: "dentist",
    from: "Riverside Dental",
    subject: "Your appointment on Thursday",
    preview: "Reply C to confirm or call us to move it.",
    time: "8:15",
    unread: true,
  },
  {
    id: "photos",
    from: "Tomás Reyes",
    subject: "Photos from Sunday",
    preview: "Forty-two of them. The one with the dog is the best.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "library",
    from: "City Library",
    subject: "Two books due next week",
    preview: "You can renew them online up to three times.",
    time: "Mon",
    unread: false,
  },
]

export function SwipeActionsDemo() {
  const [messages, setMessages] = React.useState(inbox)
  const [last, setLast] = React.useState<{
    verb: string
    message: Message
    index: number
  } | null>(null)

  const remove = (message: Message, verb: string) => {
    const index = messages.findIndex((item) => item.id === message.id)
    setLast({ verb, message, index })
    setMessages(messages.filter((item) => item.id !== message.id))
  }

  const toggleRead = (message: Message) =>
    setMessages((current) =>
      current.map((item) =>
        item.id === message.id ? { ...item, unread: !item.unread } : item
      )
    )

  return (
    <div className="w-full max-w-[26rem]">
      <SwipeActions label="Inbox">
        {messages.map((message) => (
          <SwipeActionsItem
            key={message.id}
            label={message.subject}
            leading={[
              {
                label: message.unread ? "Read" : "Unread",
                icon: message.unread ? <MailOpen /> : <Mail />,
                tone: "primary",
                onSelect: () => toggleRead(message),
              },
            ]}
            trailing={[
              {
                label: "Delete",
                icon: <Trash2 />,
                tone: "destructive",
                onSelect: () => remove(message, "Deleted"),
              },
              {
                label: "Archive",
                icon: <Archive />,
                onSelect: () => remove(message, "Archived"),
              },
            ]}
          >
            <div className="grid gap-0.5 px-4 py-3">
              <div className="flex items-baseline gap-2">
                <span
                  aria-hidden="true"
                  className={
                    message.unread
                      ? "bg-primary size-2 shrink-0 self-center rounded-full"
                      : "size-2 shrink-0"
                  }
                />
                <span
                  className={
                    message.unread
                      ? "min-w-0 flex-1 truncate text-sm font-semibold"
                      : "min-w-0 flex-1 truncate text-sm font-medium"
                  }
                >
                  {message.from}
                  {message.unread ? (
                    <span className="sr-only">, unread</span>
                  ) : null}
                </span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {message.time}
                </span>
              </div>
              <p className="truncate pl-4 text-sm">{message.subject}</p>
              <p className="text-muted-foreground truncate pl-4 text-xs">
                {message.preview}
              </p>
            </div>
          </SwipeActionsItem>
        ))}
      </SwipeActions>

      {messages.length === 0 ? (
        <p className="text-muted-foreground mt-3 text-sm">Inbox is empty.</p>
      ) : null}

      <div
        className="mt-3 flex min-h-8 items-center justify-between gap-3 text-sm"
        role="status"
      >
        {last ? (
          <>
            <span className="text-muted-foreground truncate">
              {last.verb} “{last.message.subject}”
            </span>
            <button
              type="button"
              className="text-primary focus-visible:ring-ring shrink-0 rounded-sm font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
              onClick={() => {
                setMessages((current) => {
                  const next = [...current]
                  next.splice(last.index, 0, last.message)
                  return next
                })
                setLast(null)
              }}
            >
              Undo
            </button>
          </>
        ) : (
          <span className="text-muted-foreground">
            Swipe a message, or use its More actions button.
          </span>
        )}
      </div>
    </div>
  )
}
