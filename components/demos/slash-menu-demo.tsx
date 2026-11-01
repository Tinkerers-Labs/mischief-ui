"use client"

import * as React from "react"

import {
  parseSlashCommand,
  SlashMenu,
  type SlashCommand,
} from "@/registry/default/slash-menu/slash-menu"

const commands: SlashCommand[] = [
  {
    name: "translate",
    description: "Translate text into another language",
    args: ["language", "text"],
  },
  {
    name: "summarize",
    description: "Summarize the conversation so far",
    args: ["length"],
  },
  {
    name: "rename",
    description: "Rename a symbol across the project",
    args: ["from", "to"],
  },
  {
    name: "model",
    description: "Switch the model for this chat",
    args: ["name"],
  },
  { name: "clear", description: "Start a new conversation" },
]

export function SlashMenuDemo() {
  const [text, setText] = React.useState("")
  const [result, setResult] = React.useState<string | null>(null)

  const submit = () => {
    const parsed = parseSlashCommand(text, commands)
    if (!text.trim()) return

    if (parsed) {
      const names = parsed.command.args ?? []
      const filled = names.map(
        (name, index) => `${name}: ${parsed.args[index] ?? "(missing)"}`
      )
      setResult(
        `Ran /${parsed.command.name}${filled.length ? ` with ${filled.join(", ")}` : ""}`
      )
    } else {
      setResult(`Sent: ${text.trim()}`)
    }
    setText("")
  }

  return (
    <div className="grid min-h-[19rem] w-full max-w-xl content-start gap-3">
      <SlashMenu
        commands={commands}
        placeholder="Type / for commands"
        rows={2}
        value={text}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || event.shiftKey) return
          if (event.nativeEvent.isComposing) return
          event.preventDefault()
          submit()
        }}
        onValueChange={setText}
      />

      <p className="text-muted-foreground text-xs" role="status">
        {result ?? "Try /translate Spanish Where is the station?"}
      </p>

      <dl className="border-border grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 border-t pt-3 text-xs">
        {commands.map((command) => (
          <React.Fragment key={command.name}>
            <dt className="font-[family-name:var(--font-mono),monospace]">
              /{command.name}
            </dt>
            <dd className="text-muted-foreground">{command.description}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  )
}
