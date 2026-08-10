import Link from "next/link"
import { GitFork, Package, type LucideIcon } from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"

const navigation = [
  { href: "/docs/components/magnetic-tabs", label: "Components" },
  { href: "/docs", label: "Docs" },
  { href: "/brand", label: "Brand" },
] as const

const utilities = [
  {
    href: "https://www.npmjs.com/package/mischief-ui",
    label: "Mischief on npm",
    title: "npm",
    icon: Package,
  },
  {
    href: "https://github.com/Tinkerers-Labs/mischief-ui",
    label: "Mischief on GitHub",
    title: "GitHub",
    icon: GitFork,
  },
] satisfies ReadonlyArray<{
  href: string
  label: string
  title: string
  icon: LucideIcon
}>

function UtilityLink({
  href,
  label,
  title,
  icon: Icon,
}: (typeof utilities)[number]) {
  return (
    <a
      className="hover:text-primary inline-flex size-11 items-center justify-center transition-colors duration-150"
      href={href}
      aria-label={label}
      title={title}
    >
      <Icon aria-hidden="true" size={19} strokeWidth={1.9} />
    </a>
  )
}

export function SiteHeader() {
  return (
    <header className="border-border bg-background/90 fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-[90rem] items-center justify-between px-4 md:px-8 lg:px-12">
        <Link
          className="inline-flex items-center font-semibold text-inherit no-underline"
          href="/"
          aria-label="Mischief home"
        >
          <BrandLogo />
        </Link>
        <nav
          className="flex items-center gap-0 text-sm font-semibold sm:gap-2 lg:gap-4"
          aria-label="Main navigation"
        >
          {navigation.map((item) => (
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
          {utilities.map((item) => (
            <UtilityLink key={item.href} {...item} />
          ))}
        </nav>
      </div>
    </header>
  )
}
