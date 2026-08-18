"use client"

import * as React from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

export type MarkdownBlockKind =
  "heading" | "paragraph" | "table" | "list" | "figure" | "footer"

export type MarkdownBlock = {
  id: string
  kind?: MarkdownBlockKind
  content: string
  page?: number
  label?: string
}

export type MarkdownBlocksProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "children" | "onSelect"
> & {
  blocks: MarkdownBlock[]
  activeId?: string | null
  defaultActiveId?: string | null
  onActiveChange?: (id: string | null) => void
  showKinds?: boolean
  label?: string
}

const kindLabel: Record<MarkdownBlockKind, string> = {
  heading: "Heading",
  paragraph: "Paragraph",
  table: "Table",
  list: "List",
  figure: "Figure",
  footer: "Footer",
}

export function MarkdownBlocks({
  blocks,
  activeId,
  defaultActiveId = null,
  onActiveChange,
  showKinds = true,
  label = "Document blocks",
  className,
  ...rootProps
}: MarkdownBlocksProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultActiveId)
  const selected = activeId === undefined ? uncontrolled : activeId

  const select = (id: string) => {
    const next = selected === id ? null : id
    if (activeId === undefined) setUncontrolled(next)
    onActiveChange?.(next)
  }

  return (
    <section
      data-slot="markdown-blocks"
      aria-label={label}
      className={cn(
        "border-border bg-card text-card-foreground rounded-[var(--radius)] border",
        className
      )}
      {...rootProps}
    >
      <ol className="grid gap-1 p-2">
        {blocks.map((block) => {
          const isActive = block.id === selected

          return (
            <li key={block.id}>
              <button
                type="button"
                data-slot="markdown-block"
                data-kind={block.kind}
                data-active={isActive || undefined}
                aria-pressed={isActive}
                className={cn(
                  "focus-visible:ring-ring w-full rounded-[calc(var(--radius)-0.25rem)] border border-transparent px-3 py-2 text-left text-sm focus-visible:ring-2 focus-visible:outline-none",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "hover:border-border hover:bg-muted/40"
                )}
                onClick={() => select(block.id)}
              >
                {showKinds && block.kind ? (
                  <span className="text-muted-foreground mb-1 flex items-center gap-2 text-[0.65rem] font-bold tracking-[0.08em] uppercase">
                    {block.label ?? kindLabel[block.kind]}
                    {block.page != null ? (
                      <span className="font-[family-name:var(--font-mono),monospace] normal-case">
                        p.{block.page}
                      </span>
                    ) : null}
                  </span>
                ) : null}

                <div className="[&_a]:underline [&_a]:underline-offset-4 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:leading-relaxed [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_ul]:list-disc [&_ul]:pl-5 [&>*+*]:mt-2">
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {block.content}
                  </Markdown>
                </div>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
