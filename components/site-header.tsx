import Link from "next/link"
import { Package, type LucideIcon } from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
import { ExternalLink } from "@/components/external-link"
import { GitHubIcon } from "@/components/github-icon"
import { ThemeToggle } from "@/components/theme-toggle"
import { type ExternalLinkId, siteConfig } from "@/site.config"

const utilityIcons: Record<ExternalLinkId, LucideIcon> = {
  npm: Package,
  github: GitHubIcon,
}

function UtilityLink({
  href,
  label,
  title,
  icon: Icon,
}: {
  href: string
  label: string
  title: string
  icon: LucideIcon
}) {
  return (
    <ExternalLink
      className="hover:text-primary inline-flex size-11 items-center justify-center transition-colors duration-150"
      href={href}
      aria-label={label}
      title={title}
    >
      <Icon aria-hidden="true" size={19} strokeWidth={1.9} />
    </ExternalLink>
  )
}

export function SiteHeader() {
  return (
    <header className="border-border bg-background/90 fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between px-4 md:px-8 lg:px-12">
        <Link
          className="inline-flex items-center font-semibold text-inherit no-underline"
          href={siteConfig.routes.home}
          aria-label={`${siteConfig.name} home`}
        >
          <BrandLogo />
        </Link>
        <nav
          className="flex items-center gap-0 text-sm font-semibold sm:gap-2 lg:gap-4"
          aria-label="Main navigation"
        >
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              className="hover:text-primary hidden min-h-11 items-center text-inherit no-underline transition-colors duration-150 min-[520px]:inline-flex"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
          <span
            className="bg-border mx-1 hidden h-5 w-px min-[520px]:block"
            aria-hidden="true"
          />
          {siteConfig.externalLinks.map((item) => (
            <UtilityLink
              key={item.id}
              href={item.href}
              label={item.accessibleLabel}
              title={item.label}
              icon={utilityIcons[item.id]}
            />
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
