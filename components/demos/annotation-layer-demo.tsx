"use client"

import * as React from "react"

import { pageImage } from "@/components/demos/document-fixtures"
import {
  AnnotationLayer,
  type Annotation,
} from "@/registry/default/annotation-layer/annotation-layer"

export function AnnotationLayerDemo() {
  const [notes, setNotes] = React.useState<Annotation[]>([
    {
      id: "terms",
      x: 0.08,
      y: 0.26,
      width: 0.55,
      height: 0.09,
      note: "Confirm the payment terms match the MSA.",
      author: "Priya",
    },
  ])

  return (
    <AnnotationLayer
      className="w-full max-w-sm"
      alt="Contract, page 2"
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
