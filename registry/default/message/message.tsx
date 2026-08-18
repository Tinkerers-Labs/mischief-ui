"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type MessageRole = "user" | "assistant" | "system"

export type MessageProps = React.HTMLAttributes<HTMLElement> & {
  role: MessageRole
  name?: React.ReactNode
  avatar?: React.ReactNode
  timestamp?: React.ReactNode
  actions?: React.ReactNode
  pending?: boolean
}

const roleName: Record<MessageRole, string> = {
  user: "You",
  assistant: "Assistant",
  system: "System",
}

export function Message({
  role,
  name,
  avatar,
  timestamp,
  actions,
  pending = false,
  children,
  className,
  ...rootProps
}: MessageProps) {
  const label = name ?? roleName[role]

  return (
    <article
      data-slot="message"
      data-role={role}
      aria-busy={pending || undefined}
      className={cn(
        "group/message flex gap-3 px-1 py-3",
        role === "user" && "flex-row-reverse",
        className
      )}
      {...rootProps}
    >
      {avatar ? (
        <span
          aria-hidden="true"
          data-slot="message-avatar"
          className="bg-muted text-muted-foreground mt-0.5 flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold"
        >
          {avatar}
        </span>
      ) : null}

      <div
        className={cn(
          "flex min-w-0 flex-col gap-1",
          role === "user" ? "items-end" : "items-start"
        )}
      >
        <p className="sr-only">{label}</p>

        <div
          data-slot="message-body"
          className={cn(
            "max-w-[42rem] min-w-0 text-sm leading-relaxed",
            role === "user" &&
              "bg-muted rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-left",
            role === "system" && "text-muted-foreground italic"
          )}
        >
          {children}
        </div>

        {timestamp || actions ? (
          <div
            data-slot="message-meta"
            className="text-muted-foreground flex items-center gap-2 text-xs"
          >
            {timestamp ? <span>{timestamp}</span> : null}
            {actions ? (
              <span
                data-slot="message-actions"
                className="opacity-0 transition-opacity duration-150 group-focus-within/message:opacity-100 group-hover/message:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100"
              >
                {actions}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}
