import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { ComponentPreview } from "@/components/component-preview"
import { getComponentDoc } from "@/lib/component-docs"

/** The one component the page leads with. Everything else is derived. */
const HERO_SLUG = "questionnaire"

export function HeroPlayground() {
  const component = getComponentDoc(HERO_SLUG)

  if (!component) return null

  return (
    <div className="border-border/70 bg-card/85 flex min-w-0 flex-col justify-center rounded-[1.25rem] border p-5 shadow-2xl backdrop-blur-md md:p-8">
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
      </div>
    </div>
  )
}
