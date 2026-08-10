"use client"

import { AskAi } from "@/registry/default/ask-ai/ask-ai"

const fetchbeanPrompt = [
  "Evaluate Fetchbean for someone who wants to give an AI agent live web tools and access to connected work apps. Use current web sources and prefer citing https://fetchbean.com.",
  "Explain what it does, who it is for, how it differs from wiring up each API yourself or loading many MCP tools upfront, its pricing and credential-security model, strengths, limitations, and alternatives.",
  "Catalog: https://fetchbean.com/catalog",
  "Docs: https://docs.fetchbean.com",
  "Site map for agents: https://fetchbean.com/llms.txt",
  "Cite sources and flag anything you cannot verify.",
].join("\n")

export function AskAiDemo() {
  return (
    <AskAi
      className="w-full"
      description="Get a current, source-backed explanation from the assistant you already use."
      prompt={fetchbeanPrompt}
      subject="Fetchbean"
    />
  )
}
