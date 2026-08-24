import type { Metadata } from "next"
import Link from "next/link"
import { Check } from "lucide-react"

import { DocsToc } from "@/components/docs-toc"
import {
  checkedCount,
  citedComponents,
  componentFor,
  interfaceSections,
  ruleCount,
} from "@/lib/interface-rules"
import { componentDocs } from "@/lib/component-docs"
import { siteConfig } from "@/site.config"

export const metadata: Metadata = {
  title: `Interface rules | ${siteConfig.name}`,
  description:
    "The rules this component collection holds itself to, each one either enforced by a test over its own source or demonstrated by a component you can open.",
  alternates: { canonical: "/interfaces" },
}

export default function InterfacesPage() {
  const sections = interfaceSections.map((section) => ({
    id: section.id,
    label: section.title,
  }))

  return (
    <article className="docs-article">
      <p className="eyebrow">Interfaces</p>
      <h1>
        Rules, and
        <br />
        what keeps them.
      </h1>
      <p className="docs-lead">
        {ruleCount()} rules this collection holds itself to. None of them are
        opinions: {checkedCount()} are enforced by a test that fails when the
        rule is broken, and the rest name the components where you can go and
        see them kept.
      </p>

      <section className="docs-section">
        <p>
          Most of these were written down after getting one of them wrong.{" "}
          {citedComponents().length} of the {componentDocs.length} components
          here are cited as evidence, and the checks run on every build, so a
          rule cannot quietly become an aspiration while the page still claims
          it.
        </p>
        <DocsToc sections={sections} />
      </section>

      {interfaceSections.map((section) => (
        <section className="docs-section" key={section.id} id={section.id}>
          <h2>{section.title}</h2>
          <p>{section.description}</p>

          <div className="interface-rules">
            {section.rules.map((rule) => (
              <div className="interface-rule" key={rule.id} id={rule.id}>
                <h3>{rule.rule}</h3>
                <p>{rule.detail}</p>

                <div className="interface-rule-evidence">
                  {rule.checked ? (
                    <span
                      className="interface-rule-checked"
                      title={`Enforced by a test: ${rule.checked}`}
                    >
                      <Check aria-hidden="true" size={12} />
                      Checked on every build
                    </span>
                  ) : null}

                  {(rule.components ?? []).map((slug) => {
                    const component = componentFor(slug)
                    if (!component) return null

                    return (
                      <Link
                        key={slug}
                        href={`/docs/components/${slug}`}
                        className="interface-rule-component"
                      >
                        {component.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="docs-section">
        <h2>Where this came from</h2>
        <p>
          Every rule here is one this collection broke at least once. Seventeen
          components were uninstallable because a dependency was written as a
          bare name. A shimmer animated a keyframe these pages never defined, so
          it ran for everybody who installed it and for nobody reading the
          documentation. Writing the list down is how the gaps turned up, which
          is the argument for keeping it.
        </p>
        <p>
          If a rule here matters to you, the component beside it is the shortest
          way to see what keeping it costs. Everything is MIT, so the answer is
          yours to copy.
        </p>
      </section>
    </article>
  )
}
