"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"

export type ThemeMode = "light" | "dark" | "system"

export type ThemeToggleProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange" | "children"
> & {
  /** Modes to cycle through. Defaults to light and dark. */
  modes?: readonly ThemeMode[]
  storageKey?: string
  /** Class placed on the root element for the dark mode. */
  darkClass?: string
  onThemeChange?: (mode: ThemeMode) => void
  icons?: Partial<Record<ThemeMode, React.ReactNode>>
  labels?: Partial<Record<ThemeMode, string>>
}

const DEFAULT_MODES = ["light", "dark"] as const

const CHANGE_EVENT = "mischief-theme-change"

const defaultLabels: Record<ThemeMode, string> = {
  light: "light mode",
  dark: "dark mode",
  system: "system theme",
}

function prefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

/**
 * Applies a mode and remembers it. "system" clears the stored choice so the
 * page follows the operating system again, including later changes to it.
 */
export function applyTheme(
  mode: ThemeMode,
  { storageKey = "theme", darkClass = "dark" } = {}
) {
  const root = document.documentElement
  const dark = mode === "system" ? prefersDark() : mode === "dark"

  root.classList.toggle(darkClass, dark)
  root.style.colorScheme = dark ? "dark" : "light"

  try {
    if (mode === "system") window.localStorage.removeItem(storageKey)
    else window.localStorage.setItem(storageKey, mode)
  } catch {
    // Private browsing refuses storage. The class is already applied, so the
    // choice holds for this page and is simply not remembered.
  }

  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function ThemeToggle({
  modes = DEFAULT_MODES,
  storageKey = "theme",
  darkClass = "dark",
  onThemeChange,
  icons,
  labels,
  className,
  onClick,
  ...buttonProps
}: ThemeToggleProps) {
  const subscribe = React.useCallback(
    (callback: () => void) => {
      const onStorage = (event: StorageEvent) => {
        if (event.key !== storageKey) return

        const stored = event.newValue
        applyTheme(
          stored === "light" || stored === "dark" ? stored : "system",
          { storageKey, darkClass }
        )
        callback()
      }

      const media = window.matchMedia("(prefers-color-scheme: dark)")

      window.addEventListener(CHANGE_EVENT, callback)
      window.addEventListener("storage", onStorage)
      media.addEventListener("change", callback)

      return () => {
        window.removeEventListener(CHANGE_EVENT, callback)
        window.removeEventListener("storage", onStorage)
        media.removeEventListener("change", callback)
      }
    },
    [storageKey, darkClass]
  )

  const read = React.useCallback((): ThemeMode => {
    let stored: string | null = null

    try {
      stored = window.localStorage.getItem(storageKey)
    } catch {
      stored = null
    }

    if (stored === "light" || stored === "dark") return stored

    return modes.includes("system")
      ? "system"
      : document.documentElement.classList.contains(darkClass)
        ? "dark"
        : "light"
  }, [storageKey, darkClass, modes])

  // The server cannot know the reader's choice, so it renders the first mode
  // and the client corrects it on hydration.
  const serverMode = React.useCallback(() => modes[0]!, [modes])

  const mode = React.useSyncExternalStore(subscribe, read, serverMode)
  const next = modes[(modes.indexOf(mode) + 1) % modes.length] ?? modes[0]!

  const label = `Switch to ${labels?.[next] ?? defaultLabels[next]}`
  const icon =
    icons?.[mode] ??
    (mode === "system" ? (
      <Monitor aria-hidden="true" size={18} strokeWidth={1.9} />
    ) : mode === "dark" ? (
      <Moon aria-hidden="true" size={18} strokeWidth={1.9} />
    ) : (
      <Sun aria-hidden="true" size={18} strokeWidth={1.9} />
    ))

  return (
    <button
      type="button"
      data-slot="theme-toggle"
      data-mode={mode}
      aria-label={label}
      title={label}
      className={cn(
        "text-muted-foreground hover:text-foreground hover:bg-muted inline-flex size-11 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent transition-colors duration-150 motion-reduce:transition-none",
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return

        applyTheme(next, { storageKey, darkClass })
        onThemeChange?.(next)
      }}
      {...buttonProps}
    >
      {icon}
    </button>
  )
}
