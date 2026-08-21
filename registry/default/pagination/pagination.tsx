import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export type PaginationLink = {
  page: number
  children: React.ReactNode
  "aria-label"?: string
  "aria-current"?: "page"
  className: string
}

export type PaginationProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "children" | "onChange"
> & {
  /** One-based. */
  page: number
  pageCount: number
  onPageChange?: (page: number) => void
  /** Pages either side of the current one. Defaults to 1. */
  siblingCount?: number
  /** Pages kept at each end. Defaults to 1. */
  boundaryCount?: number
  label?: string
  /** Renders every page as your own link, for a paginated URL. */
  renderLink?: (link: PaginationLink) => React.ReactNode
}

const GAP = "gap"

/** The pages to draw, with gaps where the run is broken. */
export function paginationRange({
  page,
  pageCount,
  siblingCount = 1,
  boundaryCount = 1,
}: {
  page: number
  pageCount: number
  siblingCount?: number
  boundaryCount?: number
}): (number | typeof GAP)[] {
  if (pageCount <= 0) return []

  const all = Array.from({ length: pageCount }, (_, index) => index + 1)
  // Every gap costs a slot, so showing them is only worth it past this many.
  if (pageCount <= boundaryCount * 2 + siblingCount * 2 + 3) return all

  const start = Math.max(
    Math.min(
      page - siblingCount,
      pageCount - boundaryCount - siblingCount * 2 - 1
    ),
    boundaryCount + 2
  )
  const end = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    pageCount - boundaryCount - 1
  )

  return [
    ...all.slice(0, boundaryCount),
    ...(start > boundaryCount + 1 ? [GAP as typeof GAP] : []),
    ...all.slice(start - 1, end),
    ...(end < pageCount - boundaryCount ? [GAP as typeof GAP] : []),
    ...all.slice(pageCount - boundaryCount),
  ]
}

const ITEM =
  "inline-flex min-h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm no-underline transition-colors duration-150 motion-reduce:transition-none"
const IDLE = "text-muted-foreground hover:bg-muted hover:text-foreground"
const CURRENT = "border-border bg-card text-foreground border font-medium"

export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  label = "Pagination",
  renderLink,
  className,
  ...rootProps
}: PaginationProps) {
  if (pageCount <= 1) return null

  const pages = paginationRange({
    page,
    pageCount,
    siblingCount,
    boundaryCount,
  })

  function item(link: PaginationLink) {
    if (renderLink) return renderLink(link)

    const { page: target, children, className: itemClass, ...rest } = link

    return (
      <button
        type="button"
        className={itemClass}
        disabled={onPageChange === undefined}
        onClick={() => onPageChange?.(target)}
        {...rest}
      >
        {children}
      </button>
    )
  }

  return (
    <nav
      aria-label={label}
      data-slot="pagination"
      className={cn("flex items-center gap-1", className)}
      {...rootProps}
    >
      {page > 1 &&
        item({
          page: page - 1,
          "aria-label": "Previous page",
          className: cn(ITEM, IDLE),
          children: <ChevronLeft aria-hidden="true" size={16} />,
        })}

      {pages.map((entry, index) =>
        entry === GAP ? (
          <span
            key={`gap-${index}`}
            aria-hidden="true"
            className="text-muted-foreground px-1 text-sm"
          >
            …
          </span>
        ) : (
          <React.Fragment key={entry}>
            {item({
              page: entry,
              "aria-label": `Page ${entry}`,
              ...(entry === page ? { "aria-current": "page" as const } : {}),
              className: cn(ITEM, entry === page ? CURRENT : IDLE),
              children: entry,
            })}
          </React.Fragment>
        )
      )}

      {page < pageCount &&
        item({
          page: page + 1,
          "aria-label": "Next page",
          className: cn(ITEM, IDLE),
          children: <ChevronRight aria-hidden="true" size={16} />,
        })}
    </nav>
  )
}
