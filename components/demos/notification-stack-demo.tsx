"use client"

import * as React from "react"
import {
  CalendarClock,
  GitBranch,
  HardDrive,
  MessageSquare,
} from "lucide-react"

import {
  NotificationStack,
  type NotificationStackItem,
} from "@/registry/default/notification-stack/notification-stack"

const initial: NotificationStackItem[] = [
  {
    id: "comment",
    title: "New comment on Launch checklist",
    description: "Can we move the beta date to Thursday?",
    time: "2m ago",
    icon: <MessageSquare size={16} />,
  },
  {
    id: "build",
    title: "Build passed on main",
    description: "All 3 checks finished in 4 minutes.",
    time: "9m ago",
    icon: <GitBranch size={16} />,
  },
  {
    id: "meeting",
    title: "Design review starts in 15 minutes",
    description: "Room 4 and the video link are in the invite.",
    time: "12m ago",
    icon: <CalendarClock size={16} />,
  },
  {
    id: "storage",
    title: "Storage is almost full",
    description: "9.2 GB of 10 GB used. Old exports can be removed.",
    time: "1h ago",
    icon: <HardDrive size={16} />,
  },
]

const later: NotificationStackItem = {
  id: "reply",
  title: "Reply on Launch checklist",
  description: "Thursday works. I will update the plan.",
  time: "Just now",
  icon: <MessageSquare size={16} />,
}

const action =
  "border-border hover:bg-muted focus-visible:ring-ring/50 min-h-9 rounded-[var(--radius)] border px-3 text-sm outline-none focus-visible:ring-4 disabled:opacity-50"

export function NotificationStackDemo() {
  const [items, setItems] = React.useState(initial)
  const replied = items.some((item) => item.id === later.id)

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <NotificationStack
        items={items}
        onDismiss={(id) =>
          setItems((list) => list.filter((item) => item.id !== id))
        }
        onClearAll={() => setItems([])}
      />
      <div className="flex flex-wrap gap-2 pt-8">
        <button
          type="button"
          className={action}
          disabled={replied}
          onClick={() => setItems((list) => [later, ...list])}
        >
          Get a reply
        </button>
        <button
          type="button"
          className={action}
          onClick={() => setItems(initial)}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
