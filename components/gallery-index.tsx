"use client"

import { componentDocs } from "@/lib/component-docs"
import { FloatingIndex } from "@/registry/default/floating-index/floating-index"

const items = componentDocs.map((doc) => ({
  id: `component-${doc.slug}`,
  label: doc.name,
}))

export function GalleryIndex() {
  return (
    <FloatingIndex
      className="top-auto bottom-6 left-6 w-64 translate-x-0"
      items={items}
      label="Components"
    />
  )
}
