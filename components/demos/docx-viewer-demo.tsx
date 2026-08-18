"use client"

import * as React from "react"

import { SAMPLE_DOCX } from "@/components/demos/document-fixtures"
import { DocxViewer } from "@/registry/default/docx-viewer/docx-viewer"

export function DocxViewerDemo() {
  const [file, setFile] = React.useState<ArrayBuffer>()

  React.useEffect(() => {
    const controller = new AbortController()

    void fetch(SAMPLE_DOCX, { signal: controller.signal })
      .then((response) => response.arrayBuffer())
      .then((buffer) => setFile(buffer))
      .catch(() => undefined)

    return () => controller.abort()
  }, [])

  return <DocxViewer className="w-full max-w-2xl" source={file} />
}
