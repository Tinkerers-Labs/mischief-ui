"use client"

import { ComponentPreview } from "@/registry/default/component-preview/component-preview"
import { HoldButton } from "@/registry/default/hold-button/hold-button"

const source = `<HoldButton onComplete={remove}>
  Delete everything
</HoldButton>`

export function ComponentPreviewDemo() {
  return (
    <div className="w-full max-w-xl">
      <ComponentPreview code={source} title="Hold Button">
        <HoldButton onComplete={() => {}}>Delete everything</HoldButton>
      </ComponentPreview>
    </div>
  )
}
