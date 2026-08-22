"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type Step = {
  id: string
  label: string
  description?: string
}

export type StepperProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "children" | "onSelect"
> & {
  steps: readonly Step[]
  /** Index of the step being worked on. */
  current: number
  orientation?: "horizontal" | "vertical"
  /** Lets a finished step be revisited. */
  onSelect?: (index: number, step: Step) => void
  label?: string
}

/**
 * Where someone is in something with a beginning and an end. The position is
 * written out as well as drawn, so the progress does not live only in the
 * colour of a circle.
 */
export function Stepper({
  steps,
  current,
  orientation = "horizontal",
  onSelect,
  label = "Progress",
  className,
  ...rootProps
}: StepperProps) {
  const horizontal = orientation === "horizontal"

  return (
    <nav aria-label={label} data-slot="stepper" {...rootProps}>
      <ol
        className={cn(
          "flex",
          horizontal ? "flex-row items-start" : "flex-col",
          className
        )}
      >
        {steps.map((step, index) => {
          const done = index < current
          const active = index === current
          const state = done ? "done" : active ? "active" : "todo"
          const reachable = done && onSelect !== undefined

          const marker = (
            <span
              className={cn(
                "inline-flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors duration-200 motion-reduce:transition-none",
                done && "bg-foreground text-background border-transparent",
                active && "border-foreground text-foreground",
                !done && !active && "border-border text-muted-foreground"
              )}
            >
              {done ? <Check aria-hidden="true" size={14} /> : index + 1}
            </span>
          )

          return (
            <li
              key={step.id}
              data-slot="stepper-step"
              data-state={state}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex gap-3",
                horizontal ? "flex-1 flex-col" : "pb-6 last:pb-0"
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-3",
                  horizontal ? "w-full" : "flex-col"
                )}
              >
                {reachable ? (
                  <button
                    type="button"
                    className="focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:outline-none"
                    onClick={() => onSelect(index, step)}
                  >
                    <span className="sr-only">Go back to {step.label}</span>
                    {marker}
                  </button>
                ) : (
                  marker
                )}

                {index < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "bg-border",
                      horizontal ? "h-px flex-1" : "w-px flex-1",
                      done && "bg-foreground"
                    )}
                  />
                )}
              </div>

              <div className={cn(horizontal ? "pr-4" : "pb-2")}>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    !done && !active && "text-muted-foreground"
                  )}
                >
                  {step.label}
                  <span className="sr-only">
                    {done
                      ? ", finished"
                      : active
                        ? ", in progress"
                        : ", not started"}
                  </span>
                </p>

                {step.description && (
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {step.description}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
