import type { Metadata } from "next"
import Link from "next/link"
import { Check } from "lucide-react"

import { DocsPager } from "@/components/docs-pager"
import { RuleDemo } from "@/components/interface-demos"
import { componentDocs } from "@/lib/component-docs"
import { interfaceSections } from "@/lib/interface-rules"
import { siteConfig } from "@/site.config"

export const metadata: Metadata = {
  title: `Interface Guidelines | ${siteConfig.name}`,
  description:
    "The rules this component collection holds itself to, each one either enforced by a test over its own source or demonstrated by a component you can open.",
  alternates: { canonical: "/docs/guidelines" },
}

export default function GuidelinesPage() {
  return (
    <article className="docs-article docs-intro">
      <p className="eyebrow">Guidelines</p>
      <h1>Interface guidelines</h1>
      <p className="docs-lead">
        A list of details that make an interface good, kept as we learn them. A
        few of them demonstrate themselves.
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
                  <RuleDemo id={rule.id} />
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="docs-section">
        <p>
          <Link className="detail-link" href="/docs/components">
            Browse all {componentDocs.length} components
          </Link>
        </p>
      </section>

      <DocsPager href="/docs/guidelines" />
    </article>
  )
}
