"use client"

import * as React from "react"

import { ScrollToTopButton } from "@/registry/default/scroll-to-top-button/scroll-to-top-button"

const sections = [
  ["Start with the purpose", "Say what the page helps someone do."],
  ["Keep the path clear", "One primary action is usually enough."],
  ["Show the real thing", "A working example beats another promise."],
  ["Answer the practical bits", "Cover setup, ownership, and access."],
  ["Finish usefully", "End with the next step and a way back."],
] as const

export function ScrollToTopDemo() {
  const containerRef = React.useRef<HTMLDivElement>(null)

  return (
    <div className="bg-background border-border relative h-80 w-full max-w-[32rem] overflow-hidden rounded-[1.25rem] border shadow-sm">
      <div
        className="h-full overflow-y-auto px-5 py-6 md:px-8"
        ref={containerRef}
      >
        <p className="text-muted-foreground text-sm font-semibold">
          A short page about long pages
        </p>
        <h3 className="mt-2 text-2xl font-semibold">
          Give every section a job.
        </h3>
        <div className="mt-8 grid gap-10 pb-8">
          {sections.map(([title, description], index) => (
            <section className="border-border border-t pt-5" key={title}>
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.08em] uppercase">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h4 className="mt-2 font-semibold">{title}</h4>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                {description}
              </p>
            </section>
          ))}
        </div>
      </div>
      <ScrollToTopButton
        className="absolute right-4 bottom-4"
        containerRef={containerRef}
        showAfter={120}
      />
    </div>
  )
}
