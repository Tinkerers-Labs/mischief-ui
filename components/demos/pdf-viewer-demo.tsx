"use client"

import { PDF_WORKER, SAMPLE_PDF } from "@/components/demos/document-fixtures"
import { PdfViewer } from "@/registry/default/pdf-viewer/pdf-viewer"

export function PdfViewerDemo() {
  return (
    <PdfViewer
      className="w-full max-w-md"
      source={SAMPLE_PDF}
      workerSrc={PDF_WORKER}
      label="Master Services Agreement"
    />
  )
}
