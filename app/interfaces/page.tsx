import type { Metadata } from "next"
import Link from "next/link"
import { Check } from "lucide-react"

import { InterfacesCount } from "@/components/interfaces-count"
import { InterfacesIndex } from "@/components/interfaces-index"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { componentDocs } from "@/lib/component-docs"
import {
  checkedCount,
  citedComponents,
  componentFor,
  interfaceSections,
  ruleCount,
  ruleNumbers,
} from "@/lib/interface-rules"
import { AuroraField } from "@/registry/default/aurora-field/aurora-field"
import { GrainOverlay } from "@/registry/default/grain-overlay/grain-overlay"
import { Reveal } from "@/registry/default/reveal/reveal"
import { siteConfig } from "@/site.config"

export const metadata: Metadata = {
  title: `Interface rules | ${siteConfig.name}`,
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

      <section
        className="border-border relative isolate overflow-hidden border-b"
        id="top"
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <AuroraField className="absolute inset-0" blobs={5} speed={0.5} />
          <GrainOverlay opacity={0.17} />
          <div className="from-background via-background/86 to-background/5 absolute inset-0 bg-gradient-to-r from-0% via-40%" />
        </div>

        <div className="mx-auto flex max-w-[90rem] flex-col justify-center px-4 py-16 md:px-8 md:py-20 lg:px-12 lg:py-24">
          <div className="flex max-w-[46rem] flex-col justify-center">
            <p className="text-muted-foreground mb-5 text-xs font-semibold tracking-[0.18em] uppercase">
              Interfaces
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.9rem,4.4vw,5rem)] leading-[0.94] font-semibold tracking-[-0.05em]">
              Rules, and
              <span className="text-primary block">what keeps them.</span>
            </h1>
            <p className="mt-5 max-w-[36rem] text-[clamp(1.05rem,1.4vw,1.2rem)] leading-relaxed text-pretty">
              Every one of these was written down after getting it wrong. None
              of them are opinions: some are enforced by a test that fails when
              the rule is broken, and the rest name the components where you can
              go and see them kept.
            </p>

            <div className="mt-9 flex flex-wrap gap-x-12 gap-y-6">
              <InterfacesCount value={ruleCount()} label="Rules" />
              <InterfacesCount value={checkedCount()} label="Machine-checked" />
              <InterfacesCount
                value={citedComponents().length}
                label="Components cited"
              />
              <InterfacesCount
                value={componentDocs.length}
                label="Components shipped"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[76rem] px-4 py-14 md:px-8 lg:px-12 lg:py-20">
        <div>
          {interfaceSections.map((section) => (
            <section
              className="interface-section"
              key={section.id}
              id={section.id}
            >
              {/* The thesis stays beside its rules while they scroll, rather
                  than scrolling away from the evidence for it. */}
              <div className="interface-section-head">
                <Reveal>
                  <p className="interface-section-label">{section.title}</p>
                  <p className="interface-section-lead">
                    {section.description}
                  </p>
                </Reveal>
              </div>

              <div className="interface-rules">
                {section.rules.map((rule) => {
                  return (
                    <Reveal key={rule.id} delay={60}>
                      <article className="interface-rule" id={rule.id}>
                        <span
                          className="interface-rule-number"
                          aria-hidden="true"
                        >
                          {ruleNumbers.get(rule.id)}
                        </span>

                        <div className="interface-rule-body">
                          <h2>{rule.rule}</h2>
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
                      </article>
                    </Reveal>
                  )
                })}
              </div>
            </section>
          ))}

          <section className="interface-section" id="provenance">
            <div className="interface-section-head">
              <Reveal>
                <p className="interface-section-label">Where this came from</p>
                <p className="interface-section-lead">
                  Every rule here is one this collection broke.
                </p>
              </Reveal>
            </div>

            <div className="interface-rules">
              <Reveal>
                <div className="interface-provenance">
                  <p>
                    Seventeen components were uninstallable because a dependency
                    was written as a bare name. A shimmer animated a keyframe
                    these pages never defined, so it ran for everybody who
                    installed it and for nobody reading the documentation.
                    Writing the list down is how the gaps turned up, which is
                    the argument for keeping it.
                  </p>
                  <p>
                    If a rule here matters to you, the component beside it is
                    the shortest way to see what keeping it costs. Everything is
                    MIT, so the answer is yours to copy.
                  </p>
                  <Link className="interface-provenance-link" href="/docs">
                    Browse all {componentDocs.length} components
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </Reveal>
            </div>
          </section>
        </div>
      </div>

      <InterfacesIndex items={index} />
      <SiteFooter />
    </main>
  )
}
