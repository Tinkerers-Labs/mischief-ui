"use client"

import * as React from "react"

import { pageImage, paymentRegion } from "@/components/demos/document-fixtures"
import {
  AnnotationLayer,
  type Annotation,
} from "@/registry/default/annotation-layer/annotation-layer"

export function AnnotationLayerDemo() {
  const [notes, setNotes] = React.useState<Annotation[]>([
    {
      id: "net30",
      ...paymentRegion,
      note: "Finance asked whether this should be net 45.",
      author: "Priya",
    },
  ])

  return (
    <AnnotationLayer
      className="w-full max-w-sm"
      alt="Master Services Agreement, page 1"
      annotations={notes}
      src={pageImage}
      onCreate={(rect) =>
        setNotes((current) => [
          ...current,
          { id: `note-${current.length + 1}`, ...rect, note: "New note" },
        ])
      }
      onDelete={(id) =>
        setNotes((current) => current.filter((note) => note.id !== id))
      }
    />
  )
}
