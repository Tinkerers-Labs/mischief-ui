"use client"

import { FileText, Inbox } from "lucide-react"

import { DemoVariants } from "@/components/demos/demo-variants"
import { EmptyState } from "@/registry/default/empty-state/empty-state"

const button =
  "border-border text-foreground hover:bg-muted min-h-9 rounded-md border px-3 text-xs"

export function EmptyStateDemo() {
  return (
    <DemoVariants
      label="Empty state"
      variants={[
        {
          id: "documents",
          label: "With an action",
          render: () => (
            <EmptyState
              icon={<FileText aria-hidden="true" size={18} />}
              title="No documents yet"
              description="Upload a PDF and it will show up here, ready to split, redact, or sign."
              actions={
                <button className={button} type="button">
                  Upload a file
                </button>
              }
            />
          ),
        },
        {
          id: "compact",
          label: "Compact",
          render: () => (
            <EmptyState
              size="sm"
              icon={<Inbox aria-hidden="true" size={16} />}
              title="Nothing to review"
            />
          ),
        },
      ]}
    />
  )
}
