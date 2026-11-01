"use client"

import * as React from "react"

import {
  InlineEdit,
  type InlineEditRequest,
} from "@/registry/default/inline-edit/inline-edit"

const initial =
  "We just wanted to let you know that exports were actually failing for some workspaces between 09:00 and 11:30 UTC on Tuesday. It was really caused by a timeout in the step that zips large files. We have raised the limit and run every failed export again, so you do not need to do anything. If a download still looks incomplete, reply to this email and we will look at it."

const prepared: Record<string, string> = {
  "We just wanted to let you know that exports were actually failing for some workspaces between 09:00 and 11:30 UTC on Tuesday.":
    "Between 09:00 and 11:30 UTC on Tuesday, exports failed for some workspaces.",
  "It was really caused by a timeout in the step that zips large files.":
    "A timeout in the step that zips large files caused it.",
}

const filler = /\b(just|actually|really|very|simply)\s+/gi

function rewrite({ selection, instruction }: InlineEditRequest) {
  const text = selection.text.trim()
  const tightened = prepared[text] ?? text.replace(filler, "")

  if (/upper|caps|shout/i.test(instruction)) return tightened.toUpperCase()
  return tightened
}

async function* streamRewrite(request: InlineEditRequest) {
  const words = rewrite(request).split(/(?<=\s)/)

  for (const word of words) {
    await new Promise((resolve) => setTimeout(resolve, 45))
    if (request.signal.aborted) return
    yield word
  }
}

export function InlineEditDemo() {
  const [text, setText] = React.useState(initial)

  return (
    <div className="bg-background border-border grid w-full max-w-[36rem] gap-3 rounded-[1.25rem] border p-5 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold">Incident note</h3>
        <button
          type="button"
          onClick={() => setText(initial)}
          disabled={text === initial}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-md px-1.5 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40 motion-reduce:transition-none"
        >
          Reset
        </button>
      </div>

      <InlineEdit
        label="Incident note"
        onChange={setText}
        onRequestEdit={streamRewrite}
        value={text}
      />

      <p className="text-muted-foreground text-xs leading-relaxed">
        Select a sentence and ask for it to be tighter. The rewrites in this
        example are prepared in the page; in an app, onRequestEdit streams them
        from your model.
      </p>
    </div>
  )
}
