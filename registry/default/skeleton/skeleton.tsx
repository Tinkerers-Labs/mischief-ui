import * as React from "react"

import { cn } from "@/lib/utils"

export type SkeletonProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Render this many bars, the last one short, as a block of text would be. */
  lines?: number
}

/**
 * A placeholder the shape of what is coming, so a page does not jump when it
 * arrives. Spinner says work is under way; this says the content is not here
 * yet, and holds its place.
 */
export function Skeleton({ lines, className, ...rootProps }: SkeletonProps) {
  const bar =
    "bg-muted animate-pulse rounded-[calc(var(--radius)-0.35rem)] motion-reduce:animate-none"

  if (lines === undefined) {
    return (
      <div
        aria-hidden="true"
        data-slot="skeleton"
        className={cn(bar, "h-4 w-full", className)}
        {...rootProps}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      data-slot="skeleton"
      className={cn("grid gap-2", className)}
      {...rootProps}
    >
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className={cn(bar, "h-4", index === lines - 1 && "w-3/5")}
        />
      ))}
    </div>
  )
}
