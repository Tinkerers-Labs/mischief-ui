import * as React from "react"
import { ExternalLink } from "lucide-react"

import { cn } from "@/lib/utils"

export type SourceCardProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "title" | "children"
> & {
  title: React.ReactNode
  /** Makes the title a link. Opens in a new tab. */
  url?: string
  /** The retrieved passage. */
  snippet?: React.ReactNode
  /** Where it came from: a site, a file, a collection. */
  source?: React.ReactNode
  /** Position in the result list, shown as a marker. */
  index?: number
  /** Relevance from 0 to 1, shown as a bar and a percentage. */
  score?: number
  icon?: React.ReactNode
  footer?: React.ReactNode
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return undefined
  }
}

export function SourceCard({
  title,
  url,
  snippet,
  source,
  index,
  score,
  icon,
  footer,
  className,
  ...rootProps
}: SourceCardProps) {
  const origin = source ?? (url ? hostOf(url) : undefined)
  const percent =
    score === undefined
      ? undefined
      : Math.round(Math.min(1, Math.max(0, score)) * 100)

  return (
    <article
      data-slot="source-card"
      className={cn(
        "border-border bg-card/40 hover:bg-card min-w-0 rounded-[calc(var(--radius)+0.15rem)] border p-3 transition-colors duration-150 motion-reduce:transition-none",
        className
      )}
      {...rootProps}
    >
      <div className="flex items-start gap-2.5">
        {index !== undefined ? (
          <span
            aria-hidden="true"
            className="border-border text-muted-foreground mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border font-[family-name:var(--font-mono),monospace] text-[0.625rem]"
          >
            {index}
          </span>
        ) : null}

        {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}

        <div className="min-w-0 flex-1">
          <h3 className="text-foreground text-sm leading-snug font-medium">
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-primary inline-flex items-baseline gap-1 underline-offset-2 hover:underline"
              >
                {title}
                <ExternalLink
                  aria-hidden="true"
                  size={12}
                  className="shrink-0 self-center"
                />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : (
              title
            )}
          </h3>

          {origin ? (
            <p className="text-muted-foreground mt-0.5 truncate text-xs">
              {origin}
            </p>
          ) : null}

          {snippet ? (
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
              {snippet}
            </p>
          ) : null}

          {percent !== undefined ? (
            <div className="mt-2 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="bg-muted h-1 w-16 shrink-0 overflow-hidden rounded-full"
              >
                <span
                  className="bg-primary block h-full rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </span>
              <span className="text-muted-foreground font-[family-name:var(--font-mono),monospace] text-[0.6875rem] tabular-nums">
                {percent}% match
              </span>
            </div>
          ) : null}

          {footer ? <div className="mt-2">{footer}</div> : null}
        </div>
      </div>
    </article>
  )
}
