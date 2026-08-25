import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { componentDemos } from "@/components/demos"
import {
  componentDocs,
  featuredComponents,
  type ComponentDoc,
} from "@/lib/component-docs"
import { siteConfig } from "@/site.config"

function GalleryTile({ doc }: { doc: ComponentDoc }) {
  const demo = componentDemos[doc.slug]

  return (
    <article className={`gallery-tile ${demo?.tileClassName ?? ""}`.trim()}>
      {/* The stage stays interactive, so only the footer is a link. */}
      <div className="gallery-stage">{demo ? <demo.Demo /> : null}</div>

      <Link className="gallery-tile-meta" href={`/docs/components/${doc.slug}`}>
        <span className="gallery-tile-family">{doc.family}</span>
        <strong>{doc.name}</strong>
        <ArrowUpRight aria-hidden="true" size={15} />
      </Link>
    </article>
  )
}

export function ComponentGallery({
  components = featuredComponents,
  action,
}: {
  components?: readonly ComponentDoc[]
  /** Replaces the line under the grid. */
  action?: React.ReactNode
} = {}) {
  return (
    <div className="gallery" id="components">
      <div className="gallery-grid">
        {components.map((doc) => (
          <GalleryTile doc={doc} key={doc.slug} />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 px-4 pb-[clamp(2rem,5vw,4rem)] text-center">
        {action ?? (
          <>
            <Link
              className="bg-foreground text-background inline-flex min-h-11 items-center rounded-full px-5 font-semibold no-underline transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transition-none"
              href={siteConfig.routes.docs}
            >
              Browse all {componentDocs.length} components
            </Link>
            <p className="text-muted-foreground text-sm">
              Filter by family, or search the lot.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
