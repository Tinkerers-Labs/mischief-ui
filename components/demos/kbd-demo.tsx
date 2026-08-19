"use client"

import { Kbd } from "@/registry/default/kbd/kbd"

export function KbdDemo() {
  return (
    <div className="text-muted-foreground grid gap-3 text-sm">
      <p>
        Open the palette with <Kbd keys="Mod+K" />
      </p>
      <p>
        Send without a newline using <Kbd keys="Mod+Enter" />
      </p>
      <p>
        Step through results with <Kbd keys={["Up"]} /> and{" "}
        <Kbd keys={["Down"]} />
      </p>
      <p>
        Dismiss anything with <Kbd keys="Escape" />
      </p>
    </div>
  )
}
