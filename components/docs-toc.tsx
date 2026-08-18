"use client"

import * as React from "react"

export type TocSection = { id: string; label: string }

/** How far below the sticky header a heading counts as reached. */
const ACTIVATION_OFFSET = 96

/**
 * Highlights the section the reader is in. Sections are tall and uneven, so
 * this tracks which heading was passed most recently rather than which box
 * happens to intersect a band.
 */
export function DocsToc({
  sections,
  label = "On this page",
}: {
  sections: readonly TocSection[]
  label?: string
}) {
  const [activeId, setActiveId] = React.useState(sections[0]?.id ?? null)

  React.useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0

      const targets = sections
        .map((section) => document.getElementById(section.id))
        .filter((element): element is HTMLElement => element !== null)

      if (targets.length === 0) return

      // The last section that has already scrolled past the header wins.
      let current = targets[0]!.id
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= ACTIVATION_OFFSET) {
          current = target.id
        }
      }

      // The final section is often too short to ever reach the offset, so
      // hitting the bottom of the page selects it outright.
      const atEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2

      setActiveId(atEnd ? targets.at(-1)!.id : current)
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
  }, [sections])

  return (
    <aside className="component-toc" aria-label={label}>
      <p>{label}</p>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          data-active={section.id === activeId || undefined}
          aria-current={section.id === activeId ? "location" : undefined}
        >
          {section.label}
        </a>
      ))}
    </aside>
  )
}
