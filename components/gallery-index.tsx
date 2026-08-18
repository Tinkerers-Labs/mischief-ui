"use client"

import { componentDocs } from "@/lib/component-docs"
import { FloatingIndex } from "@/registry/default/floating-index/floating-index"

// Only the sections that exist on this page; the rest live in the catalog.
const items = [
  { id: "components", label: "Gallery" },
  { id: "catalog", label: `All ${componentDocs.length} components` },
]

export function GalleryIndex() {
  return (
    <FloatingIndex
      className="top-auto bottom-6 left-6 w-64 translate-x-0"
      items={items}
      label="On this page"
    />
  )
}
