"use client"

import { DocxViewer } from "@/registry/default/docx-viewer/docx-viewer"

const converted = {
  html: `<h1>Master Services Agreement</h1>
<p>This agreement is made between <strong>Northwind Traders</strong> and the supplier named below.</p>
<h3>1. Payment terms</h3>
<p>Invoices are due <em>net 30</em> from the date of issue. See the <a href="https://example.com/terms">published terms</a>.</p>
<ul><li>Late payment accrues 1.5% monthly.</li><li>Disputed lines pause the clock.</li></ul>
<table><thead><tr><th>Term</th><th>Value</th></tr></thead>
<tbody><tr><td>Net</td><td>30 days</td></tr><tr><td>Currency</td><td>USD</td></tr></tbody></table>`,
}

export function DocxViewerDemo() {
  return <DocxViewer className="w-full max-w-2xl" result={converted} />
}
