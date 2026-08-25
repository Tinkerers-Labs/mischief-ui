"use client"

import { WebPreview } from "@/registry/default/web-preview/web-preview"

export function WebPreviewDemo() {
  return (
    <div className="w-full max-w-2xl">
      <WebPreview
        src="/docs/components/kbd"
        title="The Kbd documentation page"
        defaultSize="tablet"
        height={360}
      />
    </div>
  )
}
