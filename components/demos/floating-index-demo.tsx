"use client"

import * as React from "react"
import { BookOpen, CheckCircle2, SlidersHorizontal } from "lucide-react"

import { FloatingIndex } from "@/registry/default/floating-index/floating-index"

const items = [
  {
    id: "floating-index-introduction",
    label: "Introduction",
    icon: <BookOpen aria-hidden="true" />,
  },
  {
    id: "floating-index-behavior",
    label: "Behavior",
    icon: <SlidersHorizontal aria-hidden="true" />,
  },
  {
    id: "floating-index-finish",
    label: "Finish",
    icon: <CheckCircle2 aria-hidden="true" />,
  },
]

const sections = [
  {
    id: "floating-index-introduction",
    kicker: "01",
    title: "Keep your place.",
    copy: "The index stays close while the page keeps moving.",
  },
  {
    id: "floating-index-behavior",
    kicker: "02",
    title: "See where you are.",
    copy: "Open it for the full outline, or glance at the progress ring.",
  },
  {
    id: "floating-index-finish",
    kicker: "03",
    title: "Jump without getting lost.",
    copy: "Choose a section and the index follows you there.",
  },
]

export function FloatingIndexDemo() {
  const containerRef = React.useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className="bg-background relative h-[28rem] w-full max-w-xl overflow-y-auto rounded-[var(--radius)] border"
    >
      <FloatingIndex
        items={items}
        containerRef={containerRef}
        className="sticky top-4 left-auto mx-auto translate-x-0"
      />

      <div className="-mt-11">
        {sections.map((section, index) => (
          <section
            className="flex min-h-[25rem] scroll-mt-4 flex-col justify-end border-b p-8 last:border-b-0"
            id={section.id}
            key={section.id}
          >
            <p className="text-primary text-xs font-bold tracking-[0.08em]">
              {section.kicker}
            </p>
            <h3 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-[-0.04em]">
              {section.title}
            </h3>
            <p className="text-muted-foreground mt-3 max-w-sm leading-relaxed">
              {section.copy}
            </p>
            {index === 0 && (
              <p className="text-muted-foreground mt-8 text-xs">
                Scroll this frame to try it.
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
