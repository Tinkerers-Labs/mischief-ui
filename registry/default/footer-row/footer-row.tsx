import * as React from "react"

import { cn } from "@/lib/utils"

/** The same shapes Footer Columns uses, so the two interchange. */
export type FooterLink = {
  label: React.ReactNode
  href: string
  external?: boolean
}

export type FooterLinkRenderer = (link: FooterLink) => React.ReactNode

const LABEL = "text-[0.6875rem] font-medium tracking-[0.09em] uppercase"

const LINK =
  "text-[color-mix(in_oklab,currentColor_70%,transparent)] text-sm no-underline transition-colors duration-150 hover:text-current motion-reduce:transition-none"

export type FooterRowProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  links: readonly FooterLink[]
  label?: React.ReactNode
  renderLink?: FooterLinkRenderer
  /** A dashed rule above, to set the row apart. Defaults to true. */
  rule?: boolean
}

/**
 * A wrapping row of links under its own label: sister products, a legal
 * strip, an A to Z index. Anything that is a list rather than a column.
 */
export function FooterRow({
  links,
  label,
  renderLink,
  rule = true,
  className,
  ...rootProps
}: FooterRowProps) {
  if (links.length === 0) return null

  return (
    <div
      data-slot="footer-row"
      className={cn(
        rule &&
          "border-t border-dashed border-[color-mix(in_oklab,currentColor_20%,transparent)] pt-8",
        className
      )}
      {...rootProps}
    >
      {label && <p className={cn(LABEL, "text-current")}>{label}</p>}
      <ul className={cn("flex flex-wrap gap-x-6 gap-y-2.5", label && "mt-4")}>
        {links.map((link, index) => (
          <li key={`${link.href}-${index}`}>
            {renderLink ? (
              renderLink(link)
            ) : (
              <a
                href={link.href}
                {...(link.external
                  ? { target: "_blank", rel: "noreferrer noopener" }
                  : {})}
                className={LINK}
              >
                {link.label}
                {/* Punctuation-led: a leading space is dropped when the
                    accessible name is computed. */}
                {link.external ? (
                  <span className="sr-only">, opens in a new tab</span>
                ) : null}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
