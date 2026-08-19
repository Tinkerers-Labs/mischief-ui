"use client"

import { Accordion } from "@/registry/default/accordion/accordion"

const items = [
  {
    id: "licence",
    title: "Is it free to use?",
    content:
      "Yes. Everything here is MIT licensed, for personal and commercial work alike. Keep the notice and you are done.",
  },
  {
    id: "theme",
    title: "Will it match my theme?",
    content:
      "Components use semantic shadcn tokens, so they inherit whatever background, foreground, and border you already have.",
  },
  {
    id: "registry",
    title: "Registry or npm?",
    content:
      "Take the source through the registry when you plan to change it. Install from npm when you would rather have versioned updates.",
  },
]

export function AccordionDemo() {
  return (
    <div className="w-full max-w-lg">
      <Accordion items={items} defaultOpen={["licence"]} />
    </div>
  )
}
