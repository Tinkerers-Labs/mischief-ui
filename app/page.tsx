import Link from "next/link"
import { ArrowDown } from "lucide-react"

import { ComponentGallery } from "@/components/component-gallery"
import { SiteHeader } from "@/components/site-header"

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section
        className="mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-[90rem] grid-rows-[auto_1fr_auto] px-4 py-12 md:px-8 md:py-16 lg:px-12 lg:py-24"
        id="top"
      >
        <p className="text-xs font-bold tracking-[0.08em] uppercase">
          Open source components for React
        </p>
        <h1 className="self-center font-[family-name:var(--font-display)] text-[clamp(3.25rem,9.5vw,8.5rem)] leading-[0.88] font-semibold tracking-[-0.06em] text-balance">
          Good interfaces deserve{" "}
          <em className="text-primary block not-italic lg:ml-32">
            a little mischief.
          </em>
        </h1>
        <div className="flex items-end justify-between gap-8">
          <div>
            <p className="max-w-lg text-[clamp(1rem,2vw,1.25rem)] leading-relaxed text-pretty">
              Useful controls with a playful streak. Open code, ready for
              shadcn.
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
                Get started
              </Link>
            </div>
          </div>
          <a
            className="bg-foreground text-background hidden size-14 shrink-0 items-center justify-center rounded-full transition-transform duration-150 hover:translate-y-1 sm:flex"
            href="#components"
            aria-label="See components"
          >
            <ArrowDown aria-hidden="true" size={24} />
          </a>
        </div>
      </section>

      <ComponentGallery />

      <footer>
        <p>Built carefully at Tinkerers Labs.</p>
        <p>MIT licensed. Take the code and make it yours.</p>
      </footer>
    </main>
  )
}
