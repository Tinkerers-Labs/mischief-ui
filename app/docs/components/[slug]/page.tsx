import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ComponentPreview } from "@/components/component-preview"
import { CopyCommand } from "@/components/copy-command"
import { componentDocs, getComponentDoc } from "@/lib/component-docs"

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
    title: component ? `${component.name} | Mischief` : "Component | Mischief",
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
      <p className="eyebrow">{component.number} / Tactile controls</p>
      <h1>{component.name}</h1>
      <p className="docs-lead">{component.summary}</p>

      <div className="demo-frame docs-preview">
        <ComponentPreview slug={component.slug} />
      </div>

      <section className="docs-section">
        <h2>Install</h2>
        <p>
          Copy the source with shadcn, or add the package if you prefer imports
          from npm.
        </p>
        <div className="install-options">
          <CopyCommand label="shadcn" command={component.install} />
          <CopyCommand
            label="npm"
            command="pnpm add mischief-ui @base-ui/react motion"
          />
        </div>
        <pre>
          <code>{component.npmImport}</code>
        </pre>
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
        <a
          href={`https://github.com/Tinkerers-Labs/mischief-ui/blob/main/registry/default/${component.slug}/${component.slug}.tsx`}
        >
          Read the full source on GitHub
        </a>
      </section>
    </article>
  )
}
