import Link from "next/link"

import { CopyCommand } from "@/components/copy-command"
import { componentDemos } from "@/components/demos"
import { componentDocs, type ComponentDoc } from "@/lib/component-docs"
import { registryInstallCommand } from "@/site.config"

function groupByFamily(docs: readonly ComponentDoc[]) {
  const families: { family: string; docs: ComponentDoc[] }[] = []

  for (const doc of docs) {
    const current = families.at(-1)

    if (current?.family === doc.family) current.docs.push(doc)
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
          <span className="component-number">{doc.number}</span>
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
      {groupByFamily(componentDocs).map(({ family, docs }) => (
        <div className="component-family" key={family}>
          <h2 className="component-family-heading">
            <span>{family}</span>
            <span className="component-family-count">{docs.length}</span>
          </h2>

          {docs.map((doc) => (
            <ComponentSection doc={doc} key={doc.slug} />
          ))}
        </div>
      ))}
    </div>
  )
}
