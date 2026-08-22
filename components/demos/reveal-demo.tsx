"use client"

import { Reveal } from "@/registry/default/reveal/reveal"

const rows = [
  "It waits until it is on screen",
  "Then it arrives, one after another",
  "And it stays where it landed",
]

export function RevealDemo() {
  return (
    <div className="border-border h-64 w-full max-w-md overflow-y-auto rounded-[var(--radius)] border p-6">
      <div className="text-muted-foreground grid h-40 place-items-center text-xs">
        Scroll down
      </div>

      <div className="grid gap-3">
        {rows.map((row, index) => (
          <Reveal
            key={row}
            delay={index * 90}
            repeat
            className="border-border bg-card rounded-[var(--radius)] border p-4 text-sm"
          >
            {row}
          </Reveal>
        ))}
      </div>

      <div className="h-24" />
    </div>
  )
}
