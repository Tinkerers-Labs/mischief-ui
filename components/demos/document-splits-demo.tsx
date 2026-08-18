"use client"

import { samplePages } from "@/components/demos/document-fixtures"
import { DocumentSplits } from "@/registry/default/document-splits/document-splits"

export function DocumentSplitsDemo() {
  return (
    <DocumentSplits
      className="w-full max-w-xl"
      pages={samplePages}
      defaultSplitAfter={[2]}
    />
  )
}
