import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  Package,
  type LucideIcon,
} from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
import { GitHubIcon } from "@/components/github-icon"
import {
  externalLinks,
  type ExternalLinkId,
  siteNavigation,
  tinkerersLabsUrl,
} from "@/lib/site-links"

const externalIcons: Record<ExternalLinkId, LucideIcon> = {
  npm: Package,
  github: GitHubIcon,
}

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background mt-16 overflow-hidden">
      <div className="mx-auto max-w-[90rem] px-4 pt-12 md:px-8 md:pt-16 lg:px-12 lg:pt-24">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:gap-24">
          <div>
            <p className="text-background/60 text-xs font-bold tracking-[0.08em] uppercase">
              Good interfaces deserve a little mischief
            </p>
            <h2 className="mt-6 max-w-4xl font-[family-name:var(--font-display)] text-[clamp(3rem,7vw,7rem)] leading-[0.9] font-semibold tracking-[-0.055em] text-balance">
              Take the code.
              <span className="text-primary block">Make it yours.</span>
            </h2>
            <p className="text-background/70 mt-8 max-w-xl text-lg leading-relaxed text-pretty">
              Install what helps, change what does not, and ship something that
              feels like you made it.
            </p>
            <Link
              className="bg-background text-foreground mt-8 inline-flex min-h-11 items-center gap-3 rounded-full px-5 font-semibold no-underline transition-transform duration-150 hover:translate-x-1"
              href="/docs/components/magnetic-tabs"
            >
              Browse components
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>

          <nav
            className="grid content-end gap-10 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
            aria-label="Footer navigation"
          >
            <div>
              <p className="text-background/45 text-xs font-bold tracking-[0.08em] uppercase">
                Explore
              </p>
              <ul className="mt-4 grid gap-1">
                {siteNavigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      className="hover:text-primary inline-flex min-h-11 items-center text-lg font-semibold no-underline transition-colors duration-150"
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-background/45 text-xs font-bold tracking-[0.08em] uppercase">
                Elsewhere
              </p>
              <ul className="mt-4 grid gap-1">
                {externalLinks.map((item) => {
                  const Icon = externalIcons[item.id]

                  return (
                    <li key={item.id}>
                      <a
                        className="hover:text-primary inline-flex min-h-11 items-center gap-3 text-lg font-semibold no-underline transition-colors duration-150"
                        href={item.href}
                        aria-label={item.accessibleLabel}
                      >
                        <Icon aria-hidden="true" size={18} strokeWidth={1.9} />
                        {item.label}
                        <ArrowUpRight
                          className="text-background/45"
                          aria-hidden="true"
                          size={15}
                        />
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </nav>
        </div>

        <div className="border-background/15 mt-16 flex flex-col gap-6 border-t py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <BrandLogo />
          <div className="text-background/55 flex flex-wrap gap-x-6 gap-y-2">
            <span>MIT licensed.</span>
            <span>
              Built carefully at{" "}
              <a
                className="hover:text-primary underline decoration-current/35 underline-offset-4 transition-colors duration-150"
                href={tinkerersLabsUrl}
              >
                Tinkerers Labs
              </a>
              .
            </span>
          </div>
        </div>

        <div
          className="text-background/[0.07] overflow-hidden pt-8 text-center font-[family-name:var(--font-display)] text-[clamp(5rem,17vw,15rem)] leading-[0.72] font-semibold tracking-[-0.075em] whitespace-nowrap select-none"
          aria-hidden="true"
        >
          Mischief
        </div>
      </div>
    </footer>
  )
}
