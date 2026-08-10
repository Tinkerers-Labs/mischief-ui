import Link from "next/link"

import { ExternalLink } from "@/components/external-link"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { componentDocs } from "@/lib/component-docs"
import { siteConfig } from "@/site.config"

export function DocsShell({ children }: { children: React.ReactNode }) {
  const components = componentDocs.filter(({ kind }) => kind === "component")
  const blocks = componentDocs.filter(({ kind }) => kind === "block")

  return (
    <>
      <SiteHeader />
      <div className="docs-layout">
        <aside className="docs-sidebar">
          <p className="sidebar-label">Start here</p>
          <Link href={siteConfig.routes.docs}>Introduction</Link>
          <p className="sidebar-label">Components</p>
          {components.map((component) => (
            <Link
              key={component.slug}
              href={`/docs/components/${component.slug}`}
            >
              {component.name}
            </Link>
          ))}
          <p className="sidebar-label">Blocks</p>
          {blocks.map((block) => (
            <Link key={block.slug} href={`/docs/components/${block.slug}`}>
              {block.name}
            </Link>
          ))}
          <p className="sidebar-label">More</p>
          <Link href={siteConfig.routes.brand}>Brand</Link>
          <Link href={siteConfig.routes.license}>License</Link>
          <ExternalLink href={siteConfig.repository.url}>GitHub</ExternalLink>
        </aside>
        <main className="docs-main">{children}</main>
      </div>
      <SiteFooter />
    </>
  )
}
