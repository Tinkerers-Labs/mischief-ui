"use client"

import * as React from "react"
import { FileText, Scissors, Undo2 } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type SplitPage = {
  number: number
  src?: string
  label?: string
}

export type DocumentSegment = {
  index: number
  pages: SplitPage[]
}

export type DocumentSplitsProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "children" | "onChange"
> & {
  pages: SplitPage[]
  splitAfter?: number[]
  defaultSplitAfter?: number[]
  onSplitChange?: (splitAfter: number[]) => void
  segmentLabel?: (segment: DocumentSegment) => React.ReactNode
  label?: string
  renderImage?: (props: {
    src: string
    alt: string
    className: string
  }) => React.ReactNode
}

function toSegments(pages: SplitPage[], splitAfter: Set<number>) {
  const segments: SplitPage[][] = [[]]

  for (const page of pages) {
    segments[segments.length - 1]?.push(page)
    if (splitAfter.has(page.number) && page !== pages[pages.length - 1]) {
      segments.push([])
    }
  }

  return segments.filter((segment) => segment.length > 0)
}

export function DocumentSplits({
  pages,
  splitAfter,
  defaultSplitAfter = [],
  onSplitChange,
  segmentLabel,
  label = "Document splits",
  renderImage,
  className,
  ...rootProps
}: DocumentSplitsProps) {
  const [uncontrolled, setUncontrolled] =
    React.useState<number[]>(defaultSplitAfter)
  const splits = splitAfter ?? uncontrolled
  const splitSet = React.useMemo(() => new Set(splits), [splits])

  const setSplits = (next: number[]) => {
    const sorted = [...next].sort((a, b) => a - b)
    if (splitAfter === undefined) setUncontrolled(sorted)
    onSplitChange?.(sorted)
  }

  const toggle = (pageNumber: number) => {
    setSplits(
      splitSet.has(pageNumber)
        ? splits.filter((entry) => entry !== pageNumber)
        : [...splits, pageNumber]
    )
  }

  const segments = React.useMemo(
    () => toSegments(pages, splitSet),
    [pages, splitSet]
  )

  return (
    <section
      data-slot="document-splits"
      aria-label={label}
      className={cn(
        "border-border bg-card text-card-foreground rounded-[var(--radius)] border",
        className
      )}
      {...rootProps}
    >
      <div className="border-border flex items-center gap-3 border-b px-3.5 py-2.5">
        <p className="text-sm font-semibold">
          {segments.length} {segments.length === 1 ? "document" : "documents"}
        </p>

        {splits.length > 0 ? (
          <button
            type="button"
            data-slot="document-splits-reset"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-xs font-semibold focus-visible:ring-2 focus-visible:outline-none"
            onClick={() => setSplits([])}
          >
            <Undo2 aria-hidden="true" size={13} />
            Clear splits
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 p-3.5">
        {segments.map((segment, index) => (
          <div key={segment[0]?.number ?? index} data-slot="document-segment">
            <p className="text-muted-foreground mb-2 text-xs font-bold tracking-[0.08em] uppercase">
              {segmentLabel?.({ index, pages: segment }) ??
                `Document ${index + 1} · ${segment.length} ${segment.length === 1 ? "page" : "pages"}`}
            </p>

            <div className="flex flex-wrap items-start gap-1">
              {segment.map((page) => {
                const isLastOverall =
                  page.number === pages[pages.length - 1]?.number
                const isSplit = splitSet.has(page.number)

                return (
                  <React.Fragment key={page.number}>
                    <span
                      data-slot="document-splits-page"
                      className="grid justify-items-center gap-1"
                    >
                      <span className="border-border bg-background flex aspect-[3/4] w-16 items-center justify-center overflow-hidden rounded-[3px] border">
                        {page.src ? (
                          renderImage ? (
                            renderImage({
                              src: page.src,
                              alt: "",
                              className: "size-full object-cover",
                            })
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              alt=""
                              className="size-full object-cover"
                              src={page.src}
                            />
                          )
                        ) : (
                          <FileText
                            aria-hidden="true"
                            className="text-muted-foreground"
                            size={16}
                          />
                        )}
                      </span>
                      <span className="text-muted-foreground font-[family-name:var(--font-mono),monospace] text-[0.65rem] tabular-nums">
                        {page.label ?? page.number}
                      </span>
                    </span>

                    {isLastOverall ? null : (
                      <button
                        type="button"
                        data-slot="document-splits-divider"
                        data-split={isSplit || undefined}
                        aria-pressed={isSplit}
                        className={cn(
                          "focus-visible:ring-ring group mt-4 flex h-16 w-6 shrink-0 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none",
                          isSplit
                            ? "text-primary"
                            : "text-muted-foreground/40 hover:text-foreground"
                        )}
                        onClick={() => toggle(page.number)}
                      >
                        <span className="sr-only">
                          {isSplit ? "Remove split after" : "Split after"} page{" "}
                          {page.number}
                        </span>
                        <Scissors aria-hidden="true" size={14} />
                      </button>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
