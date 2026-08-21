import * as React from "react"

import { cn } from "@/lib/utils"

export type SpinnerProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "children"
> & {
  size?: number
  /**
   * Announced while it turns. Without one the spinner is decoration, which is
   * right when the text beside it already says what is happening.
   */
  label?: string
}

/**
 * The smallest way to say something is happening: a control that is working,
 * a row that is refreshing. Skeleton is for content that has not arrived;
 * this is for work that is under way.
 */
export function Spinner({
  size = 16,
  label,
  className,
  ...rootProps
}: SpinnerProps) {
  return (
    <span
      data-slot="spinner"
      role={label ? "status" : undefined}
      aria-hidden={label ? undefined : "true"}
      className={cn("inline-flex items-center", className)}
      {...rootProps}
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        aria-hidden="true"
        /* Reduced motion stops the turn; the ring stays, so the control still
           reads as busy rather than as an unexplained circle. */
        className="animate-spin motion-reduce:animate-none"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2.5"
          className="opacity-20"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  )
}
