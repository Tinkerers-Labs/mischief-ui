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
          <Link className="detail-link" href="/docs/guidelines">
            the guidelines
          </Link>
          .
        </p>
      </section>

      <section className="docs-section">
        <h2>The component set</h2>
        <p>
          Almost everything here is React and Tailwind CSS and nothing else.
          Icons come from Lucide, which is what most of the collection reaches
          for. Five components are built on Base UI where a real primitive is
          worth having — a dialog, a popover — and four use Motion where the
          movement is the component.
        </p>
        <p>
          The heavier libraries belong to the one component that needs them:
          pdfjs-dist to the PDF viewer, mammoth to the DOCX viewer, papaparse to
          the CSV viewer, three to the two scenes that need a renderer. Every
          one of those is an optional peer, so installing a button does not
          bring a PDF engine with it, and nothing you did not ask for ends up in
          your bundle.
        </p>
        <p>
          Start with{" "}
          <Link className="detail-link" href="/docs/components">
            Components
          </Link>{" "}
          for the full list, or read{" "}
          <Link className="detail-link" href="/docs/guidelines">
            Guidelines
          </Link>{" "}
          for what they are all held to.
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
            <Link key={family.slug} href={`/families/${family.slug}`}>
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
