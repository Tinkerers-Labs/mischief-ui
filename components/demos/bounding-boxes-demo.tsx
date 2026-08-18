"use client"

import * as React from "react"

import { invoiceBoxes } from "@/components/demos/document-fixtures"
import { BoundingBoxes } from "@/registry/default/bounding-boxes/bounding-boxes"

const page =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
      <rect width="300" height="400" fill="#fbfaf8"/>
      <rect x="24" y="34" width="96" height="26" rx="3" fill="#e6e1da"/>
      <rect x="186" y="38" width="82" height="18" rx="3" fill="#e6e1da"/>
      <g fill="#ded8d0">
        <rect x="24" y="96" width="252" height="7" rx="3"/>
        <rect x="24" y="114" width="214" height="7" rx="3"/>
        <rect x="24" y="132" width="236" height="7" rx="3"/>
        <rect x="24" y="168" width="252" height="7" rx="3"/>
        <rect x="24" y="186" width="188" height="7" rx="3"/>
        <rect x="24" y="204" width="228" height="7" rx="3"/>
        <rect x="24" y="240" width="160" height="7" rx="3"/>
      </g>
      <rect x="174" y="296" width="96" height="30" rx="3" fill="#e6e1da"/>
    </svg>`
  )

export function BoundingBoxesDemo() {
  const [active, setActive] = React.useState<string | null>("total")
  const label = invoiceBoxes.find((box) => box.id === active)?.label

  return (
    <div className="grid w-full max-w-sm gap-3">
      <BoundingBoxes
        alt="Invoice, page 1"
        boxes={invoiceBoxes}
        src={page}
        activeId={active}
        onActiveChange={setActive}
      />
      <p className="text-muted-foreground text-center text-xs">
        {label ? `Selected: ${label}` : "Select a region on the page."}
      </p>
    </div>
  )
}
