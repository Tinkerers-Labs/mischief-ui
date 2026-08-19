import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { componentDemos } from "@/components/demos"
import {
  componentFamilies,
  featuredComponents,
  type ComponentDoc,
} from "@/lib/component-docs"

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

export function ComponentGallery() {
  return (
    <div className="gallery" id="components">
      <div className="gallery-grid">
        {featuredComponents.map((doc) => (
          <GalleryTile doc={doc} key={doc.slug} />
        ))}
      </div>

      <section
        className="catalog"
        id="catalog"
        aria-labelledby="catalog-heading"
      >
        <h2 className="catalog-heading" id="catalog-heading">
          All components
        </h2>

        {componentFamilies.map((family) => (
          <div className="catalog-family" key={family.name}>
            <h3>
              <span>{family.name}</span>
              <span className="catalog-count">{family.components.length}</span>
            </h3>

            <ul>
              {family.components.map((doc) => (
                <li key={doc.slug}>
                  <Link
                    href={`/docs/components/${doc.slug}`}
                    title={doc.summary}
                  >
                    {doc.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  )
}
