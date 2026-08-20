"use client"

import { Moon, Sun } from "lucide-react"

import { ThemeToggle as Toggle } from "@/registry/default/theme-toggle/theme-toggle"

/*
 * The published toggle, wired to this site's storage key so the no-flash
 * script in the root layout and the control agree on where the choice lives.
 * The icon shows the mode you are about to move to, not the one you are in.
 */
export function ThemeToggle() {
  return (
    <Toggle
      className="hover:text-primary h-11 w-9 rounded-none text-inherit hover:bg-transparent"
      storageKey="mischief-theme"
      icons={{
        light: <Moon aria-hidden="true" size={19} strokeWidth={1.9} />,
        dark: <Sun aria-hidden="true" size={19} strokeWidth={1.9} />,
      }}
    />
  )
}
