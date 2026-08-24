import { Fragment } from "react"
import Link from "next/link"

import { ExternalLink } from "@/components/external-link"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { componentFamilies } from "@/lib/component-docs"
import { siteConfig } from "@/site.config"

export function DocsShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="docs-layout">
        <aside className="docs-sidebar">
          <p className="sidebar-label">Start here</p>
          <Link href={siteConfig.routes.docs}>Introduction</Link>
          {componentFamilies.map((family) => (
            <Fragment key={family.name}>
              <p className="sidebar-label">{family.name}</p>
              {/* Grouped by family, then by name, because within a group of
                  this size a reader is looking one up rather than reading. */}
              {[...family.components]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((component) => (
                  <Link
                    key={component.slug}
                    href={`/docs/components/${component.slug}`}
                  >
                    {component.name}
                  </Link>
                ))}
            </Fragment>
          ))}
          <p className="sidebar-label">More</p>
          <Link href={siteConfig.routes.changelog}>Changelog</Link>
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
