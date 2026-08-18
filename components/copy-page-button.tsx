"use client"

import * as React from "react"
import { Bot, Check, ChevronDown, Copy, FileText } from "lucide-react"

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
}: {
  componentName: string
  componentSlug: string
}) {
  const [copied, setCopied] = React.useState<"page" | "prompt" | null>(null)
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const resetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const pageUrl = new URL(
    `/docs/components/${componentSlug}`,
    siteConfig.url
  ).toString()
  const prompt = [
    `Read ${pageUrl} and ${siteConfig.skill.url}.`,
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

  async function copy(value: string, type: "page" | "prompt") {
    await navigator.clipboard.writeText(value)
    setCopied(type)
    setOpen(false)
    if (resetTimer.current) clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => setCopied(null), 1400)
  }

  return (
    <div className="copy-page-menu" ref={menuRef}>
      <div className="copy-page-trigger">
        <button
          className="component-page-action"
          onClick={() => copy(pageUrl, "page")}
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
          <button onClick={() => copy(prompt, "prompt")}>
            {copied === "prompt" ? (
              <Check aria-hidden="true" size={18} />
            ) : (
              <Bot aria-hidden="true" size={18} />
            )}
            Copy prompt for your agent
          </button>
          <a
            href={siteConfig.skill.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            <FileText aria-hidden="true" size={18} />
            View skill.md
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
        {copied === "page"
          ? "Page URL copied."
          : copied === "prompt"
            ? "Agent prompt copied."
            : ""}
      </span>
    </div>
  )
}
