import type { Metadata } from "next"
import Link from "next/link"

import { ComponentGallery } from "@/components/component-gallery"
import { ExternalLink } from "@/components/external-link"
import { FaqSection } from "@/components/faq-section"
import { GalleryIndex } from "@/components/gallery-index"
import { HeroScene } from "@/components/hero-scene"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { componentDocs, getComponentDoc } from "@/lib/component-docs"
import { newestComponent } from "@/lib/changelog"
import { ScrollToTopButton } from "@/registry/default/scroll-to-top-button/scroll-to-top-button"
import { siteConfig } from "@/site.config"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareSourceCode",
      name: `${siteConfig.name} UI`,
      description: siteConfig.description,
      url: siteConfig.url,
      codeRepository: siteConfig.repository.url,
      license: siteConfig.license.sourceUrl,
      programmingLanguage: "TypeScript",
      runtimePlatform: "React",
    },
    {
      "@type": "ItemList",
      name: `${siteConfig.name} components and blocks`,
      itemListElement: componentDocs.map((component, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: component.name,
        url: `${siteConfig.url}docs/components/${component.slug}/`,
      })),
    },
  ],
}

export default function Home() {
  // Whatever the newest release actually shipped, rather than a name typed in
  // once and left behind by three releases.
  const released = newestComponent()
  const doc = released && getComponentDoc(released.slug)
  const newest = doc ? { slug: doc.slug, name: doc.name } : undefined

  return (
    <main>
      <SiteHeader />

      <HeroScene>
        {newest ? (
          <Link
            className="border-border/70 bg-background/60 text-muted-foreground hover:text-foreground mb-6 inline-flex w-fit items-center gap-2 rounded-full border py-1.5 pr-3 pl-2 text-xs font-semibold no-underline backdrop-blur-md"
            href={`/docs/components/${newest.slug}`}
          >
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5">
              New
            </span>
            {newest.name}
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}

        <h1 className="font-[family-name:var(--font-display)] text-[clamp(3.25rem,4.6vw,5.4rem)] leading-[0.94] font-semibold tracking-[-0.05em]">
          React components
          <span className="text-primary block">with a little mischief.</span>
        </h1>

        <p className="mt-5 max-w-[34rem] text-[clamp(1.05rem,1.4vw,1.2rem)] leading-relaxed text-pretty">
          <strong className="font-semibold">
            {componentDocs.length} accessible components
          </strong>{" "}
          for shadcn projects. Sliders with a little give, a data table you can
          live in, everything an agent shows while it works, and a microphone
          that draws what it hears.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link
            className="bg-foreground text-background inline-flex min-h-11 items-center rounded-full px-5 font-semibold no-underline transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transition-none"
            href={siteConfig.routes.docs}
          >
            Browse {componentDocs.length} components
          </Link>
          <a
            className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
            href="#components"
          >
            See them running
          </a>
        </div>

        <p className="text-muted-foreground mt-5 text-sm">
          Install from{" "}
          <ExternalLink
            className="hover:text-foreground underline underline-offset-4"
            href={siteConfig.package.url}
          >
            npm
          </ExternalLink>{" "}
          ·{" "}
          <Link
            className="hover:text-foreground underline underline-offset-4"
            href={siteConfig.license.route}
          >
            {siteConfig.license.name}
          </Link>{" "}
          licensed · Using a coding agent?{" "}
          {/* A plain anchor: skill.md is a markdown route, not a page, so
              next/link would prefetch a tree that does not exist. */}
          <a
            className="text-foreground font-semibold underline underline-offset-4"
            href={siteConfig.routes.skill}
          >
            Give it skill.md.
          </a>
        </p>
      </HeroScene>

      <ComponentGallery />
      <GalleryIndex />
      <FaqSection />
      <SiteFooter />
      <ScrollToTopButton />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </main>
  )
}
