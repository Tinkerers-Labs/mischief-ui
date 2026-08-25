import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ComponentGallery } from "@/components/component-gallery"
import { HeroScene } from "@/components/hero-scene"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { componentFamilies, getComponentFamily } from "@/lib/component-docs"
import { ScrollToTopButton } from "@/registry/default/scroll-to-top-button/scroll-to-top-button"
import { siteConfig } from "@/site.config"

const BACKDROPS = ["metaballs", "constellation", "plasma", "caustics", "aurora"]

/** Stable per family, so a page keeps the same backdrop between builds. */
function backdropFor(slug: string) {
  const sum = [...slug].reduce(
    (total, letter) => total + letter.charCodeAt(0),
    0
  )
  return BACKDROPS[sum % BACKDROPS.length]
}

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

  const title = `${family.name} Components for React and shadcn`

  return {
    title: `${title} | ${siteConfig.name}`,
    description: `${family.components.length} ${family.name} components you copy into your project. ${family.description}`,
    alternates: { canonical: `/families/${family.slug}` },
    openGraph: {
      title,
      description: family.description,
      url: `/families/${family.slug}`,
    },
  }
}

export default async function FamilyLanding({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const family = getComponentFamily((await params).slug)

  if (!family) {
    notFound()
  }

  const others = componentFamilies.filter((one) => one.slug !== family.slug)

  return (
    <>
      <SiteHeader />

      <HeroScene controls={false} initial={backdropFor(family.slug)}>
        <p className="text-muted-foreground text-xs font-bold tracking-[0.08em] uppercase">
          Family
          <span className="ms-2 opacity-70">
            {family.components.length} components
          </span>
        </p>

        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2.5rem,4.2vw,4.5rem)] leading-[0.96] font-semibold tracking-[-0.045em]">
          {family.name}
        </h1>

        <p className="text-muted-foreground mt-5 text-lg leading-relaxed text-pretty">
          {family.lead}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="#components"
            className="bg-foreground text-background inline-flex min-h-11 items-center rounded-full px-5 font-semibold no-underline transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transition-none"
          >
            See the {family.components.length}
          </Link>
          <Link
            href={`/docs/families/${family.slug}`}
            className="border-border hover:bg-muted inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-semibold no-underline transition-colors motion-reduce:transition-none"
          >
            Read the documentation
          </Link>
        </div>
      </HeroScene>

      <ComponentGallery
        components={family.components}
        action={
          <>
            <Link
              className="bg-foreground text-background inline-flex min-h-11 items-center rounded-full px-5 font-semibold no-underline transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transition-none"
              href={`/docs/families/${family.slug}`}
            >
              Install any of them
            </Link>
            <p className="text-muted-foreground text-sm">
              Every one copies its source into your project.
            </p>
          </>
        }
      />

      <section className="border-border border-t">
        <div className="mx-auto max-w-[90rem] px-4 py-12 md:px-8 lg:px-12">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.025em]">
            The other families
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((one) => (
              <Link
                key={one.slug}
                href={`/families/${one.slug}`}
                className="border-border hover:bg-muted/50 group rounded-xl border p-4 no-underline transition-colors motion-reduce:transition-none"
              >
                <p className="flex items-baseline gap-2">
                  <strong className="font-semibold">{one.name}</strong>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {one.components.length}
                  </span>
                </p>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {one.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
      <ScrollToTopButton />
    </>
  )
}
