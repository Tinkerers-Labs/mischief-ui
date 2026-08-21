import * as React from "react"

import { cn } from "@/lib/utils"

export type StatusTone = "ok" | "warn" | "down" | "idle"

export type StatusPillProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "children"
> & {
  children: React.ReactNode
  tone?: StatusTone
  /** Makes the pill a link, for a status page or a health check. */
  href?: string
  /** A quiet line rather than a pill. */
  plain?: boolean
}

const dot: Record<StatusTone, string> = {
  ok: "bg-accent",
  warn: "bg-[color-mix(in_oklab,var(--destructive)_55%,var(--accent))]",
  down: "bg-destructive",
  idle: "bg-muted-foreground",
}

/**
 * A dot and a few words: all systems operational, market closed, degraded.
 * The words carry it -- the dot is decoration, so the state is never told by
 * colour alone.
 */
export function StatusPill({
  children,
  tone = "ok",
  href,
  plain = false,
  className,
  ...rootProps
}: StatusPillProps) {
  const content = (
    <>
      <span
        aria-hidden="true"
        data-slot="status-pill-dot"
        className={cn("size-1.5 shrink-0 rounded-full", dot[tone])}
      />
      {children}
    </>
  )

  const shape = cn(
    "inline-flex items-center gap-2 text-xs",
    plain
      ? "text-muted-foreground"
      : "border-border bg-card text-muted-foreground min-h-8 rounded-full border px-2.5",
    href &&
      "hover:text-foreground transition-colors duration-150 no-underline motion-reduce:transition-none",
    className
  )

  if (href) {
    return (
      <a data-slot="status-pill" data-tone={tone} href={href} className={shape}>
        {content}
      </a>
    )
  }

  return (
    <span
      data-slot="status-pill"
      data-tone={tone}
      className={shape}
      {...rootProps}
    >
      {content}
    </span>
  )
}
