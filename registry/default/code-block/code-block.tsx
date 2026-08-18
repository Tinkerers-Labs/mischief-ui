"use client"

import * as React from "react"
import { Check, ChevronDown, Clipboard, WrapText } from "lucide-react"

import { cn } from "@/lib/utils"

export type CodeBlockProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  code: string
  /** Shown in the header, and used as the download-free label for the block. */
  filename?: string
  /** A short label such as "tsx". Shown when there is no filename. */
  language?: string
  showLineNumbers?: boolean
  /** One-based lines to mark as the interesting ones. */
  highlightLines?: readonly number[]
  /** Collapse anything past this many lines behind a toggle. */
  maxLines?: number
  wrap?: boolean
  /** Offers a control to turn wrapping on and off. */
  wrappable?: boolean
  copyable?: boolean
  actions?: React.ReactNode
}

export function CodeBlock({
  code,
  filename,
  language,
  showLineNumbers = false,
  highlightLines,
  maxLines,
  wrap = false,
  wrappable = false,
  copyable = true,
  actions,
  className,
  ...rootProps
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)
  const [expanded, setExpanded] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // The prop keeps deciding until the reader overrides it with the control,
  // so wrapping stays reactive without a second copy of the state.
  const [override, setOverride] = React.useState<boolean | null>(null)
  const wrapped = override ?? wrap

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const lines = React.useMemo(() => code.replace(/\n$/, "").split("\n"), [code])
  const marked = React.useMemo(
    () => new Set(highlightLines ?? []),
    [highlightLines]
  )

  const clipped = maxLines !== undefined && !expanded && lines.length > maxLines
  const shown = clipped ? lines.slice(0, maxLines) : lines
  const hidden = lines.length - shown.length

  const label = filename ?? language
  const gutter = String(lines.length).length

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div
      data-slot="code-block"
      className={cn(
        "border-border bg-muted/40 min-w-0 overflow-hidden rounded-[calc(var(--radius)+0.15rem)] border",
        className
      )}
      {...rootProps}
    >
      {label || copyable || wrappable || actions ? (
        <div
          data-slot="code-block-bar"
          className="border-border flex items-center gap-2 border-b px-3 py-1.5"
        >
          {label ? (
            <span className="text-muted-foreground truncate font-[family-name:var(--font-mono),monospace] text-xs">
              {label}
            </span>
          ) : null}

          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            {actions}

            {wrappable ? (
              <button
                type="button"
                aria-pressed={wrapped}
                aria-label="Wrap long lines"
                className="text-muted-foreground hover:bg-card hover:text-foreground aria-pressed:bg-card aria-pressed:text-foreground inline-flex size-8 items-center justify-center rounded-md transition-colors duration-150 motion-reduce:transition-none"
                onClick={() => setOverride(!wrapped)}
              >
                <WrapText aria-hidden="true" size={14} />
              </button>
            ) : null}

            {copyable ? (
              <button
                type="button"
                data-slot="code-block-copy"
                aria-label={copied ? "Copied" : "Copy code"}
                className="text-muted-foreground hover:bg-card hover:text-foreground inline-flex size-8 items-center justify-center rounded-md transition-colors duration-150 motion-reduce:transition-none"
                onClick={copy}
              >
                {copied ? (
                  <Check aria-hidden="true" size={14} />
                ) : (
                  <Clipboard aria-hidden="true" size={14} />
                )}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="relative">
        <pre
          data-slot="code-block-code"
          tabIndex={0}
          className={cn(
            "text-foreground m-0 overflow-x-auto rounded-none bg-transparent px-0 py-2.5 font-[family-name:var(--font-mono),monospace] text-xs leading-relaxed",
            wrapped && "overflow-x-visible"
          )}
        >
          <code className="block">
            {shown.map((line, index) => {
              const number = index + 1

              return (
                <span
                  key={number}
                  data-highlighted={marked.has(number) || undefined}
                  className={cn(
                    "flex px-3",
                    marked.has(number) &&
                      "bg-primary/10 border-primary border-l-2 pl-[calc(0.75rem-2px)]"
                  )}
                >
                  {showLineNumbers ? (
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground/60 mr-3 shrink-0 text-right tabular-nums select-none"
                      style={{ width: `${gutter}ch` }}
                    >
                      {number}
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "min-w-0",
                      wrapped
                        ? "break-words whitespace-pre-wrap"
                        : "whitespace-pre"
                    )}
                  >
                    {line === "" ? " " : line}
                  </span>
                </span>
              )
            })}
          </code>
        </pre>

        {clipped ? (
          <div
            aria-hidden="true"
            className="from-muted/40 pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t to-transparent"
          />
        ) : null}
      </div>

      {maxLines !== undefined && lines.length > maxLines ? (
        <button
          type="button"
          aria-expanded={expanded}
          className="border-border text-muted-foreground hover:text-foreground flex w-full items-center justify-center gap-1.5 border-t py-2 text-xs transition-colors duration-150 motion-reduce:transition-none"
          onClick={() => setExpanded((open) => !open)}
        >
          <ChevronDown
            aria-hidden="true"
            size={13}
            className={cn(
              "transition-transform duration-200 motion-reduce:transition-none",
              expanded && "rotate-180"
            )}
          />
          {expanded
            ? "Show less"
            : `Show ${hidden} more line${hidden === 1 ? "" : "s"}`}
        </button>
      ) : null}

      <span aria-live="polite" className="sr-only">
        {copied ? "Code copied to clipboard." : ""}
      </span>
    </div>
  )
}
