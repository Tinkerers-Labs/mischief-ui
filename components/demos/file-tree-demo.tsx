"use client"

import { FileTree } from "@/registry/default/file-tree/file-tree"

const nodes = [
  {
    id: "contracts",
    name: "contracts",
    kind: "folder" as const,
    children: [
      {
        id: "2026",
        name: "2026",
        kind: "folder" as const,
        children: [
          { id: "acme", name: "acme-msa.pdf", meta: "1.2 MB" },
          { id: "northwind", name: "northwind-sow.pdf", meta: "840 KB" },
        ],
      },
      { id: "archive", name: "archive", kind: "folder" as const, children: [] },
    ],
  },
  {
    id: "invoices",
    name: "invoices",
    kind: "folder" as const,
    children: [{ id: "jan", name: "january.pdf", meta: "94 KB" }],
  },
  { id: "readme", name: "readme.md", meta: "2 KB" },
]

export function FileTreeDemo() {
  return (
    <FileTree
      className="w-full max-w-sm"
      nodes={nodes}
      defaultExpandedIds={["contracts", "2026"]}
      defaultSelectedId="acme"
    />
  )
}
