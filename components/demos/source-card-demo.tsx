"use client"

import { SourceCard } from "@/registry/default/source-card/source-card"

const results = [
  {
    id: "wcag",
    title: "Understanding Success Criterion 2.5.8: Target Size (Minimum)",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html",
    snippet:
      "The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except where spacing, equivalents, or inline targets apply.",
    score: 0.94,
  },
  {
    id: "aria",
    title: "ARIA Authoring Practices: Combobox Pattern",
    url: "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/",
    snippet:
      "A combobox is an input that controls another element, such as a listbox, that can dynamically pop up to help the user set its value.",
    score: 0.71,
  },
]

export function SourceCardDemo() {
  return (
    <div className="grid w-full max-w-xl gap-2">
      {results.map((result, index) => (
        <SourceCard
          key={result.id}
          index={index + 1}
          title={result.title}
          url={result.url}
          snippet={result.snippet}
          score={result.score}
        />
      ))}
    </div>
  )
}
