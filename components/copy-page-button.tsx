"use client"

import { AskAiLogo } from "@/registry/default/ask-ai/ask-ai"
import { CopyForAi } from "@/registry/default/copy-for-ai/copy-for-ai"
import { siteConfig } from "@/site.config"

const destinations = [
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
].map((destination) => ({
  ...destination,
  icon: (
    <AskAiLogo
      className="size-[1.05rem]"
      id={destination.id}
      name={destination.name}
    />
  ),
}))

export function CopyPageButton({
  componentSlug,
  markdown,
  prompt,
}: {
  componentSlug: string
  markdown: string
  prompt: string
}) {
  const markdownUrl = new URL(
    siteConfig.markdown.path(componentSlug),
    siteConfig.url
  ).toString()

  return (
    <CopyForAi
      destinations={destinations}
      markdown={markdown}
      markdownUrl={markdownUrl}
      prompt={prompt}
    />
  )
}
