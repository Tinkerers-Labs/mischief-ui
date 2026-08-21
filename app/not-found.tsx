import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { NotFound as NotFoundBlock } from "@/registry/default/not-found/not-found"
import { componentDocs, featuredComponents } from "@/lib/component-docs"
import { siteConfig } from "@/site.config"

export const metadata: Metadata = {
  title: `Page not found | ${siteConfig.name}`,
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <main>
      <SiteHeader />

      <NotFoundBlock
        className="not-found"
        code="404"
        title={
          <>
            That page moved,
            <span className="text-primary block">or never existed.</span>
          </>
        }
        description={
          <>
            Component pages live under <code>/docs/components</code>. If you
            followed a link from somewhere, the component may have been renamed.
          </>
        }
        actions={
          <>
            <Link className="not-found-primary" href={siteConfig.routes.docs}>
              Browse the docs
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link className="detail-link" href={siteConfig.routes.home}>
              Go home
            </Link>
          </>
        }
      >
        <div className="not-found-suggestions">
          <p className="sidebar-label">
            {componentDocs.length} components, starting with
          </p>
          <ul>
            {featuredComponents.map((component) => (
              <li key={component.slug}>
                <Link href={`/docs/components/${component.slug}`}>
                  {component.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </NotFoundBlock>

      <SiteFooter />
    </main>
  )
}
