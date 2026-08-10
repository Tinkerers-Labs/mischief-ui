import type { Metadata } from "next"
import Link from "next/link"

import { ComponentGallery } from "@/components/component-gallery"
import { FaqSection } from "@/components/faq-section"
import { HeroPlayground } from "@/components/hero-playground"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { componentDocs } from "@/lib/component-docs"
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
  return (
    <main>
      <SiteHeader />

      <section className="border-border border-b" id="top">
        <div className="mx-auto grid max-w-[90rem] lg:min-h-[40rem] lg:grid-cols-[minmax(0,0.92fr)_minmax(32rem,1.08fr)]">
          <div className="flex max-w-[44rem] flex-col justify-center px-4 py-9 md:px-8 md:py-14 lg:px-12 lg:py-16 lg:pr-14">
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(3.25rem,4.3vw,5.1rem)] leading-[0.94] font-semibold tracking-[-0.05em]">
              React components
              <span className="text-primary block">
                with a little mischief.
              </span>
            </h1>

            <p className="mt-5 max-w-[34rem] text-[clamp(1.05rem,1.4vw,1.2rem)] leading-relaxed text-pretty">
              Accessible components and blocks for shadcn projects. Tabs that
              follow, sliders with a little give, and source you can make your
              own.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <a
                className="bg-foreground text-background inline-flex min-h-11 items-center rounded-full px-5 font-semibold no-underline transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transition-none"
                href="#components"
              >
                Browse components
              </a>
              <Link
                className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
                href={siteConfig.routes.docs}
              >
                Read the docs
              </Link>
            </div>

            <p className="text-muted-foreground mt-5 text-sm">
              Copy the source · Install from npm · MIT licensed
            </p>
            <p className="mt-2 text-sm">
              Using a coding agent?{" "}
              <Link
                className="font-semibold underline underline-offset-4"
                href={siteConfig.routes.skill}
              >
                Give it skill.md.
              </Link>
            </p>
          </div>

          <HeroPlayground />
        </div>
      </section>

      <ComponentGallery />
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
