import type { Metadata } from "next"
import Link from "next/link"
import { Check } from "lucide-react"

import { InterfacesIndex } from "@/components/interfaces-index"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { componentDocs } from "@/lib/component-docs"
import {
  checkedCount,
  componentFor,
  interfaceSections,
  ruleCount,
} from "@/lib/interface-rules"
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
    <main>
      <SiteHeader />

      <div className="interfaces-page">
        <h1 className="interfaces-title">
          <span>Interface</span>
          <span>Guidelines</span>
        </h1>

        <div className="interfaces-sheet">
          <section className="interfaces-block">
            <h2>Introduction</h2>
            <p>
              A list of the details this collection holds itself to, kept
              because most of them were written down after getting one wrong.
              None of them are opinions: {checkedCount()} of the {ruleCount()}{" "}
              are enforced by a test that fails when the rule is broken, and the
              rest name the components where you can go and see them kept.
            </p>
            <p>
              Everything cited is one of the {componentDocs.length} components
              here, and everything is MIT, so the cost of keeping a rule is
              readable rather than described.
            </p>
          </section>

          {interfaceSections.map((section) => (
            <section
              className="interfaces-block"
              key={section.id}
              id={section.id}
            >
              <h2>{section.title}</h2>
              <p className="interfaces-block-lead">{section.description}</p>

              <ul className="rule-list">
                {section.rules.map((rule) => (
                  <li key={rule.id} id={rule.id}>
                    <p className="rule-text">
                      {rule.rule}
                      {rule.checked ? (
                        <span
                          className="rule-checked"
                          title={`Enforced by a test: ${rule.checked}`}
                        >
                          <Check aria-hidden="true" size={11} />
                          checked
                        </span>
                      ) : null}
                    </p>
                    <p className="rule-detail">{rule.detail}</p>

                    {rule.components?.length ? (
                      <p className="rule-evidence">
                        {rule.components.map((slug, at) => {
                          const component = componentFor(slug)
                          if (!component) return null

                          return (
                            <span key={slug}>
                              {at > 0 ? (
                                <span aria-hidden="true"> · </span>
                              ) : null}
                              <Link href={`/docs/components/${slug}`}>
                                {component.name}
                              </Link>
                            </span>
                          )
                        })}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="interfaces-block" id="provenance">
            <h2>Where this came from</h2>
            <p>
              Seventeen components were uninstallable because a dependency was
              written as a bare name. A shimmer animated a keyframe these pages
              never defined, so it ran for everybody who installed it and for
              nobody reading the documentation. Writing the list down is how the
              gaps turned up, which is the argument for keeping it.
            </p>
            <p>
              <Link href={siteConfig.routes.docs}>
                Browse all {componentDocs.length} components
              </Link>
            </p>
          </section>
        </div>
      </div>

      <InterfacesIndex items={index} />
      <SiteFooter />
    </main>
  )
}
