"use client"

import { defaultPackageManager } from "@/lib/package-commands"
import { InstallCommand } from "@/registry/default/install-command/install-command"
import { registryInstallArgs, siteConfig } from "@/site.config"

export function InstallPanel({
  slug,
  npmImport,
  agentPrompt,
}: {
  slug: string
  npmImport: string
  agentPrompt: string
}) {
  return (
    <div className="mt-4 grid gap-3">
      <InstallCommand
        add={siteConfig.package.installArgs}
        defaultManager={defaultPackageManager}
        prompt={agentPrompt}
        run={registryInstallArgs(slug)}
      />

      <pre className="install-import">
        <code>{npmImport}</code>
      </pre>
    </div>
  )
}
