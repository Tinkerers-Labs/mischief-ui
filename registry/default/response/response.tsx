"use client"

import * as React from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"

export type ResponseProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  children: string
  /** Still arriving. Half-written markdown is closed off rather than shown raw. */
  streaming?: boolean
  /**
   * Renders a fenced block. The default is a plain panel, so this component
   * installs on its own; pass Code Block here if you have it and want the copy
   * control and the line numbers with it.
   */
  renderCode?: (code: string, language?: string) => React.ReactNode
}

/**
 * An assistant's answer rendered as markdown, including while it is still
 * being written.
 *
 * Streaming markdown is markdown that is briefly invalid: a fence opened and
 * not yet closed, a bold marker with nothing after it. Rendering it as it
 * arrives leaves stray asterisks and a code block that swallows the rest of
 * the reply, so the unterminated parts are closed for the duration of the
 * render and reopened by the next token.
 */
function closeOpenMarkers(text: string) {
  let closed = text

  const fences = (closed.match(/^```/gm) ?? []).length
  if (fences % 2 === 1) closed += "\n```"

  // Inline markers only matter on the last line, which is the one still growing.
  const lastBreak = closed.lastIndexOf("\n")
  const head = lastBreak === -1 ? "" : closed.slice(0, lastBreak + 1)
  let tail = lastBreak === -1 ? closed : closed.slice(lastBreak + 1)

  if (!tail.startsWith("```")) {
    for (const marker of ["**", "`", "_"]) {
      const parts = tail.split(marker).length - 1
      if (parts % 2 === 1) tail += marker
    }
  }

  return head + tail
}

export function Response({
  children,
  streaming = false,
  renderCode,
  className,
  ...rootProps
}: ResponseProps) {
  const text = React.useMemo(
    () => (streaming ? closeOpenMarkers(children) : children),
    [children, streaming]
  )

  return (
    <div
      data-slot="response"
      data-streaming={streaming ? "" : undefined}
      className={cn(
        "text-sm leading-relaxed [&_a]:underline [&_a]:underline-offset-4 [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&>*+*]:mt-3",
        className
      )}
      {...rootProps}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className: language, children: code, ...props }) {
            const name = /language-(\w+)/.exec(language ?? "")?.[1]
            const body = String(code).replace(/\n$/, "")

            // Inline code stays inline; only a fenced block becomes a panel.
            if (!name && !body.includes("\n")) {
              return (
                <code
                  className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em]"
                  {...props}
                >
                  {code}
                </code>
              )
            }

            if (renderCode) return <>{renderCode(body, name)}</>

            return (
              <span className="border-border bg-muted/40 my-3 block overflow-x-auto rounded-[calc(var(--radius))] border p-3">
                <code className="font-mono text-xs whitespace-pre">{body}</code>
              </span>
            )
          },
          pre({ children: inner }) {
            return <>{inner}</>
          },
        }}
      >
        {text}
      </Markdown>
    </div>
  )
}
