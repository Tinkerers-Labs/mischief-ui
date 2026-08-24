import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { InstallCommand } from "@/registry/default/install-command/install-command"
import { defaultPackageManager } from "@/lib/package-commands"
import { componentFamilies, getComponentFamily } from "@/lib/component-docs"
import { registryInstallArgs, siteConfig } from "@/site.config"

export function generateStaticParams() {
  return componentFamilies.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const family = getComponentFamily((await params).slug)

  if (!family) {
    return { title: `Components | ${siteConfig.name}` }
  }

  return {
    title: `${family.name} React Components | ${siteConfig.name}`,
    description: `${family.description} ${family.components.length} components for React, Tailwind CSS, and shadcn projects.`,
    alternates: { canonical: `/docs/families/${family.slug}` },
  }
}

export default async function FamilyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const family = getComponentFamily((await params).slug)

  if (!family) {
    notFound()
  }

  return (
    <article className="docs-article">
      <p className="eyebrow">Family</p>
      <h1>{family.name}</h1>
      <p className="docs-lead">{family.description}</p>

      <section className="docs-section">
        <h2>
          Components
          <span className="docs-family-count">{family.components.length}</span>
        </h2>
        <div className="docs-component-list">
          {family.components.map((component) => (
            <Link
              key={component.slug}
              href={`/docs/components/${component.slug}`}
            >
              <span>{component.number}</span>
              <strong>{component.name}</strong>
              <p>{component.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="docs-section">
        <h2>Installing one</h2>
        <p>
          Each of these copies its source into your project, the same as any
          other component in the registry.
        </p>
        <InstallCommand
          add={siteConfig.package.installArgs}
          defaultManager={defaultPackageManager}
          run={registryInstallArgs(family.components[0]!.slug)}
        />
      </section>

      <section className="docs-section" aria-labelledby="other-families">
        <h2 id="other-families">Other families</h2>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {componentFamilies
            .filter((entry) => entry.slug !== family.slug)
            .map((entry) => (
              <Link
                key={entry.slug}
                href={`/docs/families/${entry.slug}`}
                className="border-border text-muted-foreground hover:text-foreground inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold"
              >
                {entry.name}
                <span className="opacity-60">{entry.components.length}</span>
              </Link>
            ))}
          <Link
            href="/docs"
            className="border-border text-muted-foreground hover:text-foreground inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold"
          >
            All components
          </Link>
        </div>
      </section>
    </article>
  )
}
