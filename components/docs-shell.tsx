import Link from "next/link"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { componentDocs } from "@/lib/component-docs"

export function DocsShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="docs-layout">
        <aside className="docs-sidebar">
          <p className="sidebar-label">Start here</p>
          <Link href="/docs">Introduction</Link>
          <p className="sidebar-label">Components</p>
          {componentDocs.map((component) => (
            <Link
              key={component.slug}
              href={`/docs/components/${component.slug}`}
            >
              {component.name}
            </Link>
          ))}
          <p className="sidebar-label">More</p>
          <Link href="/brand">Brand</Link>
          <a href="https://github.com/Tinkerers-Labs/mischief-ui">GitHub</a>
        </aside>
        <main className="docs-main">{children}</main>
      </div>
      <SiteFooter />
    </>
  )
}
