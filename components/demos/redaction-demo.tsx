"use client"

import * as React from "react"

import { pageImage } from "@/components/demos/document-fixtures"
import {
  Redaction,
  type RedactionRegion,
} from "@/registry/default/redaction/redaction"

export function RedactionDemo() {
  const [regions, setRegions] = React.useState<RedactionRegion[]>([
    {
      id: "acct",
      x: 0.08,
      y: 0.4,
      width: 0.42,
      height: 0.05,
      reason: "Account number",
    },
    {
      id: "name",
      x: 0.08,
      y: 0.09,
      width: 0.34,
      height: 0.07,
      reason: "Customer name",
    },
  ])

  return (
    <Redaction
      className="w-full max-w-sm"
      alt="Statement, page 1"
      regions={regions}
      src={pageImage}
      onCreate={(rect) =>
        setRegions((current) => [
          ...current,
          { id: `region-${current.length + 1}`, ...rect },
        ])
      }
      onDelete={(id) =>
        setRegions((current) => current.filter((region) => region.id !== id))
      }
    />
  )
}
