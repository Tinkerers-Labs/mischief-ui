import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { ComponentPreview } from "@/components/component-preview"
import { getComponentDoc } from "@/lib/component-docs"

/** The one component the page leads with. Everything else is derived. */
const HERO = {
  slug: "questionnaire",
  hint: "Keyboard + shortcuts",
} as const

export function HeroPlayground() {
  const component = getComponentDoc(HERO.slug)

  if (!component) return null

  return (
    <div className="bg-muted/40 border-border flex min-h-[19rem] min-w-0 flex-col justify-center border-y px-5 py-6 md:min-h-[24rem] md:px-10 md:py-8 lg:min-h-[40rem] lg:border-y-0 lg:border-l lg:p-12">
      <div className="mx-auto w-full max-w-[34rem]">
        <div className="mb-5 flex items-center justify-between gap-4 md:mb-7">
          <div>
            <p className="text-muted-foreground text-xs font-bold tracking-[0.08em] uppercase">
              Live component
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.025em]">
              {component.name}
            </h2>
          </div>
          <Link
            aria-label={`Open ${component.name} documentation`}
            className="inline-flex size-11 shrink-0 items-center justify-center"
            href={`/docs/components/${component.slug}`}
          >
            <ArrowUpRight aria-hidden="true" size={18} />
          </Link>
        </div>

        <ComponentPreview slug={component.slug} />

        <div className="border-border mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
          <p className="text-muted-foreground max-w-[22rem] text-sm leading-relaxed">
            {component.summary}
          </p>
          <span className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
            {HERO.hint}
          </span>
        </div>
      </div>
    </div>
  )
}
