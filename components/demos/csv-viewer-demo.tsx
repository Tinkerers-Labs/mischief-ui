"use client"

import { CsvViewer } from "@/registry/default/csv-viewer/csv-viewer"

const table = {
  fields: ["invoice", "vendor", "issued", "amount"],
  rows: [
    ["INV-1042", "Northwind Traders", "2026-07-02", "1240.00"],
    ["INV-1043", "Acme Supply", "2026-07-04", "98.50"],
    ["INV-1044", "Contoso Ltd", "2026-07-09", "17300.00"],
    ["INV-1045", "Northwind Traders", "2026-07-11", "640.25"],
    ["INV-1046", "Fabrikam", "2026-07-18", "3.99"],
    ["INV-1047", "Acme Supply", "2026-07-21", "512.00"],
  ],
}

export function CsvViewerDemo() {
  return <CsvViewer className="w-full max-w-2xl" table={table} maxRows={5} />
}
