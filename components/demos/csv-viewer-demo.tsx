"use client"

import * as React from "react"

import { SAMPLE_CSV } from "@/components/demos/document-fixtures"
import { CsvViewer } from "@/registry/default/csv-viewer/csv-viewer"

export function CsvViewerDemo() {
  const [csv, setCsv] = React.useState<string>()

  React.useEffect(() => {
    const controller = new AbortController()

    void fetch(SAMPLE_CSV, { signal: controller.signal })
      .then((response) => response.text())
      .then((text) => setCsv(text))
      .catch(() => undefined)

    return () => controller.abort()
  }, [])

  return <CsvViewer className="w-full max-w-2xl" source={csv} maxRows={6} />
}
