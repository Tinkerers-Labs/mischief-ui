import * as React from "react"

import { cn } from "@/lib/utils"
import {
  FOOTER_LABEL,
  FooterColumns,
  type FooterColumn,
  type FooterLink,
  type FooterLinkRenderer,
} from "@/registry/default/footer-columns/footer-columns"
import { FooterRow } from "@/registry/default/footer-row/footer-row"
import { FooterWordmark } from "@/registry/default/footer-wordmark/footer-wordmark"

export type { FooterColumn, FooterLink, FooterLinkRenderer }

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
  /** Columns at the widest size. Defaults to three. */
  columnCount?: number
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
  renderLink?: FooterLinkRenderer
  wordmark: string
}

/*
 * A block, and only a block: the columns, the row, and the wordmark are their
 * own components and this arranges them. Reach for those directly when your
 * footer is a different shape, rather than waiting for a slot to appear here.
 *
 * Shades are mixed from the footer's own text colour rather than a theme
 * token, so it works on a light ground as readily as a dark one.
 */
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
    columnCount,
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
                  FOOTER_LABEL,
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
                className="mt-5 max-w-[36ch] text-sm leading-relaxed text-pretty text-[color-mix(in_oklab,currentColor_65%,transparent)]"
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
            <FooterColumns
              columnCount={columnCount}
              columns={columns}
              renderLink={renderLink}
            />
          ) : navigation ? (
            <div data-slot="signature-footer-navigation" className="self-end">
              {navigation}
            </div>
          ) : null}
        </div>

        {related && (
          <FooterRow
            className="mt-14"
            data-slot="signature-footer-related"
            label={related.label}
            links={related.links}
            renderLink={renderLink}
          />
        )}

        {hasClosingRow && (
          <div
            data-slot="signature-footer-meta"
            className="mt-12 flex flex-col gap-5 border-t border-[color-mix(in_oklab,currentColor_15%,transparent)] py-5 text-xs sm:flex-row sm:items-center sm:justify-between"
          >
            {brand}
            {meta}
            {legal}
            {status}
          </div>
        )}

        <FooterWordmark className="pt-6" data-slot="signature-footer-wordmark">
          {wordmark}
        </FooterWordmark>
      </div>
    </footer>
  )
})
