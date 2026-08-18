"use client"

import * as React from "react"
import { Check, ChevronDown, Copy, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export type AiDestination = {
  id: string
  name: string
  /** Builds the address opened for this destination. */
  href: (prompt: string) => string
  icon?: React.ReactNode
}

export type CopyForAiProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** The page as markdown. This is what the main button copies. */
  markdown: string
  /** Where the same markdown is served, for reading and for handing to an assistant. */
  markdownUrl?: string
  /** The instruction sent to a destination. Defaults to reading the markdown. */
  prompt?: string
  destinations?: readonly AiDestination[]
  copyLabel?: string
  copiedLabel?: string
  viewLabel?: string
  menuLabel?: string
}

export const defaultDestinations: readonly AiDestination[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    href: (prompt) =>
      `https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt)}`,
  },
  {
    id: "claude",
    name: "Claude",
    href: (prompt) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
  },
]

export function CopyForAi({
  markdown,
  markdownUrl,
  prompt,
  destinations = defaultDestinations,
  copyLabel = "Copy page",
  copiedLabel = "Copied",
  viewLabel = "View as Markdown",
  menuLabel = "More page actions",
  className,
  ...rootProps
}: CopyForAiProps) {
  const [copied, setCopied] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)

  const instruction =
    prompt ?? (markdownUrl ? `Read ${markdownUrl}.` : markdown)

  React.useEffect(() => {
    if (!open) return

    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("pointerdown", close)
    document.addEventListener("keydown", onEscape)

    return () => {
      document.removeEventListener("pointerdown", close)
      document.removeEventListener("keydown", onEscape)
    }
  }, [open])

  const copy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setOpen(false)
    window.setTimeout(() => setCopied(false), 1400)
  }

  const item =
    "hover:bg-muted flex items-center gap-2.5 rounded-[calc(var(--radius)-0.25rem)] px-2.5 py-2 text-sm whitespace-nowrap text-inherit no-underline transition-colors duration-150 motion-reduce:transition-none"

  return (
    <div
      ref={rootRef}
      data-slot="copy-for-ai"
      className={cn("relative inline-flex", className)}
      {...rootProps}
    >
      <button
        type="button"
        data-slot="copy-for-ai-copy"
        className="border-border bg-card hover:bg-muted focus-visible:ring-ring inline-flex min-h-8 items-center gap-2 rounded-l-[calc(var(--radius)-0.2rem)] border px-2.5 text-xs font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
        onClick={copy}
      >
        {copied ? (
          <Check aria-hidden="true" size={13} />
        ) : (
          <Copy aria-hidden="true" size={13} />
        )}
        {copied ? copiedLabel : copyLabel}
      </button>

      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={menuLabel}
        className="border-border bg-card hover:bg-muted focus-visible:ring-ring inline-flex min-h-8 w-7 items-center justify-center rounded-r-[calc(var(--radius)-0.2rem)] border border-l-0 transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
        onClick={() => setOpen((current) => !current)}
      >
        <ChevronDown aria-hidden="true" size={13} />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={menuLabel}
          className="border-border bg-card absolute top-full right-0 z-50 mt-1.5 grid min-w-56 gap-0.5 rounded-[var(--radius)] border p-1.5 shadow-lg"
        >
          {markdownUrl ? (
            <a
              className={item}
              href={markdownUrl}
              rel="noreferrer noopener"
              role="menuitem"
              target="_blank"
            >
              <FileText aria-hidden="true" size={15} />
              {viewLabel}
            </a>
          ) : null}

          {destinations.map((destination) => (
            <a
              key={destination.id}
              className={item}
              href={destination.href(instruction)}
              rel="noreferrer noopener nofollow"
              role="menuitem"
              target="_blank"
            >
              {destination.icon ?? <Copy aria-hidden="true" size={15} />}
              Open in {destination.name}
            </a>
          ))}
        </div>
      ) : null}

      <span aria-live="polite" className="sr-only">
        {copied ? "Page markdown copied." : ""}
      </span>
    </div>
  )
}
