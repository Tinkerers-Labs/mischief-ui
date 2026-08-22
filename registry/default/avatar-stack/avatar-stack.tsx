"use client"

/* eslint-disable @next/next/no-img-element -- This must work outside Next.js. */

import * as React from "react"
import { cn } from "@/lib/utils"

export type Person = {
  id?: string
  name: string
  src?: string
}

export type AvatarStackProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  people: readonly Person[]
  /** How many faces to show before the rest become a count. */
  max?: number
  size?: number
  /** Fans the stack out under the pointer. */
  spread?: boolean
  label?: string
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
}

/**
 * Overlapping faces with a count for the rest. The names are a real list
 * underneath, so the group is readable rather than being a row of pictures
 * with nothing behind them.
 */
export function AvatarStack({
  people,
  max = 4,
  size = 32,
  spread = true,
  label = "People",
  className,
  ...rootProps
}: AvatarStackProps) {
  const shown = people.slice(0, max)
  const rest = people.length - shown.length

  return (
    <div
      data-slot="avatar-stack"
      className={cn("group flex items-center", className)}
      {...rootProps}
    >
      <ul aria-label={label} className="flex items-center">
        {shown.map((person, index) => (
          <li
            key={person.id ?? person.name}
            className={cn(
              "ring-background relative rounded-full ring-2 transition-[margin] duration-200 ease-out motion-reduce:transition-none",
              index > 0 && "-ml-2.5",
              spread && index > 0 && "group-hover:ml-0.5"
            )}
            style={{ zIndex: shown.length - index }}
          >
            {person.src ? (
              <img
                src={person.src}
                alt={person.name}
                width={size}
                height={size}
                className="block rounded-full object-cover"
                style={{ width: size, height: size }}
              />
            ) : (
              <span
                className="bg-muted text-foreground flex items-center justify-center rounded-full font-semibold"
                style={{ width: size, height: size, fontSize: size * 0.36 }}
              >
                <span aria-hidden="true">{initials(person.name)}</span>
                <span className="sr-only">{person.name}</span>
              </span>
            )}
          </li>
        ))}
      </ul>

      {rest > 0 && (
        <span
          data-slot="avatar-stack-rest"
          className="bg-foreground text-background ring-background relative -ml-2.5 flex items-center justify-center rounded-full font-semibold ring-2 transition-[margin] duration-200 ease-out group-hover:ml-0.5 motion-reduce:transition-none"
          style={{ width: size, height: size, fontSize: size * 0.34 }}
        >
          <span aria-hidden="true">+{rest}</span>
          <span className="sr-only">and {rest} more</span>
        </span>
      )}
    </div>
  )
}
