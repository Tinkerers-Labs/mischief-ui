"use client"

import * as React from "react"
import { ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type ConversationProps = React.HTMLAttributes<HTMLDivElement> & {
  stickToBottom?: boolean
  threshold?: number
  jumpLabel?: string
  showJumpButton?: boolean
  onFollowChange?: (following: boolean) => void
}

/** How close to the bottom still counts as "reading the latest message". */
const DEFAULT_THRESHOLD = 48

export function Conversation({
  stickToBottom = true,
  threshold = DEFAULT_THRESHOLD,
  jumpLabel = "Jump to latest",
  showJumpButton = true,
  onFollowChange,
  children,
  className,
  ...rootProps
}: ConversationProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [following, setFollowing] = React.useState(stickToBottom)
  const [above, setAbove] = React.useState(false)

  const report = React.useRef(onFollowChange)
  React.useEffect(() => {
    report.current = onFollowChange
  })

  const atBottom = React.useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return true

    const distance =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight

    return distance <= threshold
  }, [threshold])

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior) => {
    const viewport = viewportRef.current
    if (!viewport) return

    viewport.scrollTo({ top: viewport.scrollHeight, behavior })
  }, [])

  // Following is driven by where the reader is, so it is only ever changed
  // from a scroll event or a resize, never during render.
  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const onScroll = () => {
      setAbove(viewport.scrollTop > 1)
      if (!stickToBottom) return

      const next = atBottom()
      setFollowing((current) => {
        if (current === next) return current
        report.current?.(next)
        return next
      })
    }

    viewport.addEventListener("scroll", onScroll, { passive: true })
    return () => viewport.removeEventListener("scroll", onScroll)
  }, [stickToBottom, atBottom])

  // New content arrives constantly while a reply streams, so follow the
  // bottom only while the reader has not scrolled away from it.
  React.useEffect(() => {
    const content = contentRef.current
    if (!content || !stickToBottom) return

    const observer = new ResizeObserver(() => {
      if (!following) return
      scrollToBottom("auto")
    })

    observer.observe(content)
    return () => observer.disconnect()
  }, [stickToBottom, following, scrollToBottom])

  const jump = () => {
    setFollowing(true)
    report.current?.(true)
    scrollToBottom("smooth")
  }

  return (
    <div
      data-slot="conversation"
      data-following={following || undefined}
      className={cn("relative min-h-0", className)}
      {...rootProps}
    >
      <div
        ref={viewportRef}
        data-slot="conversation-viewport"
        className="h-full overflow-y-auto overscroll-contain"
      >
        <div ref={contentRef} data-slot="conversation-content">
          {children}
        </div>
      </div>

      {/* A thread scrolled down cuts its top line in half, which reads as a
          rendering fault rather than as there being more above it. */}
      <div
        aria-hidden="true"
        data-slot="conversation-fade"
        className={cn(
          "from-background pointer-events-none absolute inset-x-0 top-0 h-8 rounded-t-[inherit] bg-gradient-to-b to-transparent transition-opacity duration-150 motion-reduce:transition-none",
          above ? "opacity-100" : "opacity-0"
        )}
      />

      {showJumpButton && stickToBottom ? (
        <button
          type="button"
          data-slot="conversation-jump"
          aria-hidden={following || undefined}
          tabIndex={following ? -1 : undefined}
          className={cn(
            "bg-foreground text-background focus-visible:ring-ring absolute bottom-3 left-1/2 inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold shadow-md transition-[opacity,transform] duration-200 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
            following
              ? "pointer-events-none -translate-x-1/2 translate-y-1 opacity-0"
              : "-translate-x-1/2 opacity-100"
          )}
          onClick={jump}
        >
          <ArrowDown aria-hidden="true" size={13} />
          {jumpLabel}
        </button>
      ) : null}
    </div>
  )
}
