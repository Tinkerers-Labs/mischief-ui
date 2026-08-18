"use client"

import * as React from "react"

import {
  agreementRegion,
  customerRegion,
  pageImage,
} from "@/components/demos/document-fixtures"
import {
  Redaction,
  type RedactionRegion,
} from "@/registry/default/redaction/redaction"

export function RedactionDemo() {
  const [regions, setRegions] = React.useState<RedactionRegion[]>([
    { id: "customer", ...customerRegion, reason: "Customer name" },
    {
      id: "agreement-no",
      ...agreementRegion,
      reason: "Agreement number",
    },
  ])

  return (
    <Redaction
      className="w-full max-w-sm"
      alt="Master Services Agreement, page 1"
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
