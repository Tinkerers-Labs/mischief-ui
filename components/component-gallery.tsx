import Link from "next/link"

import { CopyCommand } from "@/components/copy-command"
import { componentDemos } from "@/components/demos"
import {
  componentDocs,
  featuredComponents,
  type ComponentDoc,
} from "@/lib/component-docs"
import { registryInstallCommand, siteConfig } from "@/site.config"

function groupByFamily(docs: readonly ComponentDoc[]) {
  const families: { family: string; docs: ComponentDoc[] }[] = []

  for (const doc of docs) {
    const current = families.find((entry) => entry.family === doc.family)

    if (current) current.docs.push(doc)
    else families.push({ family: doc.family, docs: [doc] })
  }

  return families
}

function ComponentSection({ doc }: { doc: ComponentDoc }) {
  const demo = componentDemos[doc.slug]

  return (
    <section className="component-section" id={`component-${doc.slug}`}>
      <div className="component-copy">
        <h3 className="component-title">
          <span className="component-number">{doc.family}</span>
          {doc.name}
        </h3>
        <p className="component-summary">{doc.summary}</p>
        <div className="component-actions">
          <CopyCommand command={registryInstallCommand(doc.slug)} />
          <Link className="detail-link" href={`/docs/components/${doc.slug}`}>
            Preview, API, and source
          </Link>
        </div>
      </div>
      <div className={`demo-frame ${demo?.frameClassName ?? ""}`.trim()}>
        {demo ? <demo.Demo /> : null}
      </div>
    </section>
  )
}

export function ComponentGallery() {
  return (
    <div className="gallery" id="components">
      <div className="component-family">
        {featuredComponents.map((doc) => (
          <ComponentSection doc={doc} key={doc.slug} />
        ))}
      </div>

      <section
        className="catalog"
        id="catalog"
        aria-labelledby="catalog-heading"
      >
        <div className="catalog-intro">
          <p className="eyebrow">The whole library</p>
          <h2 id="catalog-heading">
            {componentDocs.length} components, installed the same way.
          </h2>
          <p>
            Every one has a live preview, a typed API, and its accessibility
            behaviour written down.{" "}
            <Link href={siteConfig.routes.docs}>Read the docs</Link>.
          </p>
        </div>

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
