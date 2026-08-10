import Link from "next/link"

import { MischiefMark } from "@/components/brand-logo"
import { ComponentGallery } from "@/components/component-gallery"
import { CopyCommand } from "@/components/copy-command"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section
        className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-[90rem] grid-rows-[auto_1fr_auto] gap-12 overflow-hidden px-4 py-10 md:px-8 md:py-14 lg:px-12 lg:py-16"
        id="top"
      >
        <div className="flex items-start justify-between gap-8">
          <p className="text-xs font-bold tracking-[0.08em] uppercase">
            Open source. Made for shadcn.
          </p>
          <MischiefMark
            className="text-primary hidden size-20 md:block"
            aria-hidden="true"
          />
        </div>

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
                href="/docs"
              >
                Read the docs
              </Link>
            </div>
          </div>

          <div className="border-border min-w-0 border-l pl-5 md:pl-8">
            <p className="mb-3 text-sm font-semibold">Start with the source</p>
            <CopyCommand
              label="shadcn"
              command="pnpm dlx shadcn@latest add Tinkerers-Labs/mischief-ui/magnetic-tabs"
            />
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              It lands in your project, ready to edit.
            </p>
          </div>
        </div>
      </section>

      <ComponentGallery />

      <SiteFooter />
    </main>
  )
}
