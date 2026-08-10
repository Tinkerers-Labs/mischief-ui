"use client"

import * as React from "react"
import { Braces, Package } from "lucide-react"

import { CopyCommand } from "@/components/copy-command"
import { siteConfig } from "@/site.config"

type InstallMethod = "shadcn" | "npm"

const methods = [
  { id: "shadcn", label: "shadcn", icon: Braces },
  { id: "npm", label: "npm", icon: Package },
] as const

export function InstallPanel({
  shadcnCommand,
  npmImport,
}: {
  shadcnCommand: string
  npmImport: string
}) {
  const [method, setMethod] = React.useState<InstallMethod>("shadcn")

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
        {method === "shadcn" && (
          <>
            <p>Copy the source into your project and make it yours.</p>
            <CopyCommand label="Run" command={shadcnCommand} />
          </>
        )}

        {method === "npm" && (
          <>
            <p>Keep the components behind a package import.</p>
            <CopyCommand
              label="Run"
              command={siteConfig.package.installCommand}
            />
            <pre className="install-import">
              <code>{npmImport}</code>
            </pre>
          </>
        )}
      </div>
    </div>
  )
}
