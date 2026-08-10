import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { ComponentPreview } from "@/components/component-preview"
import { CodeBlock } from "@/components/code-block"
import { CopyPageButton } from "@/components/copy-page-button"
import { ExternalLink } from "@/components/external-link"
import { GitHubIcon } from "@/components/github-icon"
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
      ? `${component.name} React Component | ${siteConfig.name}`
      : `Component | ${siteConfig.name}`,
    description: component
      ? `${component.summary} Built for React, Tailwind CSS, and shadcn projects.`
      : undefined,
    alternates: component
      ? { canonical: `/docs/components/${component.slug}` }
      : undefined,
  }
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const component = getComponentDoc((await params).slug)
  if (!component) notFound()

  const componentIndex = componentDocs.findIndex(
    ({ slug }) => slug === component.slug
  )
  const previousComponent = componentDocs[componentIndex - 1]
  const nextComponent = componentDocs[componentIndex + 1]

  return (
    <div className="component-doc-layout">
      <article className="docs-article component-doc">
        <header className="component-doc-header">
          <div>
            <p className="eyebrow">
              {component.number} / {component.family}
            </p>
            <h1>{component.name}</h1>
            <p className="docs-lead">{component.summary}</p>
          </div>

          <nav className="component-page-actions" aria-label="Component pages">
            <CopyPageButton
              componentName={component.name}
              componentSlug={component.slug}
            />
            {previousComponent ? (
              <Link
                aria-label={`Previous: ${previousComponent.name}`}
                className="component-page-arrow"
                href={`/docs/components/${previousComponent.slug}`}
                title={`Previous: ${previousComponent.name}`}
              >
                <ArrowLeft aria-hidden="true" size={18} />
              </Link>
            ) : (
              <span
                aria-hidden="true"
                className="component-page-arrow disabled"
              >
                <ArrowLeft size={18} />
              </span>
            )}
            {nextComponent ? (
              <Link
                aria-label={`Next: ${nextComponent.name}`}
                className="component-page-arrow"
                href={`/docs/components/${nextComponent.slug}`}
                title={`Next: ${nextComponent.name}`}
              >
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
            ) : (
              <span
                aria-hidden="true"
                className="component-page-arrow disabled"
              >
                <ArrowRight size={18} />
              </span>
            )}
          </nav>
        </header>

        <div className="component-preview-panel">
          <div className="component-preview-toolbar">
            <span>Live preview</span>
            <ExternalLink href={componentSourceUrl(component.slug)}>
              <GitHubIcon aria-hidden="true" size={15} />
              Source
            </ExternalLink>
          </div>
          <div className="demo-frame docs-preview">
            <ComponentPreview slug={component.slug} />
          </div>
        </div>

        <section className="docs-section" id="installation">
          <h2>Installation</h2>
          <p>Copy the source into your project, or keep it behind a package.</p>
          <InstallPanel
            npmImport={component.npmImport}
            shadcnCommand={component.install}
          />
        </section>

        <section className="docs-section" id="usage">
          <h2>Usage</h2>
          <CodeBlock code={component.usage} />
        </section>

        <section className="docs-section" id="api">
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

        <section className="docs-section" id="accessibility">
          <h2>Accessibility</h2>
          <p>{component.accessibility}</p>
        </section>

        <section className="docs-section" id="dependencies">
          <h2>Dependencies</h2>
          <p>{component.dependencies.join(", ")}</p>
        </section>

        <section className="docs-section detail-footer" id="source">
          <div>
            <h2>Source</h2>
            <p>Read it, change it, and keep the parts that fit your project.</p>
          </div>
          <ExternalLink href={componentSourceUrl(component.slug)}>
            View source on GitHub
          </ExternalLink>
        </section>
      </article>

      <aside className="component-toc" aria-label="On this page">
        <p>On this page</p>
        <a href="#installation">Installation</a>
        <a href="#usage">Usage</a>
        <a href="#api">API</a>
        <a href="#accessibility">Accessibility</a>
        <a href="#dependencies">Dependencies</a>
        <a href="#source">Source</a>
      </aside>
    </div>
  )
}
