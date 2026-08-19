"use client"

import * as React from "react"
import { Check, Clipboard, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun"

export type InstallCommandProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Arguments for a one-off runner, such as "shadcn@latest add tabs". */
  run?: string
  /** Packages to add as a dependency, such as "my-lib". */
  add?: string
  /** An instruction to paste into a coding agent, offered beside the commands. */
  prompt?: string
  managers?: readonly PackageManager[]
  defaultManager?: PackageManager
  packageLabel?: string
  promptLabel?: string
  note?: React.ReactNode
}

const runners: Record<PackageManager, string> = {
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
}

const installers: Record<PackageManager, string> = {
  npm: "npm install",
  pnpm: "pnpm add",
  yarn: "yarn add",
  bun: "bun add",
}

const DEFAULT_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const

export function InstallCommand({
  run,
  add,
  prompt,
  managers = DEFAULT_MANAGERS,
  defaultManager = "npm",
  packageLabel = "package",
  promptLabel = "agent",
  note,
  className,
  ...rootProps
}: InstallCommandProps) {
  const [manager, setManager] = React.useState<PackageManager>(defaultManager)
  const [mode, setMode] = React.useState<"run" | "add" | "prompt">(
    run ? "run" : add ? "add" : "prompt"
  )
  const [copyState, setCopyState] = React.useState<"idle" | "copied" | "error">(
    "idle"
  )

  // The chosen manager applies to both commands, so picking pnpm and then the
  // package option gives pnpm add rather than snapping back to the default.
  const value =
    mode === "prompt" && prompt
      ? prompt
      : mode === "add" && add
        ? `${installers[manager]} ${add}`
        : `${runners[manager]} ${run ?? ""}`.trim()

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopyState("copied")
    } catch {
      // Denied permission, an insecure context, or a sandboxed frame.
      setCopyState("error")
    }
    window.setTimeout(() => setCopyState("idle"), 1400)
  }

  return (
    <div
      data-slot="install-command"
      className={cn("min-w-0", className)}
      {...rootProps}
    >
      <div className="border-border bg-muted/40 overflow-hidden rounded-[calc(var(--radius)+0.15rem)] border">
        <div
          data-slot="install-command-bar"
          className="border-border flex items-center gap-2 border-b px-2.5 py-1.5"
        >
          <span
            aria-hidden="true"
            className="border-border bg-card text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-md border"
          >
            <Terminal size={13} />
          </span>

          <div
            role="group"
            aria-label="Install command"
            className="flex min-w-0 flex-wrap items-center gap-0.5"
          >
            {run
              ? managers.map((entry) => (
                  <button
                    key={entry}
                    type="button"
                    aria-pressed={mode === "run" && manager === entry}
                    className="text-muted-foreground hover:text-foreground aria-pressed:border-border aria-pressed:bg-card aria-pressed:text-foreground min-h-8 rounded-md border border-transparent px-2 font-[family-name:var(--font-mono),monospace] text-xs transition-colors duration-150 motion-reduce:transition-none"
                    onClick={() => {
                      setManager(entry)
                      setMode("run")
                    }}
                  >
                    {entry}
                  </button>
                ))
              : null}

            {add ? (
              <>
                {run ? (
                  <span
                    aria-hidden="true"
                    className="bg-border mx-1 h-4 w-px self-center"
                  />
                ) : null}
                <button
                  type="button"
                  aria-pressed={mode === "add"}
                  className="text-muted-foreground hover:text-foreground aria-pressed:border-border aria-pressed:bg-card aria-pressed:text-foreground min-h-8 rounded-md border border-transparent px-2 font-[family-name:var(--font-mono),monospace] text-xs transition-colors duration-150 motion-reduce:transition-none"
                  onClick={() => setMode("add")}
                >
                  {packageLabel}
                </button>
              </>
            ) : null}

            {prompt ? (
              <button
                type="button"
                aria-pressed={mode === "prompt"}
                className="text-muted-foreground hover:text-foreground aria-pressed:border-border aria-pressed:bg-card aria-pressed:text-foreground min-h-8 rounded-md border border-transparent px-2 font-[family-name:var(--font-mono),monospace] text-xs transition-colors duration-150 motion-reduce:transition-none"
                onClick={() => setMode("prompt")}
              >
                {promptLabel}
              </button>
            ) : null}
          </div>

          <button
            type="button"
            data-slot="install-command-copy"
            aria-label={
              copyState === "copied"
                ? "Copied"
                : copyState === "error"
                  ? "Copy failed"
                  : "Copy"
            }
            className="text-muted-foreground hover:bg-card hover:text-foreground ml-auto inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors duration-150 motion-reduce:transition-none"
            onClick={copy}
          >
            {copyState === "copied" ? (
              <Check size={14} />
            ) : (
              <Clipboard size={14} />
            )}
          </button>
        </div>

        <pre
          data-slot="install-command-value"
          data-mode={mode}
          className={cn(
            "text-foreground m-0 overflow-x-auto rounded-none bg-transparent px-3 py-2.5 font-[family-name:var(--font-mono),monospace] text-xs leading-relaxed",
            mode === "prompt" ? "whitespace-pre-wrap" : "whitespace-pre"
          )}
        >
          <code>{value}</code>
        </pre>
      </div>

      {note ? (
        <p className="text-muted-foreground mt-2 text-xs">{note}</p>
      ) : null}
    </div>
  )
}
