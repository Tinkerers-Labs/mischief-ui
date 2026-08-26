import type { Metadata, Route } from "next"
import Link from "next/link"

import { AxIndex } from "@/components/ax-index"
import { HeroScene } from "@/components/hero-scene"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { axIntro, axSections } from "@/lib/ax"
import { siteConfig } from "@/site.config"

export const metadata: Metadata = {
  title: `Agent Experience (AX), explained | ${siteConfig.name}`,
  description:
    "What agent experience means, the four mechanisms it is made of, how it is measured, and what about it is not settled yet.",
  alternates: { canonical: "/ax" },
}

export default function AxPage() {
  return (
    <>
      <SiteHeader />

      {/* Constellation, because the page is about things joined to each other. */}
      <HeroScene controls={false} initial="constellation">
        <div className="ax-hero">
          <p className="eyebrow">Agent experience</p>
          <h1>
            AX, <span className="text-primary">explained.</span>
          </h1>
          <p className="ax-lead">{axIntro}</p>
        </div>
      </HeroScene>

      <main className="ax-page">
        {axSections.map((section) => (
          <section className="ax-section" key={section.id} id={section.id}>
            <h2>{section.title}</h2>

            {section.body.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}

            {section.table ? (
              <div className="doc-table-scroll">
                <table className="doc-table">
                  <thead>
                    <tr>
                      {section.table.headers.map((head, at) => (
                        <th key={at} scope="col">
                          {head || " "}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row) => (
                      <tr key={row[0]}>
                        {row.map((cell, at) => (
                          <td key={at}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {section.seen ? (
              <div className="mt-6 flex flex-wrap gap-1.5">
                {section.seen.map((one) => (
                  <Link
                    key={one.href}
                    href={one.href as Route}
                    className="ax-file text-foreground hover:text-primary inline-flex min-h-9 items-center rounded-full border px-3 font-mono text-xs no-underline transition-colors motion-reduce:transition-none"
                  >
                    {one.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </main>

      <AxIndex />
      <SiteFooter />
    </>
  )
}
