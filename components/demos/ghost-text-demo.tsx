"use client"

import * as React from "react"

import { GhostText } from "@/registry/default/ghost-text/ghost-text"

const subjects = [
  "Refund for the duplicate charge on your March invoice",
  "Your export is ready to download",
  "Resetting two-factor authentication on your account",
]

const sentences = [
  "Thanks for writing in about the duplicate charge.",
  "I have refunded the second payment to the card you used.",
  "It can take five to ten business days to appear on your statement.",
  "Your plan and your saved projects are not affected.",
  "Reply here if anything still looks wrong and I will take another look.",
]

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}

function completeFrom(options: string[], fragment: string) {
  if (fragment.trim().length < 2) return ""

  const lower = fragment.toLowerCase()
  const match = options.find(
    (option) =>
      option.toLowerCase().startsWith(lower) && option.length > fragment.length
  )

  return match ? match.slice(fragment.length) : ""
}

async function suggestSubject(text: string, signal: AbortSignal) {
  await wait(180, signal)
  return completeFrom(subjects, text)
}

async function suggestReply(text: string, signal: AbortSignal) {
  await wait(240, signal)

  const fragment = text.slice(
    Math.max(text.lastIndexOf(". "), text.lastIndexOf("\n")) + 1
  )
  const trimmed = fragment.trimStart()

  // After a finished sentence, offer the next one nobody has written yet.
  if (trimmed === "" && /[.!?]\s*$/.test(text)) {
    const next = sentences.find((sentence) => !text.includes(sentence))
    if (!next) return ""
    return text.endsWith(" ") || text.endsWith("\n") ? next : ` ${next}`
  }

  return completeFrom(sentences, trimmed)
}

export function GhostTextDemo() {
  const [subject, setSubject] = React.useState("")
  const [reply, setReply] = React.useState("Hi Priya,\n\n")

  return (
    <div className="bg-background border-border grid w-full max-w-[34rem] gap-4 rounded-[1.25rem] border p-5 shadow-sm">
      <div className="grid gap-1.5">
        <label className="text-sm font-medium" htmlFor="ghost-text-subject">
          Subject
        </label>
        <GhostText
          id="ghost-text-subject"
          getSuggestion={suggestSubject}
          onValueChange={setSubject}
          placeholder="Try typing Refund"
          value={subject}
        />
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm font-medium" htmlFor="ghost-text-reply">
          Reply
        </label>
        <GhostText
          id="ghost-text-reply"
          getSuggestion={suggestReply}
          multiline
          onValueChange={setReply}
          rows={6}
          value={reply}
        />
      </div>

      <p className="text-muted-foreground text-xs leading-relaxed">
        Start with Thanks. Tab takes the whole suggestion, Ctrl or Cmd with the
        right arrow takes one word, and Escape puts it away. Typing the
        suggested letters keeps it in place.
      </p>
    </div>
  )
}
