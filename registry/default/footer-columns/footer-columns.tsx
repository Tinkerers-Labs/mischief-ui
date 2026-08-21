import * as React from "react"

import { cn } from "@/lib/utils"

export type FooterLink = {
  label: React.ReactNode
  href: string
  /** Opens in a new tab, and says so. */
  external?: boolean
}

export type FooterColumn = {
  label?: React.ReactNode
  links: readonly FooterLink[]
}

export type FooterLinkRenderer = (link: FooterLink) => React.ReactNode

export type FooterColumnsProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  columns: readonly FooterColumn[]
  /** Renders every link. Reach for it to use your framework's link. */
  renderLink?: FooterLinkRenderer
  /** Columns at the widest size. Defaults to three. */
  columnCount?: number
}

export const FOOTER_LABEL =
  "text-[0.6875rem] font-medium tracking-[0.09em] uppercase"

const LINK =
  "text-[color-mix(in_oklab,currentColor_70%,transparent)] text-sm no-underline transition-colors duration-150 hover:text-current motion-reduce:transition-none"

/** One link, rendered by you or by us. Shared by the columns and the row. */
export function FooterLinkItem({
  link,
  renderLink,
}: {
  link: FooterLink
  renderLink?: FooterLinkRenderer
}) {
  if (renderLink) return <>{renderLink(link)}</>

  return (
    <a
      href={link.href}
      {...(link.external
        ? { target: "_blank", rel: "noreferrer noopener" }
        : {})}
      className={LINK}
    >
      {link.label}
      {/* Punctuation-led, because the leading space of a text node is dropped
          when the accessible name is computed. */}
      {link.external ? (
        <span className="sr-only">, opens in a new tab</span>
      ) : null}
    </a>
  )
}

export function FooterColumns({
  columns,
  renderLink,
  columnCount = 3,
  className,
  style,
  ...rootProps
}: FooterColumnsProps) {
  return (
    <div
      data-slot="footer-columns"
      className={cn(
        "grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-[repeat(var(--footer-columns),minmax(0,1fr))]",
        className
      )}
      // A count rather than a class, because a class built from a variable is
      // never generated.
      style={
        { "--footer-columns": columnCount, ...style } as React.CSSProperties
      }
      {...rootProps}
    >
      {columns.map((column, index) => (
        <div key={index}>
          {column.label && (
            <p className={cn(FOOTER_LABEL, "text-current")}>{column.label}</p>
          )}
          <ul className={cn("grid gap-2.5", column.label && "mt-4")}>
            {column.links.map((link, linkIndex) => (
              <li key={`${link.href}-${linkIndex}`}>
                <FooterLinkItem link={link} renderLink={renderLink} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
