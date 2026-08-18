"use client"

import * as React from "react"
import { FileText } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type DocumentPage = {
  number: number
  src?: string
  label?: string
}

export type PageNavigatorProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "children" | "onChange"
> & {
  pages: DocumentPage[]
  activePage?: number
  defaultActivePage?: number
  onActivePageChange?: (page: number) => void
  orientation?: "vertical" | "horizontal"
  label?: string
  renderImage?: (props: {
    src: string
    alt: string
    className: string
  }) => React.ReactNode
}

export function PageNavigator({
  pages,
  activePage,
  defaultActivePage,
  onActivePageChange,
  orientation = "vertical",
  label = "Pages",
  renderImage,
  className,
  ...rootProps
}: PageNavigatorProps) {
  const [uncontrolled, setUncontrolled] = React.useState(
    defaultActivePage ?? pages[0]?.number ?? 1
  )
  const current = activePage ?? uncontrolled
  const isVertical = orientation === "vertical"

  const listRef = React.useRef<HTMLDivElement>(null)

  const select = (page: number) => {
    if (activePage === undefined) setUncontrolled(page)
    onActivePageChange?.(page)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const forward = isVertical ? "ArrowDown" : "ArrowRight"
    const backward = isVertical ? "ArrowUp" : "ArrowLeft"

    const index = pages.findIndex((page) => page.number === current)
    if (index < 0) return

    let next = index
    if (event.key === forward) next = Math.min(index + 1, pages.length - 1)
    else if (event.key === backward) next = Math.max(index - 1, 0)
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = pages.length - 1
    else return

    event.preventDefault()
    const page = pages[next]
    if (!page) return

    select(page.number)
    listRef.current
      ?.querySelector<HTMLElement>(`[data-page="${page.number}"]`)
      ?.focus()
  }

  return (
    <nav
      data-slot="page-navigator"
      aria-label={label}
      className={cn(
        "border-border bg-card text-card-foreground rounded-[var(--radius)] border",
        className
      )}
      {...rootProps}
    >
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        aria-orientation={orientation}
        className={cn(
          "flex gap-2 p-2",
          isVertical
            ? "max-h-[26rem] flex-col overflow-y-auto"
            : "flex-row overflow-x-auto"
        )}
        onKeyDown={onKeyDown}
      >
        {pages.map((page) => {
          const isActive = page.number === current

          return (
            <button
              key={page.number}
              type="button"
              role="tab"
              data-page={page.number}
              data-slot="page-navigator-page"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className={cn(
                "focus-visible:ring-ring group shrink-0 rounded-[calc(var(--radius)-0.25rem)] p-1 focus-visible:ring-2 focus-visible:outline-none",
                isActive ? "bg-muted" : "hover:bg-muted/60"
              )}
              onClick={() => select(page.number)}
            >
              <span
                className={cn(
                  "bg-background flex aspect-[3/4] w-20 items-center justify-center overflow-hidden rounded-[3px] border",
                  isActive ? "border-primary" : "border-border"
                )}
              >
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
                    size={20}
                  />
                )}
              </span>

              <span
                className={cn(
                  "mt-1 block text-center font-[family-name:var(--font-mono),monospace] text-[0.65rem] tabular-nums",
                  isActive
                    ? "text-foreground font-bold"
                    : "text-muted-foreground"
                )}
              >
                {page.label ?? page.number}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
