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

export function InstallPanel({
  slug,
  npmImport,
}: {
  slug: string
  npmImport: string
}) {
  const [manager, setManager] = React.useState<PackageManager>(
    defaultPackageManager
  )
  const [asPackage, setAsPackage] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  // The chosen package manager applies either way, so picking pnpm and then
  // package gives pnpm add rather than snapping back to npm.
  const command = asPackage
    ? addCommand(manager, siteConfig.package.installArgs)
    : runCommand(manager, registryInstallArgs(slug))

  const copy = async () => {
    await navigator.clipboard.writeText(command)
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
                aria-pressed={!asPackage && manager === entry}
                onClick={() => {
                  setManager(entry)
                  setAsPackage(false)
                }}
              >
                {entry}
              </button>
            ))}

            <span aria-hidden="true" className="install-divider" />

            <button
              type="button"
              aria-pressed={asPackage}
              onClick={() => setAsPackage(true)}
            >
              package
            </button>
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

      {asPackage ? (
        <pre className="install-import">
          <code>{npmImport}</code>
        </pre>
      ) : null}
    </div>
  )
}
