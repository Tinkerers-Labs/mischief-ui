import * as React from "react"

import { cn } from "@/lib/utils"

export type EmptyStateProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> & {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  /** Controls placed under the description, such as a primary action. */
  actions?: React.ReactNode
  size?: "sm" | "md"
}

export function EmptyState({
  title,
  description,
  icon,
  actions,
  size = "md",
  children,
  className,
  ...rootProps
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "border-border/70 flex flex-col items-center justify-center rounded-[calc(var(--radius)+0.15rem)] border border-dashed text-center",
        size === "sm" ? "gap-2 px-4 py-8" : "gap-3 px-6 py-14",
        className
      )}
      {...rootProps}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="border-border bg-muted/60 text-muted-foreground mb-1 flex size-11 items-center justify-center rounded-full border"
        >
          {icon}
        </span>
      ) : null}

      <p className="text-foreground text-sm font-medium">{title}</p>

      {description ? (
        <p className="text-muted-foreground max-w-[42ch] text-sm leading-relaxed">
          {description}
        </p>
      ) : null}

      {actions ? (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {actions}
        </div>
      ) : null}

      {children}
    </div>
  )
}
