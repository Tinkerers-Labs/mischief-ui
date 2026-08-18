"use client"

import * as React from "react"

import { DemoVariants } from "@/components/demos/demo-variants"
import { RestartButton } from "@/components/demos/restart-button"
import { DiffView } from "@/registry/default/diff-view/diff-view"

const before = `export function total(items) {
  let sum = 0

  for (const item of items) {
    sum += item.price
  }

  return sum
}`

const after = `export function total(items, { taxRate = 0 } = {}) {
  let sum = 0

  for (const item of items) {
    sum += item.price * item.quantity
  }

  return sum * (1 + taxRate)
}`

function Decision() {
  const [status, setStatus] = React.useState<
    "pending" | "accepted" | "rejected"
  >("pending")

  return (
    <div className="grid gap-4">
      <DiffView
        filename="lib/total.ts"
        before={before}
        after={after}
        status={status}
        onAccept={() => setStatus("accepted")}
        onReject={() => setStatus("rejected")}
      />

      {status === "pending" ? null : (
        <RestartButton onClick={() => setStatus("pending")} />
      )}
    </div>
  )
}

export function DiffViewDemo() {
  return (
    <DemoVariants
      label="Diff layout"
      variants={[
        { id: "decide", label: "To review", render: () => <Decision /> },
        {
          id: "unified",
          label: "Unified",
          render: () => (
            <DiffView filename="lib/total.ts" before={before} after={after} />
          ),
        },
        {
          id: "split",
          label: "Split",
          render: () => (
            <DiffView
              filename="lib/total.ts"
              before={before}
              after={after}
              view="split"
            />
          ),
        },
      ]}
    />
  )
}
