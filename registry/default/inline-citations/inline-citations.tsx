"use client"

import * as React from "react"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type CitationSource = {
  id: string
  title: string
  url?: string
  snippet?: string
}

export type InlineCitationsProps = React.HTMLAttributes<HTMLDivElement> & {
  sources: CitationSource[]
  sourceListLabel?: React.ReactNode
  showSourceList?: boolean
}

export type CitationProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "children"
> & {
  id: string
}

type CitationsContext = {
  order: Map<string, number>
  sources: Map<string, CitationSource>
  scope: string
}

const CitationsContext = React.createContext<CitationsContext | null>(null)

export function InlineCitations({
  sources,
  sourceListLabel = "Sources",
  showSourceList = true,
  children,
  className,
  ...rootProps
}: InlineCitationsProps) {
  const scope = React.useId().replace(/:/g, "")

  const context = React.useMemo<CitationsContext>(
    () => ({
      order: new Map(sources.map((source, index) => [source.id, index + 1])),
      sources: new Map(sources.map((source) => [source.id, source])),
      scope,
    }),
    [sources, scope]
  )

  return (
    <CitationsContext.Provider value={context}>
      <div data-slot="inline-citations" className={className} {...rootProps}>
        <div data-slot="inline-citations-body">{children}</div>

        {showSourceList && sources.length > 0 ? (
          <div data-slot="inline-citations-sources" className="mt-5">
            <p className="text-muted-foreground text-xs font-bold tracking-[0.08em] uppercase">
              {sourceListLabel}
            </p>

            <ol className="mt-2 grid gap-1.5">
              {sources.map((source, index) => (
                <li
                  key={source.id}
                  id={`${scope}-source-${source.id}`}
                  data-slot="inline-citations-source"
                  className="flex gap-2.5 text-sm"
                >
                  <span className="text-muted-foreground font-[family-name:var(--font-mono),monospace] text-xs tabular-nums">
                    {index + 1}
                  </span>

                  <span className="min-w-0">
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="hover:text-primary inline-flex items-center gap-1 font-semibold underline underline-offset-4"
                      >
                        {source.title}
                        <ArrowUpRight aria-hidden="true" size={13} />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    ) : (
                      <span className="font-semibold">{source.title}</span>
                    )}

                    {source.snippet ? (
                      <span className="text-muted-foreground mt-0.5 block text-xs leading-relaxed">
                        {source.snippet}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </CitationsContext.Provider>
  )
}

export function Citation({ id, className, ...anchorProps }: CitationProps) {
  const context = React.useContext(CitationsContext)

  if (!context) {
    throw new Error("Citation must be rendered inside InlineCitations.")
  }

  const number = context.order.get(id)
  const source = context.sources.get(id)

  if (number === undefined || source === undefined) return null

  return (
    <a
      data-slot="citation"
      href={`#${context.scope}-source-${id}`}
      className={cn(
        "bg-muted text-muted-foreground hover:bg-foreground hover:text-background focus-visible:ring-ring ml-0.5 inline-flex min-w-[1.25rem] translate-y-[-0.15em] items-center justify-center rounded-full px-1 align-baseline font-[family-name:var(--font-mono),monospace] text-[0.65em] leading-[1.5] font-semibold no-underline transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
        className
      )}
      {...anchorProps}
    >
      <span aria-hidden="true">{number}</span>
      <span className="sr-only">
        Source {number}: {source.title}
      </span>
    </a>
  )
}
