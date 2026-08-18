"use client"

import * as React from "react"
import { Check, ChevronDown, Copy, FileText, Sparkles } from "lucide-react"

import { AskAiLogo } from "@/registry/default/ask-ai/ask-ai"
import { siteConfig } from "@/site.config"

const assistants = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    href: (prompt: string) =>
      `https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt)}`,
  },
  {
    id: "claude",
    name: "Claude",
    href: (prompt: string) =>
      `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
  },
] as const

export function CopyPageButton({
  componentName,
  componentSlug,
  markdown,
}: {
  componentName: string
  componentSlug: string
  markdown: string
}) {
  const [copied, setCopied] = React.useState<"page" | null>(null)
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const resetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const markdownUrl = new URL(
    siteConfig.markdown.path(componentSlug),
    siteConfig.url
  ).toString()
  // Assistants are pointed at the markdown rather than the page, so they read
  // the API and the accessibility notes instead of the site chrome.
  const prompt = [
    `Read ${markdownUrl} and ${siteConfig.skill.url}.`,
    `Show me how to install and use Mischief's ${componentName} in a shadcn project.`,
    "Use the component source and include its required dependencies.",
  ].join(" ")

  React.useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener("pointerdown", closeMenu)
    return () => document.removeEventListener("pointerdown", closeMenu)
  }, [])

  React.useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current)
    },
    []
  )

  async function copy(value: string) {
    await navigator.clipboard.writeText(value)
    setCopied("page")
    setOpen(false)
    if (resetTimer.current) clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => setCopied(null), 1400)
  }

  return (
    <div className="copy-page-menu" ref={menuRef}>
      <div className="copy-page-trigger">
        <button
          className="component-page-action"
          onClick={() => copy(markdown)}
          type="button"
        >
          {copied === "page" ? (
            <Check aria-hidden="true" size={13} />
          ) : (
            <Copy aria-hidden="true" size={13} />
          )}
          {copied === "page" ? "Copied" : "Copy page"}
        </button>
        <button
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="More page actions"
          className="copy-page-toggle"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <ChevronDown aria-hidden="true" size={13} />
        </button>
      </div>

      {open && (
        <div
          aria-label="Page actions"
          className="copy-page-popover"
          role="group"
        >
          <a href={markdownUrl} rel="noopener noreferrer" target="_blank">
            <FileText aria-hidden="true" size={18} />
            View as Markdown
          </a>
          <a
            href={`https://v0.dev/chat/api/open?url=${encodeURIComponent(markdownUrl)}`}
            rel="noopener noreferrer nofollow"
            target="_blank"
          >
            <Sparkles aria-hidden="true" size={18} />
            Open in v0
          </a>
          {assistants.map((assistant) => (
            <a
              href={assistant.href(prompt)}
              key={assistant.id}
              rel="noopener noreferrer nofollow"
              target="_blank"
            >
              <AskAiLogo
                className="size-[1.125rem]"
                id={assistant.id}
                name={assistant.name}
              />
              Open in {assistant.name}
            </a>
          ))}
        </div>
      )}

      <span aria-live="polite" className="sr-only">
        {copied === "page" ? "Page markdown copied." : ""}
      </span>
    </div>
  )
}
