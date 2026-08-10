import Link from "next/link"
import { Bot } from "lucide-react"

import { ComponentGallery } from "@/components/component-gallery"
import { CopyCommand } from "@/components/copy-command"
import { FaqSection } from "@/components/faq-section"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { siteConfig } from "@/site.config"

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section
        className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-[90rem] grid-rows-[1fr_auto] gap-12 overflow-hidden px-4 py-10 md:px-8 md:py-14 lg:px-12 lg:py-16"
        id="top"
      >
        <h1 className="self-center font-[family-name:var(--font-display)] text-[clamp(3rem,9.5vw,8.5rem)] leading-[0.88] font-semibold tracking-[-0.06em]">
          <span className="block">Good interfaces</span>
          <span className="block">deserve</span>
          <span className="text-primary block lg:ml-32">
            a little mischief.
          </span>
        </h1>

        <div className="grid min-w-0 items-end gap-10 md:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)] lg:gap-20">
          <div className="min-w-0">
            <p className="max-w-xl text-[clamp(1rem,2vw,1.25rem)] leading-relaxed text-pretty">
              Useful React components with a playful streak. Copy the source,
              tune the details, and make them yours.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-5">
              <a
                className="bg-foreground text-background inline-flex min-h-11 items-center rounded-full px-5 font-semibold no-underline"
                href="#components"
              >
                Browse components
              </a>
              <Link
                className="font-semibold underline underline-offset-4"
                href={siteConfig.routes.docs}
              >
                Read the docs
              </Link>
            </div>
          </div>

          <div className="border-border min-w-0 border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Bot aria-hidden="true" size={16} strokeWidth={1.8} />
              Your agent can browse {siteConfig.name} too
            </p>
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              Install the skill once, then ask for a component by name.
            </p>
            <CopyCommand
              label="Agent skill"
              command={siteConfig.skill.installCommand}
            />
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              Try: Use <code>$mischief-ui</code> to add magnetic-tabs.
            </p>
          </div>
        </div>
      </section>

      <ComponentGallery />

      <FaqSection />

      <SiteFooter />
    </main>
  )
}
