"use client"

import { CopyForAi } from "@/registry/default/copy-for-ai/copy-for-ai"

const markdown = `# Hold Button

A confirmation button for actions that deserve a second thought.
`

export function CopyForAiDemo() {
  return (
    <CopyForAi
      markdown={markdown}
      markdownUrl="https://ui.tinkererslabs.com/md/hold-button.md"
    />
  )
}
