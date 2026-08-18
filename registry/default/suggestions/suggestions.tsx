"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type Suggestion = {
  id: string
  label: React.ReactNode
  prompt?: string
  icon?: React.ReactNode
}

export type SuggestionsProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "children" | "onSelect"
> & {
  suggestions: Suggestion[]
  onSelect?: (suggestion: Suggestion) => void
  label?: string
  disabled?: boolean
}

export function Suggestions({
  suggestions,
  onSelect,
  label = "Suggested prompts",
  disabled = false,
  className,
  ...rootProps
}: SuggestionsProps) {
  if (suggestions.length === 0) return null

  return (
    <nav
      data-slot="suggestions"
      aria-label={label}
      className={cn("min-w-0", className)}
      {...rootProps}
    >
      <ul className="flex snap-x gap-2 overflow-x-auto pb-1">
        {suggestions.map((suggestion) => (
          <li key={suggestion.id} className="snap-start">
            <button
              type="button"
              data-slot="suggestion"
              disabled={disabled}
              className="border-border hover:bg-muted focus-visible:ring-ring inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 text-sm whitespace-nowrap focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
              onClick={() => onSelect?.(suggestion)}
            >
              {suggestion.icon ? (
                <span aria-hidden="true" className="text-muted-foreground">
                  {suggestion.icon}
                </span>
              ) : null}
              {suggestion.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
