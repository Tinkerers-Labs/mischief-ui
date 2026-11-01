"use client"

import {
  LinkPreview,
  type LinkPreviewData,
} from "@/registry/default/link-preview/link-preview"

const pages: Record<string, LinkPreviewData> = {
  "/docs/components/floating-index": {
    title: "Floating Index",
    description:
      "A compact outline for long pages. It keeps the active section and reading progress visible without becoming another permanent sidebar.",
    image: "/demo/gallery/floating-index.png",
  },
  "/docs/components/shift-button": {
    title: "Shift Button",
    description:
      "A call to action that trades its leading icon for a directional cue when someone approaches it.",
    image: "/demo/gallery/shift-button.png",
  },
}

async function loadPreview(href: string) {
  await new Promise((resolve) => setTimeout(resolve, 700))
  const page = pages[href]
  if (!page) throw new Error(`No preview for ${href}`)
  return page
}

export function LinkPreviewDemo() {
  return (
    <div className="w-full max-w-[34rem] text-sm leading-relaxed">
      <p>
        Long pages need a way to see where you are. The{" "}
        <LinkPreview
          href="/docs/components/floating-index"
          loadPreview={loadPreview}
        >
          Floating Index
        </LinkPreview>{" "}
        keeps the outline close without taking a column, and a{" "}
        <LinkPreview
          href="/docs/components/shift-button"
          preview={pages["/docs/components/shift-button"]}
        >
          Shift Button
        </LinkPreview>{" "}
        at the end tells people what comes next.
      </p>
      <p className="text-muted-foreground mt-3 text-xs">
        Rest the pointer on a link, or tab to it. The first preview loads, the
        second is already known. On a touch screen the links simply open.
      </p>
    </div>
  )
}
