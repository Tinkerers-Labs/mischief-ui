"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type TocSection = {
  id: string
  label: string
}

export type TableOfContentsProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> & {
  sections: readonly TocSection[]
  label?: string
  /** How far below the top a heading counts as reached, in pixels. */
  offset?: number
  onActiveChange?: (id: string | null) => void
}

export function TableOfContents({
  sections,
  label = "On this page",
  offset = 96,
  onActiveChange,
  className,
  ...rootProps
}: TableOfContentsProps) {
  const [activeId, setActiveId] = React.useState(sections[0]?.id ?? null)

  const report = React.useRef(onActiveChange)
  React.useEffect(() => {
    report.current = onActiveChange
  })

  React.useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0

      const targets = sections
        .map((section) => document.getElementById(section.id))
        .filter((element): element is HTMLElement => element !== null)

      if (targets.length === 0) return

      // Sections are tall and uneven, so this tracks the heading most recently
      // passed rather than whichever box happens to intersect a band.
      let current = targets[0]!.id
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= offset) current = target.id
      }

      // A short last section may never reach the line, so the end of the page
      // selects it outright.
      const atEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2

      const next = atEnd ? targets.at(-1)!.id : current

      setActiveId((previous) => {
        if (previous !== next) report.current?.(next)
        return next
      })
    }

    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    schedule()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [sections, offset])

  return (
    <nav
      data-slot="table-of-contents"
      aria-label={label}
      className={cn("grid gap-1.5", className)}
      {...rootProps}
    >
      <p className="text-foreground text-xs font-bold tracking-[0.06em]">
        {label}
      </p>

      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          data-slot="table-of-contents-link"
          data-active={section.id === activeId || undefined}
          aria-current={section.id === activeId ? "location" : undefined}
          className={cn(
            "text-muted-foreground hover:text-foreground data-[active]:text-foreground py-0.5 text-sm no-underline transition-colors duration-150 data-[active]:font-semibold motion-reduce:transition-none"
          )}
        >
          {section.label}
        </a>
      ))}
    </nav>
  )
}
