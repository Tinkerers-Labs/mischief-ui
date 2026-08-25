import type { Metadata } from "next"
import Link from "next/link"
import { Check } from "lucide-react"

import { InterfacesIndex } from "@/components/interfaces-index"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { AuroraField } from "@/registry/default/aurora-field/aurora-field"
import { GrainOverlay } from "@/registry/default/grain-overlay/grain-overlay"
import { componentDocs } from "@/lib/component-docs"
import { interfaceSections } from "@/lib/interface-rules"
import { siteConfig } from "@/site.config"

export const metadata: Metadata = {
  title: `Interface Guidelines | ${siteConfig.name}`,
  description:
    "The rules this component collection holds itself to, each one either enforced by a test over its own source or demonstrated by a component you can open.",
  alternates: { canonical: "/interfaces" },
}

export default function InterfacesPage() {
  const index = interfaceSections.map((section) => ({
    id: section.id,
    label: section.title,
  }))

  return (
    <>
      <SiteHeader />

      {/* The page opens on two of the components it argues about, quietly:
          a field that reads the theme, and grain over it. */}
      <section className="interfaces-hero">
        <div aria-hidden="true" className="interfaces-hero-scene">
          <AuroraField
            className="absolute inset-0"
            blobs={4}
            speed={0.35}
            spread={0.7}
          />
          <GrainOverlay opacity={0.15} />
          <div className="interfaces-hero-fade" />
        </div>

        <div className="interfaces-hero-inner">
          <p className="eyebrow">Interfaces</p>
          <h1>Interface guidelines</h1>
          <p className="brand-lead">
            A list of details that make an interface good, kept as we learn
            them.
          </p>
        </div>
      </section>

      <main className="interfaces-page">
        {interfaceSections.map((section, at) => (
          <section
            className={
              at === 0 ? "docs-section docs-section-first" : "docs-section"
            }
            key={section.id}
            id={section.id}
          >
            <h2>
              {section.title}
              <span className="docs-family-count">{section.rules.length}</span>
            </h2>
            <p>{section.description}</p>

            <div className="rule-list">
              {section.rules.map((rule) => (
                <article className="rule-row" key={rule.id} id={rule.id}>
                  <span
                    className="rule-marker"
                    aria-hidden="true"
                    title={
                      rule.checked
                        ? `Enforced by a test: ${rule.checked}`
                        : undefined
                    }
                  >
                    {rule.checked ? <Check size={13} /> : "◦"}
                  </span>

                  <div>
                    <strong>{rule.rule}</strong>
                    <p>{rule.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className="docs-section">
          <p>
            <Link className="detail-link" href={siteConfig.routes.docs}>
              Browse all {componentDocs.length} components
            </Link>
          </p>
        </section>
      </main>

      <InterfacesIndex items={index} />
      <SiteFooter />
    </>
  )
}
