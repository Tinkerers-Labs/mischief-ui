import * as React from "react"

import { cn } from "@/lib/utils"
import {
  FOOTER_LABEL,
  FooterLinkItem,
  type FooterLink,
  type FooterLinkRenderer,
} from "@/registry/default/footer-columns/footer-columns"

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
      {label && <p className={cn(FOOTER_LABEL, "text-current")}>{label}</p>}
      <ul className={cn("flex flex-wrap gap-x-6 gap-y-2.5", label && "mt-4")}>
        {links.map((link, index) => (
          <li key={`${link.href}-${index}`}>
            <FooterLinkItem link={link} renderLink={renderLink} />
          </li>
        ))}
      </ul>
    </div>
  )
}
