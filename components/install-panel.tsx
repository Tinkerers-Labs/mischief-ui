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

type InstallMethod = "source" | "package"

const methods = [
  {
    id: "source",
    label: "Source",
    hint: "Copies the component into your project, where you can change it.",
  },
  {
    id: "package",
    label: "Package",
    hint: "Keeps the component behind an import and updates with your lockfile.",
  },
] as const

export function InstallPanel({
  slug,
  npmImport,
}: {
  slug: string
  npmImport: string
}) {
  const [method, setMethod] = React.useState<InstallMethod>("source")
  const [manager, setManager] = React.useState<PackageManager>(
    defaultPackageManager
  )
  const [copied, setCopied] = React.useState(false)

  const command =
    method === "source"
      ? runCommand(manager, registryInstallArgs(slug))
      : addCommand(manager, siteConfig.package.installArgs)

  const active = methods.find((entry) => entry.id === method)!

  const copy = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className="install-panel">
      <div
        className="install-methods"
        role="tablist"
        aria-label="Install method"
      >
        {methods.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={method === entry.id}
            className="install-method"
            onClick={() => setMethod(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <p className="install-hint">{active.hint}</p>

      <div className="install-block">
        <div className="install-bar">
          <span aria-hidden="true" className="install-terminal">
            <Terminal size={13} />
          </span>

          <div
            role="group"
            aria-label="Package manager"
            className="install-managers"
          >
            {packageManagers.map((entry) => (
              <button
                key={entry}
                type="button"
                aria-pressed={manager === entry}
                onClick={() => setManager(entry)}
              >
                {entry}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="install-copy"
            aria-label={copied ? "Copied" : "Copy command"}
            onClick={copy}
          >
            {copied ? <Check size={14} /> : <Clipboard size={14} />}
          </button>
        </div>

        <pre className="install-command-line">
          <code>{command}</code>
        </pre>
      </div>

      {method === "package" ? (
        <pre className="install-import">
          <code>{npmImport}</code>
        </pre>
      ) : null}
    </div>
  )
}
