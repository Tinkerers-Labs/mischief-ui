import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { ComponentPreview } from "@/components/component-preview"
import { CodeBlock } from "@/components/code-block"
import { DocBlocks } from "@/components/doc-blocks"
import { CopyPageButton } from "@/components/copy-page-button"
import { DocsToc } from "@/components/docs-toc"
import { agentInstallPrompt } from "@/lib/agent-prompt"
import { componentMarkdown } from "@/lib/component-markdown"
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

const INSTALL_SECTIONS = [
  { id: "installation", label: "Installation" },
  { id: "usage", label: "Usage" },
] as const

const CLOSING_SECTIONS = [
  { id: "api", label: "API" },
  { id: "accessibility", label: "Accessibility" },
] as const

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

  // Guidance sections sit between the first example and the API, and a
  // component that needs none contributes none.
  const sections = [
    ...INSTALL_SECTIONS,
    ...component.sections.map(({ id, title }) => ({ id, label: title })),
    ...CLOSING_SECTIONS,
  ]

  return (
    <div className="component-doc-layout">
      <article className="docs-article component-doc">
        <header className="component-doc-header">
          <div>
            <p className="eyebrow">
              {component.number} / {component.family}
            </p>
            <h1>{component.name}</h1>
          </div>

          <nav className="component-page-actions" aria-label="Component pages">
            <CopyPageButton
              componentSlug={component.slug}
              markdown={componentMarkdown(component)}
              prompt={agentInstallPrompt(component)}
            />
            {previousComponent ? (
              <Link
                aria-label={`Previous: ${previousComponent.name}`}
                className="component-page-arrow"
                href={`/docs/components/${previousComponent.slug}`}
                title={`Previous: ${previousComponent.name}`}
              >
                <ArrowLeft aria-hidden="true" size={15} />
              </Link>
            ) : (
              <span
                aria-hidden="true"
                className="component-page-arrow disabled"
              >
                <ArrowLeft size={15} />
              </span>
            )}
            {nextComponent ? (
              <Link
                aria-label={`Next: ${nextComponent.name}`}
                className="component-page-arrow"
                href={`/docs/components/${nextComponent.slug}`}
                title={`Next: ${nextComponent.name}`}
              >
                <ArrowRight aria-hidden="true" size={15} />
              </Link>
            ) : (
              <span
                aria-hidden="true"
                className="component-page-arrow disabled"
              >
                <ArrowRight size={15} />
              </span>
            )}
          </nav>
        </header>

        <p className="docs-lead">{component.summary}</p>

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
            agentPrompt={agentInstallPrompt(component)}
            npmImport={component.npmImport}
            slug={component.slug}
          />
          {component.dependencies.length > 0 ? (
            <div className="install-dependencies">
              <span>Also installs</span>
              <ul className="dependency-tags">
                {component.dependencies.map((dependency) => (
                  <li key={dependency}>{dependency}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="docs-section" id="usage">
          <h2>Usage</h2>
          <CodeBlock code={component.usage} />
        </section>

        {component.sections.map((section) => (
          <section className="docs-section" id={section.id} key={section.id}>
            <h2>{section.title}</h2>
            <DocBlocks blocks={section.blocks} />
          </section>
        ))}

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

          {component.types.map((type) => (
            <div className="props-type" key={type.name}>
              <h3>{type.name}</h3>
              {type.description ? <p>{type.description}</p> : null}
              <div
                className="props-table"
                role="table"
                aria-label={`${type.name} fields`}
              >
                {type.rows.map(([name, fieldType, description]) => (
                  <div className="props-row" role="row" key={name}>
                    <code>{name}</code>
                    <code>{fieldType}</code>
                    <span>{description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="docs-section" id="accessibility">
          <h2>Accessibility</h2>
          <p>{component.accessibility}</p>
        </section>
      </article>

      <DocsToc sections={sections} />
    </div>
  )
}
