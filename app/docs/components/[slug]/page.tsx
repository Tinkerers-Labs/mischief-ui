import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ComponentPreview } from "@/components/component-preview"
import { ExternalLink } from "@/components/external-link"
import { InstallPanel } from "@/components/install-panel"
import { componentDocs, getComponentDoc } from "@/lib/component-docs"
import { componentSourceUrl, siteConfig } from "@/site.config"

export function generateStaticParams() {
  return componentDocs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const component = getComponentDoc((await params).slug)
  return {
    title: component
      ? `${component.name} | ${siteConfig.name}`
      : `Component | ${siteConfig.name}`,
    description: component?.summary,
  }
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const component = getComponentDoc((await params).slug)
  if (!component) notFound()

  return (
    <article className="docs-article component-doc">
      <p className="eyebrow">
        {component.number} / {component.family}
      </p>
      <h1>{component.name}</h1>
      <p className="docs-lead">{component.summary}</p>

      <div className="demo-frame docs-preview">
        <ComponentPreview slug={component.slug} />
      </div>

      <section className="docs-section">
        <h2>Install</h2>
        <p>Copy the source into your project, or keep it behind a package.</p>
        <InstallPanel
          npmImport={component.npmImport}
          shadcnCommand={component.install}
        />
      </section>

      <section className="docs-section">
        <h2>Usage</h2>
        <pre>
          <code>{component.usage}</code>
        </pre>
      </section>

      <section className="docs-section">
        <h2>API</h2>
        <div
          className="props-table"
          role="table"
          aria-label={`${component.name} props`}
        >
          {component.props.map(([name, type, description]) => (
            <div className="props-row" role="row" key={name}>
              <code>{name}</code>
              <code>{type}</code>
              <span>{description}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="docs-section">
        <h2>Accessibility</h2>
        <p>{component.accessibility}</p>
      </section>

      <section className="docs-section detail-footer">
        <div>
          <h2>Dependencies</h2>
          <p>{component.dependencies.join(", ")}</p>
        </div>
        <ExternalLink href={componentSourceUrl(component.slug)}>
          Read the full source on GitHub
        </ExternalLink>
      </section>
    </article>
  )
}
