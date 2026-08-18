"use client"

import * as React from "react"

import { invoiceBoxes, pageImage } from "@/components/demos/document-fixtures"
import { BoundingBoxes } from "@/registry/default/bounding-boxes/bounding-boxes"

export function BoundingBoxesDemo() {
  const [active, setActive] = React.useState<string | null>("net30")
  const label = invoiceBoxes.find((box) => box.id === active)?.label

  return (
    <div className="grid w-full max-w-sm gap-3">
      <BoundingBoxes
        alt="Master Services Agreement, page 1"
        boxes={invoiceBoxes}
        src={pageImage}
        activeId={active}
        onActiveChange={setActive}
      />
      <p className="text-muted-foreground text-center text-xs">
        {label ? `Selected: ${label}` : "Select a region on the page."}
      </p>
    </div>
  )
}
