"use client"

import { DemoVariants } from "@/components/demos/demo-variants"
import { ThemeToggle } from "@/registry/default/theme-toggle/theme-toggle"

export function ThemeToggleDemo() {
  return (
    <DemoVariants
      label="Modes"
      variants={[
        {
          id: "two",
          label: "Light and dark",
          render: () => <ThemeToggle storageKey="mischief-theme" />,
        },
        {
          id: "three",
          label: "With system",
          render: () => (
            <ThemeToggle
              storageKey="mischief-theme"
              modes={["light", "dark", "system"]}
            />
          ),
        },
      ]}
    />
  )
}
