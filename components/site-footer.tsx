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
import { SignatureFooter } from "@/registry/default/signature-footer/signature-footer"

const externalIcons: Record<ExternalLinkId, LucideIcon> = {
  npm: Package,
  github: GitHubIcon,
}

export function SiteFooter() {
  return (
    <SignatureFooter
      className="mt-16 [&_[data-slot=signature-footer-heading]]:font-[family-name:var(--font-display)] [&_[data-slot=signature-footer-wordmark]]:font-[family-name:var(--font-display)]"
      eyebrow="Good interfaces deserve a little mischief"
      heading={
        <>
          Take the code.
          <span className="text-primary block">Make it yours.</span>
        </>
      }
      description="Install what helps, change what does not, and ship something that feels like you made it."
      action={
        <Link
          className="bg-background text-foreground inline-flex min-h-11 items-center gap-3 rounded-full px-5 font-semibold no-underline transition-transform duration-150 hover:translate-x-1"
          href="/docs/components/magnetic-tabs"
        >
          Browse components
          <ArrowRight aria-hidden="true" size={18} />
        </Link>
      }
      navigation={
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
      }
      brand={<BrandLogo />}
      meta={
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
      }
      wordmark="Mischief"
    />
  )
}
