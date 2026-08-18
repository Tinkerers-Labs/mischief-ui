"use client"

import * as React from "react"
import { Check, Clipboard, Terminal } from "lucide-react"

import {
  addCommand,
  defaultPackageManager,
  packageManagers,
  runCommand,
  type PackageManager,
} from "@/lib/package-commands"
import { registryInstallArgs, siteConfig } from "@/site.config"

type Mode = "source" | "package" | "agent"

export function InstallPanel({
  slug,
  npmImport,
  agentPrompt,
}: {
  slug: string
  npmImport: string
  agentPrompt: string
}) {
  const [manager, setManager] = React.useState<PackageManager>(
    defaultPackageManager
  )
  const [mode, setMode] = React.useState<Mode>("source")
  const [copied, setCopied] = React.useState(false)

  // The chosen package manager applies to both commands, so picking pnpm and
  // then package gives pnpm add rather than snapping back to npm.
  const value =
    mode === "agent"
      ? agentPrompt
      : mode === "package"
        ? addCommand(manager, siteConfig.package.installArgs)
        : runCommand(manager, registryInstallArgs(slug))

  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className="install-panel">
      <div className="install-block">
        <div className="install-bar">
          <span aria-hidden="true" className="install-terminal">
            <Terminal size={13} />
          </span>

          <div
            role="group"
            aria-label="Install command"
            className="install-managers"
          >
            {packageManagers.map((entry) => (
              <button
                key={entry}
                type="button"
                aria-pressed={mode === "source" && manager === entry}
                onClick={() => {
                  setManager(entry)
                  setMode("source")
                }}
              >
                {entry}
              </button>
            ))}

            <span aria-hidden="true" className="install-divider" />

            <button
              type="button"
              aria-pressed={mode === "package"}
              onClick={() => setMode("package")}
            >
              package
            </button>

            <button
              type="button"
              aria-pressed={mode === "agent"}
              onClick={() => setMode("agent")}
            >
              agent
            </button>
          </div>

          <button
            type="button"
            className="install-copy"
            aria-label={copied ? "Copied" : "Copy"}
            onClick={copy}
          >
            {copied ? <Check size={14} /> : <Clipboard size={14} />}
          </button>
        </div>

        <pre
          className="install-command-line"
          data-wrap={mode === "agent" || undefined}
        >
          <code>{value}</code>
        </pre>
      </div>

      {mode === "package" ? (
        <pre className="install-import">
          <code>{npmImport}</code>
        </pre>
      ) : null}

      {mode === "agent" ? (
        <p className="install-note">
          Paste this into a coding agent. It reads the component page and{" "}
          <a href={siteConfig.skill.url}>skill.md</a> before installing.
        </p>
      ) : null}
    </div>
  )
}
