import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { ComponentPreview } from "@/components/component-preview"

export function HeroPlayground() {
  return (
    <div className="bg-muted/40 border-border flex min-h-[19rem] min-w-0 flex-col justify-center border-y px-5 py-6 md:min-h-[24rem] md:px-10 md:py-8 lg:min-h-[40rem] lg:border-y-0 lg:border-l lg:p-12">
      <div className="mx-auto w-full max-w-[34rem]">
        <div className="mb-5 flex items-center justify-between gap-4 md:mb-7">
          <div>
            <p className="text-muted-foreground text-xs font-bold tracking-[0.08em] uppercase">
              Live component
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.025em]">
              Magnetic Tabs
            </h2>
          </div>
          <Link
            aria-label="Open Magnetic Tabs documentation"
            className="inline-flex size-11 shrink-0 items-center justify-center"
            href="/docs/components/magnetic-tabs"
          >
            <ArrowUpRight aria-hidden="true" size={18} />
          </Link>
        </div>

        <ComponentPreview slug="magnetic-tabs" />

        <div className="border-border mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
          <p className="text-muted-foreground max-w-[22rem] text-sm leading-relaxed">
            Move between sections without losing your place.
          </p>
          <span className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
            Pointer + keyboard
          </span>
        </div>
      </div>
    </div>
  )
}
