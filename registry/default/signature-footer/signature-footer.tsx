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

export interface SignatureFooterProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> {
  eyebrow?: React.ReactNode
  /** A line to lead with, or a logo. Omit for a footer that is only links. */
  heading?: React.ReactNode
  description?: React.ReactNode
  /** A row of icon links, under the description. */
  social?: React.ReactNode
  action?: React.ReactNode
  /** Labelled link columns. Takes precedence over navigation. */
  columns?: readonly FooterColumn[]
  /** Your own markup, when the columns do not fit what you need. */
  navigation?: React.ReactNode
  /** A wrapping row of links set apart from the columns, with its own label. */
  related?: FooterColumn
  brand?: React.ReactNode
  meta?: React.ReactNode
  /** Sits in the middle of the closing row, for terms and the like. */
  legal?: React.ReactNode
  /** Closes the row on the right, for a status or a region. */
  status?: React.ReactNode
  /** Renders every link. Reach for it to use your framework's link. */
  renderLink?: (link: FooterLink) => React.ReactNode
  wordmark: string
}

/*
 * Shades are mixed from the footer's own text colour rather than a theme
 * token, so the whole thing works on a light ground as readily as a dark one:
 * set a background and a text colour on the element and everything inside
 * follows. They are written out in full because Tailwind reads class names as
 * literal text -- one built from a variable is never generated.
 */

const LABEL = "text-[0.6875rem] font-medium tracking-[0.09em] uppercase"

function FooterLinks({
  links,
  renderLink,
  className,
}: {
  links: readonly FooterLink[]
  renderLink?: (link: FooterLink) => React.ReactNode
  className?: string
}) {
  return (
    <ul className={cn("grid gap-2.5", className)}>
      {links.map((link, index) => (
        <li key={typeof link.href === "string" ? link.href : index}>
          {renderLink ? (
            renderLink(link)
          ) : (
            <a
              href={link.href}
              {...(link.external
                ? { target: "_blank", rel: "noreferrer noopener" }
                : {})}
              className={
                "text-sm text-[color-mix(in_oklab,currentColor_70%,transparent)] no-underline transition-colors duration-150 hover:text-current motion-reduce:transition-none"
              }
            >
              {link.label}
              {/* Punctuation-led, because the leading space of a text node is
                  dropped when the accessible name is computed. */}
              {link.external ? (
                <span className="sr-only">, opens in a new tab</span>
              ) : null}
            </a>
          )}
        </li>
      ))}
    </ul>
  )
}

export const SignatureFooter = React.forwardRef<
  HTMLElement,
  SignatureFooterProps
>(function SignatureFooter(
  {
    eyebrow,
    heading,
    description,
    social,
    action,
    columns,
    navigation,
    related,
    brand,
    meta,
    legal,
    status,
    renderLink,
    wordmark,
    className,
    ...props
  },
  forwardedRef
) {
  const hasClosingRow = brand || meta || legal || status

  return (
    <footer
      {...props}
      data-slot="signature-footer"
      ref={forwardedRef}
      className={cn("bg-foreground text-background overflow-hidden", className)}
    >
      <div
        data-slot="signature-footer-inner"
        className="mx-auto max-w-[90rem] px-4 pt-12 md:px-8 md:pt-16 lg:px-12 lg:pt-20"
      >
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-20">
          <div>
            {eyebrow && (
              <p
                data-slot="signature-footer-eyebrow"
                className={cn(
                  LABEL,
                  "text-[color-mix(in_oklab,currentColor_55%,transparent)]"
                )}
              >
                {eyebrow}
              </p>
            )}
            {heading && (
              <h2
                data-slot="signature-footer-heading"
                className="mt-4 max-w-3xl text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance"
              >
                {heading}
              </h2>
            )}
            {description && (
              <p
                data-slot="signature-footer-description"
                className={cn(
                  "mt-5 max-w-[36ch] text-sm leading-relaxed text-pretty",
                  "text-[color-mix(in_oklab,currentColor_65%,transparent)]"
                )}
              >
                {description}
              </p>
            )}
            {social && (
              <div
                data-slot="signature-footer-social"
                className="mt-6 flex flex-wrap items-center gap-2"
              >
                {social}
              </div>
            )}
            {action && (
              <div data-slot="signature-footer-action" className="mt-6">
                {action}
              </div>
            )}
          </div>

          {columns && columns.length > 0 ? (
            <div
              data-slot="signature-footer-columns"
              className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
            >
              {columns.map((column, index) => (
                <div key={index}>
                  {column.label && (
                    <p className={cn(LABEL, "text-current")}>{column.label}</p>
                  )}
                  <FooterLinks
                    className={column.label ? "mt-4" : undefined}
                    links={column.links}
                    renderLink={renderLink}
                  />
                </div>
              ))}
            </div>
          ) : navigation ? (
            <div data-slot="signature-footer-navigation" className="self-end">
              {navigation}
            </div>
          ) : null}
        </div>

        {related && related.links.length > 0 && (
          <div
            data-slot="signature-footer-related"
            className={cn(
              "mt-14 border-t border-dashed pt-8",
              "border-[color-mix(in_oklab,currentColor_20%,transparent)]"
            )}
          >
            {related.label && (
              <p className={cn(LABEL, "text-current")}>{related.label}</p>
            )}
            <FooterLinks
              className={cn(
                "flex flex-wrap gap-x-6 gap-y-2.5",
                related.label && "mt-4"
              )}
              links={related.links}
              renderLink={renderLink}
            />
          </div>
        )}

        {hasClosingRow && (
          <div
            data-slot="signature-footer-meta"
            className={cn(
              "mt-12 flex flex-col gap-5 border-t py-5 text-xs sm:flex-row sm:items-center sm:justify-between",
              "border-[color-mix(in_oklab,currentColor_15%,transparent)]"
            )}
          >
            {brand}
            {meta}
            {legal}
            {status}
          </div>
        )}

        <div
          data-slot="signature-footer-wordmark"
          className={cn(
            "overflow-hidden pt-6 text-center text-[clamp(5rem,17vw,15rem)] leading-[0.72] font-semibold tracking-[-0.075em] whitespace-nowrap select-none",
            "text-[color-mix(in_oklab,currentColor_7%,transparent)]"
          )}
          aria-hidden="true"
        >
          {wordmark}
        </div>
      </div>
    </footer>
  )
})
