import type { Metadata } from "next"

import { ComponentCatalog } from "@/components/component-catalog"
import { DocsPager } from "@/components/docs-pager"
import { componentDocs, componentFamilies } from "@/lib/component-docs"
import { siteConfig } from "@/site.config"

export const metadata: Metadata = {
  title: `Components | ${siteConfig.name}`,
  description: `Every component in ${siteConfig.name}, grouped by family: agent surfaces, document viewers, controls, blocks, and scenes.`,
  alternates: { canonical: "/docs/components" },
}

export default function ComponentsPage() {
  return (
    <article className="docs-article docs-intro">
      <p className="eyebrow">Components</p>
      <h1>Everything here.</h1>
      <p className="docs-lead">
        {componentDocs.length} components across {componentFamilies.length}{" "}
        families. Search by name or by what it does, or narrow to one family and
        read it end to end.
      </p>

      <ComponentCatalog />

      <DocsPager href="/docs/components" />
    </article>
  )
}
