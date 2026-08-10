import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Package,
  type LucideIcon,
} from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
import { ExternalLink } from "@/components/external-link"
import { GitHubIcon } from "@/components/github-icon"
import { SignatureFooter } from "@/registry/default/signature-footer/signature-footer"
import { type ExternalLinkId, siteConfig } from "@/site.config"

const externalIcons: Record<ExternalLinkId, LucideIcon> = {
  npm: Package,
  github: GitHubIcon,
}

export function SiteFooter() {
  return (
    <SignatureFooter
      className="mt-16 [--background:var(--brand-paper)] [--foreground:var(--brand-ink)] [&_[data-slot=signature-footer-heading]]:font-[family-name:var(--font-display)] [&_[data-slot=signature-footer-wordmark]]:font-[family-name:var(--font-display)]"
      eyebrow={siteConfig.tagline}
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
          href={siteConfig.routes.components}
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
              {siteConfig.footerNavigation.map((item) => (
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
              {siteConfig.externalLinks.map((item) => {
                const Icon = externalIcons[item.id]

                return (
                  <li key={item.id}>
                    <ExternalLink
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
                    </ExternalLink>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>
      }
      brand={<BrandLogo />}
      meta={
        <p className="text-background/55 max-w-2xl leading-relaxed">
          <span>
            A product by{" "}
            <ExternalLink
              className="hover:text-primary underline decoration-current/35 underline-offset-4 transition-colors duration-150"
              href={siteConfig.organization.url}
            >
              {siteConfig.organization.name}
            </ExternalLink>
            .
          </span>{" "}
          <span>
            Built with{" "}
            <span className="text-primary inline-flex align-[-0.1em]">
              <Heart aria-hidden="true" fill="currentColor" size={14} />
              <span className="sr-only">love</span>
            </span>{" "}
            by{" "}
            <ExternalLink
              className="hover:text-primary underline decoration-current/35 underline-offset-4 transition-colors duration-150"
              href={siteConfig.author.url}
            >
              {siteConfig.author.name}
            </ExternalLink>
            .
          </span>{" "}
          <span>
            The source code is available on{" "}
            <ExternalLink
              className="hover:text-primary underline decoration-current/35 underline-offset-4 transition-colors duration-150"
              href={siteConfig.repository.url}
            >
              GitHub
            </ExternalLink>
            .
          </span>
        </p>
      }
      wordmark={siteConfig.name}
    />
  )
}
