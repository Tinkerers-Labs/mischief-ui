"use client"

import * as React from "react"

import { DemoVariants } from "@/components/demos/demo-variants"
import { ApprovalCard } from "@/registry/default/approval-card/approval-card"

function Question() {
  return (
    <ApprovalCard
      className="mx-auto max-w-md"
      question="How many flavors should we launch with?"
      options={[
        { id: "three", label: "Three", description: "The core line." },
        { id: "five", label: "Five", description: "The full case." },
        { id: "one", label: "Just one hero" },
      ]}
      freeform
      onDismiss={() => undefined}
    />
  )
}

function Destructive() {
  const [key, setKey] = React.useState(0)

  return (
    <ApprovalCard
      key={key}
      className="mx-auto max-w-md"
      question="Delete 40 files the agent flagged as unused?"
      description="This cannot be undone from here."
      options={[
        {
          id: "delete",
          label: "Delete all 40",
          description: "Hold to confirm.",
          destructive: true,
        },
        { id: "review", label: "Show me the list first" },
      ]}
      onApprove={() => window.setTimeout(() => setKey((n) => n + 1), 1600)}
    />
  )
}

function Answered() {
  return (
    <ApprovalCard
      className="mx-auto max-w-md"
      question="How many flavors should we launch with?"
      options={[{ id: "three", label: "Three (core line)" }]}
      answerId="three"
    />
  )
}

export function ApprovalCardDemo() {
  return (
    <DemoVariants
      label="Approval card state"
      variants={[
        { id: "question", label: "Question", render: () => <Question /> },
        {
          id: "destructive",
          label: "Destructive",
          render: () => <Destructive />,
        },
        { id: "answered", label: "Answered", render: () => <Answered /> },
      ]}
    />
  )
}
