import type { Metadata } from "next"
import Link from "next/link"

import { DocsPager } from "@/components/docs-pager"
import { componentDocs, componentFamilies } from "@/lib/component-docs"
import { siteConfig } from "@/site.config"

export const metadata: Metadata = {
  title: `Documentation | ${siteConfig.name}`,
  description:
    "Install Mischief UI components through the shadcn registry or npm, then adapt the source for your React project.",
  alternates: { canonical: "/docs" },
}

export default function DocsPage() {
  return (
    <article className="docs-article docs-intro">
      <p className="eyebrow">Introduction</p>
      <h1>
        Growing collection.
        <br />
        High bar.
      </h1>
      <p className="docs-lead">
        {siteConfig.name} adds physical feedback and a little personality to
        familiar controls, and covers the rest of an app around them. Every
        component is open source, theme-aware, and usable with a keyboard,
        touch, pointer, or screen reader where applicable.
      </p>

      <section className="docs-section">
        <h2>Where to start</h2>
        <p>
          <Link className="detail-link" href="/docs/installation">
            Installation
          </Link>{" "}
          covers both paths in and the namespace that shortens them.{" "}
          <Link className="detail-link" href="/docs/components">
            Components
          </Link>{" "}
          is all {componentDocs.length} of them, searchable. If you would rather
          read what they are all held to, that is{" "}
          <Link className="detail-link" href="/interfaces">
            the guidelines
          </Link>
          .
        </p>
      </section>

      <section className="docs-section">
        <h2>
          The families
          <span className="docs-family-count">{componentFamilies.length}</span>
        </h2>
        <p>
          Each one is a page of its own, and reads end to end rather than as a
          list to search.
        </p>
        <div className="docs-component-list">
          {componentFamilies.map((family) => (
            <Link key={family.slug} href={`/docs/families/${family.slug}`}>
              <span>{family.components.length}</span>
              <strong>{family.name}</strong>
              <p>{family.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <DocsPager href="/docs" />
    </article>
  )
}
