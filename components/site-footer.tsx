import type { Route } from "next"
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
import {
  SignatureFooter,
  type FooterColumn,
} from "@/registry/default/signature-footer/signature-footer"
import { componentFamilies } from "@/lib/component-docs"
import { type ExternalLinkId, siteConfig } from "@/site.config"

const externalIcons: Record<ExternalLinkId, LucideIcon> = {
  npm: Package,
  github: GitHubIcon,
}

const columns: FooterColumn[] = [
  {
    label: "Families",
    links: componentFamilies.map((family) => ({
      href: `/families/${family.slug}`,
      label: family.name,
    })),
  },
  {
    label: "Explore",
    links: siteConfig.footerNavigation.map(({ href, label }) => ({
      href,
      label,
    })),
  },
  {
    label: "Elsewhere",
    links: siteConfig.externalLinks.map((item) => {
      const Icon = externalIcons[item.id]

      return {
        href: item.href,
        external: true,
        label: (
          <>
            <Icon aria-hidden="true" size={16} strokeWidth={1.9} />
            {item.label}
            <ArrowUpRight aria-hidden="true" size={13} className="opacity-60" />
          </>
        ),
      }
    }),
  },
]

export function SiteFooter() {
  return (
    <SignatureFooter
      className="mt-16 [--background:var(--brand-paper)] [--foreground:var(--brand-ink)] [&_[data-slot=footer-columns]_ul]:gap-0.5 [&_[data-slot=signature-footer-heading]]:font-[family-name:var(--font-display)] [&_[data-slot=signature-footer-wordmark]]:font-[family-name:var(--font-display)]"
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
      columns={columns}
      renderLink={({ href, label, external }) => {
        const className =
          // 44px is the touch minimum and it is the row pitch too, which with
          // eleven families made the footer taller than the page. A fine
          // pointer gets the 32px target the guidelines allow it instead.
          "hover:text-primary inline-flex min-h-11 items-center gap-2.5 text-sm font-medium text-[color-mix(in_oklab,currentColor_70%,transparent)] no-underline transition-colors duration-150 pointer-fine:min-h-8 motion-reduce:transition-none"

        return external ? (
          <ExternalLink className={className} href={href}>
            {label}
          </ExternalLink>
        ) : (
          // The component's href is a plain string; typed routes want their own.
          <Link className={className} href={href as Route}>
            {label}
          </Link>
        )
      }}
      related={{
        label: "Also from us",
        links: siteConfig.elsewhere.map((item) => ({
          ...item,
          external: true,
        })),
      }}
      brand={<BrandLogo />}
      meta={
        <p className="max-w-2xl leading-relaxed text-[color-mix(in_oklab,currentColor_60%,transparent)]">
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
