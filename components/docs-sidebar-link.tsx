"use client"

import Link, { type LinkProps } from "next/link"
import { usePathname } from "next/navigation"

/**
 * A sidebar link that says whether it is the page you are on. With a hundred
 * of these, "where am I" is the question the sidebar exists to answer, and a
 * colour alone does not answer it for a screen reader.
 */
export function DocsSidebarLink<T extends string>({
  href,
  children,
}: {
  href: LinkProps<T>["href"]
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const here = pathname === href || pathname === `${href}/`

  return (
    <Link aria-current={here ? "page" : undefined} href={href}>
      {children}
    </Link>
  )
}
