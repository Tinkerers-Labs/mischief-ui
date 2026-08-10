import { readFile } from "node:fs/promises"
import { join } from "node:path"
import type { Metadata } from "next"
import { Check, FileText, Scale } from "lucide-react"

import { ExternalLink } from "@/components/external-link"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { siteConfig } from "@/site.config"

export const metadata: Metadata = {
  title: `License | ${siteConfig.name}`,
  description: `How you can use, modify, and distribute ${siteConfig.name} under the MIT License.`,
}

const permissions = [
  "Use the components in personal and commercial projects.",
  "Change the source to fit your product or client work.",
  "Copy, distribute, sublicense, or sell the software.",
  "Use the same component across as many projects as you need.",
] as const

export default async function LicensePage() {
  const licenseText = await readFile(join(process.cwd(), "LICENSE"), "utf8")

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[90rem] px-4 md:px-8 lg:px-12">
        <header className="grid gap-12 border-b py-16 md:py-24 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:items-end lg:gap-24 lg:py-32">
          <div>
            <p className="eyebrow">{siteConfig.license.name} License</p>
            <h1 className="mt-6 max-w-5xl font-[family-name:var(--font-display)] text-[clamp(3.5rem,8vw,7.5rem)] leading-[0.88] font-semibold tracking-[-0.06em] text-balance">
              Use it. Change it.
              <span className="text-primary block">Ship it.</span>
            </h1>
          </div>
          <div className="border-border border-t pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
              {siteConfig.name} is open source under the MIT License. You can
              use it in your own products, client projects, and commercial work.
            </p>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed text-pretty">
              This page is a plain-language summary. The full license text below
              is the agreement that applies.
            </p>
          </div>
        </header>

        <section className="grid gap-12 border-b py-16 md:py-24 lg:grid-cols-[minmax(14rem,0.55fr)_minmax(0,1.45fr)] lg:gap-24">
          <div>
            <Check className="text-primary" aria-hidden="true" size={28} />
            <h2 className="mt-6 font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.5rem)] leading-none font-semibold tracking-[-0.04em]">
              What you can do
            </h2>
          </div>
          <ul className="grid sm:grid-cols-2">
            {permissions.map((permission) => (
              <li
                className="border-border flex min-h-32 items-start gap-4 border-t py-6 pr-6 leading-relaxed sm:nth-[2]:border-t sm:nth-[even]:border-l sm:nth-[even]:pl-8 sm:nth-[odd]:pr-8"
                key={permission}
              >
                <Check
                  className="text-primary mt-1 shrink-0"
                  aria-hidden="true"
                  size={18}
                  strokeWidth={2}
                />
                <span>{permission}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-12 border-b py-16 md:py-24 lg:grid-cols-2 lg:gap-24">
          <div>
            <FileText className="text-primary" aria-hidden="true" size={28} />
            <h2 className="mt-6 font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.5rem)] leading-none font-semibold tracking-[-0.04em]">
              What you need to keep
            </h2>
            <p className="text-muted-foreground mt-6 max-w-xl leading-relaxed text-pretty">
              Include the copyright notice and MIT permission notice in copies
              or substantial portions of the software. There is no required
              attribution in your product interface.
            </p>
          </div>
          <div>
            <Scale className="text-primary" aria-hidden="true" size={28} />
            <h2 className="mt-6 font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.5rem)] leading-none font-semibold tracking-[-0.04em]">
              What is not promised
            </h2>
            <p className="text-muted-foreground mt-6 max-w-xl leading-relaxed text-pretty">
              The software is provided as is, without warranties. Tinkerers Labs
              and the contributors are not liable for claims or damages arising
              from its use.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">The legal text</p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2.5rem,5vw,4.5rem)] leading-none font-semibold tracking-[-0.045em]">
                MIT License
              </h2>
            </div>
            <ExternalLink
              className="font-semibold underline underline-offset-4"
              href={siteConfig.license.sourceUrl}
            >
              Read the source on GitHub
            </ExternalLink>
          </div>
          <pre className="mt-10 whitespace-pre-wrap">{licenseText.trim()}</pre>
          <p className="text-muted-foreground mt-8 max-w-3xl text-sm leading-relaxed text-pretty">
            Dependencies and third-party assets keep their own licenses. Check
            their package metadata or source files before redistributing them.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
