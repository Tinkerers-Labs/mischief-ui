import * as React from "react"

import { cn } from "@/lib/utils"

export type NotFoundProps = Omit<React.HTMLAttributes<HTMLElement>, "title"> & {
  /** The status, shown small above the title. */
  code?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /** What to do instead: a link home, a link to the docs. */
  actions?: React.ReactNode
}

/**
 * The page-scale member of the family: a heading you can read across a room,
 * where Empty State fills a panel and Empty Row fills a line. Anything else
 * worth offering -- a search, a list of likely destinations -- goes in as
 * children, beneath the actions.
 */
export function NotFound({
  code,
  title,
  description,
  actions,
  children,
  className,
  ...rootProps
}: NotFoundProps) {
  return (
    <section
      data-slot="not-found"
      className={cn("mx-auto w-full max-w-3xl px-4 py-20 md:py-28", className)}
      {...rootProps}
    >
      {code && (
        <p
          data-slot="not-found-code"
          className="text-muted-foreground text-[0.6875rem] font-medium tracking-[0.09em] uppercase"
        >
          {code}
        </p>
      )}

      <h1
        data-slot="not-found-title"
        className="mt-4 text-[clamp(2rem,5vw,3.5rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance"
      >
        {title}
      </h1>

      {description && (
        <p
          data-slot="not-found-description"
          className="text-muted-foreground mt-5 max-w-[52ch] text-base leading-relaxed text-pretty"
        >
          {description}
        </p>
      )}

      {actions && (
        <div
          data-slot="not-found-actions"
          className="mt-8 flex flex-wrap items-center gap-4"
        >
          {actions}
        </div>
      )}

      {children}
    </section>
  )
}
