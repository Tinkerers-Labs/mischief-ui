import type { Metadata } from "next"
import type { Route } from "next"
import Link from "next/link"

import { ExternalLink } from "@/components/external-link"
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

      <main className="docs-article docs-intro">
        <p className="eyebrow">Agent experience</p>
        <h1>AX, explained.</h1>
        <p className="docs-lead">{axIntro}</p>

        <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-1.5">
          {axSections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="border-border text-muted-foreground hover:text-foreground inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-semibold no-underline"
            >
              {section.title}
            </a>
          ))}
        </nav>

        {axSections.map((section) => (
          <section className="docs-section" key={section.id} id={section.id}>
            <h2>{section.title}</h2>

            {section.body.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}

            {section.table ? (
              <div className="border-border mt-5 overflow-x-auto rounded-xl border">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-border bg-muted/40 border-b">
                      {section.table.headers.map((head, at) => (
                        <th
                          key={at}
                          scope="col"
                          className="px-3 py-2 text-start font-semibold"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row) => (
                      <tr
                        key={row[0]}
                        className="border-border not-last:border-b"
                      >
                        {row.map((cell, at) => (
                          <td
                            key={at}
                            className={
                              at === 0
                                ? "text-foreground px-3 py-2 align-top font-medium"
                                : "text-muted-foreground px-3 py-2 align-top"
                            }
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {section.seen ? (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {section.seen.map((one) => (
                  <Link
                    key={one.href}
                    href={one.href as Route}
                    className="border-border text-muted-foreground hover:text-foreground inline-flex min-h-8 items-center rounded-full border px-3 font-mono text-xs no-underline"
                  >
                    {one.label}
                  </Link>
                ))}
              </div>
            ) : null}

            {section.sources ? (
              <p className="text-muted-foreground mt-4 text-xs">
                Sources:{" "}
                {section.sources.map((source, at) => (
                  <span key={source.href}>
                    {at > 0 ? ", " : ""}
                    <ExternalLink
                      className="hover:text-foreground underline underline-offset-4"
                      href={source.href}
                    >
                      {source.label}
                    </ExternalLink>
                  </span>
                ))}
              </p>
            ) : null}
          </section>
        ))}
      </main>

      <SiteFooter />
    </>
  )
}
