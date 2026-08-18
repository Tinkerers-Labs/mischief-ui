"use client"

import * as React from "react"

import {
  PdfViewer,
  type PdfDocumentHandle,
} from "@/registry/default/pdf-viewer/pdf-viewer"

/**
 * The demo paints its own pages so the docs stay readable without shipping a
 * PDF engine to every visitor. A real usage passes `source` instead.
 */
function samplePages(count: number): PdfDocumentHandle {
  return {
    pageCount: count,
    async getPage(pageNumber) {
      return {
        width: 420,
        height: 560,
        async render(canvas, scale) {
          const context = canvas.getContext("2d")
          if (!context) return

          canvas.width = 420 * scale
          canvas.height = 560 * scale
          context.scale(scale, scale)

          context.fillStyle = "#fbfaf8"
          context.fillRect(0, 0, 420, 560)

          context.fillStyle = "#ded8d0"
          context.fillRect(40, 48, 150, 26)
          for (let row = 0; row < 14; row += 1) {
            const width = row % 4 === 3 ? 190 : 340
            context.fillRect(40, 110 + row * 26, width, 9)
          }

          context.fillStyle = "#8a8279"
          context.font = "600 13px ui-monospace, monospace"
          context.fillText(`Page ${pageNumber}`, 40, 530)
        },
      }
    },
  }
}

export function PdfViewerDemo() {
  const document = React.useMemo(() => samplePages(6), [])

  return <PdfViewer className="w-full max-w-md" document={document} />
}
