import type { Metadata } from "next"
import Link from "next/link"
import { Check } from "lucide-react"

import { InterfacesIndex } from "@/components/interfaces-index"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { componentDocs } from "@/lib/component-docs"
import { componentFor, interfaceSections } from "@/lib/interface-rules"
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

      <main className="interfaces-page">
        <p className="eyebrow">Interfaces</p>
        <h1>Interface guidelines</h1>
        <p className="brand-lead">
          A list of details that make an interface good, kept as we learn them.
        </p>

        {interfaceSections.map((section) => (
          <section className="docs-section" key={section.id} id={section.id}>
            <h2>
              {section.title}
              <span className="docs-family-count">{section.rules.length}</span>
            </h2>
            <p>{section.description}</p>

            <div className="rule-list">
              {section.rules.map((rule) => (
                <article className="rule-row" key={rule.id} id={rule.id}>
                  <span className="rule-marker" aria-hidden="true">
                    {rule.checked ? <Check size={13} /> : "◦"}
                  </span>

                  <div>
                    <strong>{rule.rule}</strong>
                    <p>{rule.detail}</p>

                    <p className="rule-evidence">
                      {rule.checked ? (
                        <span
                          className="rule-checked"
                          title={`Enforced by a test: ${rule.checked}`}
                        >
                          Checked on every build
                        </span>
                      ) : null}
                      {(rule.components ?? []).map((slug, at) => {
                        const component = componentFor(slug)
                        if (!component) return null

                        return (
                          <span key={slug}>
                            {at > 0 || rule.checked ? (
                              <span aria-hidden="true"> · </span>
                            ) : null}
                            <Link href={`/docs/components/${slug}`}>
                              {component.name}
                            </Link>
                          </span>
                        )
                      })}
                    </p>
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
