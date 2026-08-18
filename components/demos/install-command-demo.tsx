"use client"

import { InstallCommand } from "@/registry/default/install-command/install-command"

export function InstallCommandDemo() {
  return (
    <InstallCommand
      className="w-full max-w-lg"
      add="mischief-ui"
      note="Running a package and adding one are different verbs, so they come from different tables."
      prompt="Read https://ui.tinkererslabs.com/md/hold-button.md, then add it to this project."
      run="shadcn@latest add Tinkerers-Labs/mischief-ui/hold-button"
    />
  )
}
