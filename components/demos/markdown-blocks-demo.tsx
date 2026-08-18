"use client"

import { MarkdownBlocks } from "@/registry/default/markdown-blocks/markdown-blocks"

const blocks = [
  {
    id: "title",
    kind: "heading" as const,
    page: 1,
    content: "# Master Services Agreement",
  },
  {
    id: "intro",
    kind: "paragraph" as const,
    page: 1,
    content:
      "This agreement is made between **Northwind Traders** and the supplier named below, effective on the date of the last signature.",
  },
  {
    id: "terms",
    kind: "table" as const,
    page: 2,
    content:
      "| Term | Value |\n| --- | --- |\n| Net | 30 days |\n| Currency | USD |",
  },
  {
    id: "notes",
    kind: "list" as const,
    page: 2,
    content:
      "- Late payment accrues 1.5% monthly\n- Disputed lines pause the clock",
  },
]

export function MarkdownBlocksDemo() {
  return <MarkdownBlocks className="w-full max-w-2xl" blocks={blocks} />
}
