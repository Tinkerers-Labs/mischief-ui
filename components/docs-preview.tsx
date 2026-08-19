"use client"

import { componentDemos } from "@/components/demos"
import { ExternalLink } from "@/components/external-link"
import { GitHubIcon } from "@/components/github-icon"
import { ComponentPreview } from "@/registry/default/component-preview/component-preview"

export function DocsPreview({
  slug,
  code,
  sourceUrl,
}: {
  slug: string
  code: string
  sourceUrl: string
}) {
  const demo = componentDemos[slug]

  if (!demo) return null

  return (
    <ComponentPreview
      className="component-preview-panel"
      code={code}
      frameClassName={`demo-frame docs-preview ${demo.frameClassName ?? ""}`}
      actions={
        <ExternalLink className="component-preview-source" href={sourceUrl}>
          <GitHubIcon aria-hidden="true" size={14} />
          Source
        </ExternalLink>
      }
    >
      <demo.Demo />
    </ComponentPreview>
  )
}
