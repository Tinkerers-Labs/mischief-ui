"use client"

import { JsonViewer } from "@/registry/default/json-viewer/json-viewer"

const response = {
  id: "run_8f21c",
  model: "claude-opus-5",
  status: "completed",
  usage: { input: 4182, output: 663, cacheRead: 3900 },
  tools: [
    {
      name: "search_contracts",
      ok: true,
      duration: 412,
      input: { query: "renewal window", limit: 3 },
      output: {
        matches: [
          { id: "acme-msa", score: 0.94, page: 12 },
          { id: "northwind-sow", score: 0.71, page: 4 },
        ],
      },
    },
    {
      name: "summarise",
      ok: false,
      duration: 1180,
      error: "The document had no extractable text layer.",
    },
  ],
  citations: [],
  finishedAt: "2026-08-25T09:14:02Z",
}

export function JsonViewerDemo() {
  return (
    <JsonViewer
      className="w-full max-w-xl"
      value={response}
      rootName="response"
      defaultExpandedDepth={2}
    />
  )
}
