import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { componentDemos } from "@/components/demos"
import {
  componentDocs,
  featuredComponents,
  type ComponentDoc,
} from "@/lib/component-docs"

function groupByFamily(docs: readonly ComponentDoc[]) {
  const families: { family: string; docs: ComponentDoc[] }[] = []

  for (const doc of docs) {
    const current = families.find((entry) => entry.family === doc.family)

    if (current) current.docs.push(doc)
    else families.push({ family: doc.family, docs: [doc] })
  }

  return families
}

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

        {groupByFamily(componentDocs).map(({ family, docs }) => (
          <div className="catalog-family" key={family}>
            <h3>
              <span>{family}</span>
              <span className="catalog-count">{docs.length}</span>
            </h3>

            <ul>
              {docs.map((doc) => (
                <li key={doc.slug}>
                  <Link href={`/docs/components/${doc.slug}`}>
                    <strong>{doc.name}</strong>
                    <span>{doc.summary}</span>
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
