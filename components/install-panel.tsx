"use client"

import * as React from "react"
import { Braces, Package } from "lucide-react"

import { CopyCommand } from "@/components/copy-command"
import { siteConfig } from "@/site.config"

type InstallMethod = "source" | "npm"
type PackageManager = "pnpm" | "npm" | "yarn" | "bun"

const methods = [
  { id: "source", label: "Source", icon: Braces },
  { id: "npm", label: "npm package", icon: Package },
] as const

const packageManagers = ["pnpm", "npm", "yarn", "bun"] as const

function sourceCommands(command: string): Record<PackageManager, string> {
  const args = command.replace(/^pnpm dlx /, "")

  return {
    pnpm: command,
    npm: `npx ${args}`,
    yarn: `yarn dlx ${args}`,
    bun: `bunx --bun ${args}`,
  }
}

function packageCommands(command: string): Record<PackageManager, string> {
  const packages = command.replace(/^pnpm add /, "")

  return {
    pnpm: command,
    npm: `npm install ${packages}`,
    yarn: `yarn add ${packages}`,
    bun: `bun add ${packages}`,
  }
}

export function InstallPanel({
  shadcnCommand,
  npmImport,
}: {
  shadcnCommand: string
  npmImport: string
}) {
  const [method, setMethod] = React.useState<InstallMethod>("source")
  const [manager, setManager] = React.useState<PackageManager>("pnpm")
  const commands =
    method === "source"
      ? sourceCommands(shadcnCommand)
      : packageCommands(siteConfig.package.installCommand)

  return (
    <div className="install-panel">
      <div className="install-tabs" role="group" aria-label="Install method">
        {methods.map(({ id, label, icon: Icon }) => (
          <button
            aria-pressed={method === id}
            className="install-tab"
            key={id}
            onClick={() => setMethod(id)}
            type="button"
          >
            <Icon aria-hidden="true" size={15} strokeWidth={1.8} />
            {label}
          </button>
        ))}
      </div>

      <div className="install-content">
        <p>
          {method === "source"
            ? "Copy the component into your project and make it yours."
            : "Keep the component behind a package import."}
        </p>

        <div
          aria-label="Package manager"
          className="package-manager-tabs"
          role="group"
        >
          {packageManagers.map((packageManager) => (
            <button
              aria-pressed={manager === packageManager}
              key={packageManager}
              onClick={() => setManager(packageManager)}
              type="button"
            >
              {packageManager}
            </button>
          ))}
        </div>

        <CopyCommand command={commands[manager]} />

        {method === "npm" && (
          <pre className="install-import">
            <code>{npmImport}</code>
          </pre>
        )}
      </div>
    </div>
  )
}
