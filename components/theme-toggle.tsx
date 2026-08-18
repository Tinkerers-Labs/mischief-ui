"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"

type Theme = "light" | "dark"

const storageKey = "mischief-theme"
const themeChangeEvent = "mischief-theme-change"

function getTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

function getServerTheme(): Theme {
  return "light"
}

function subscribeToTheme(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === storageKey &&
      (event.newValue === "light" || event.newValue === "dark")
    ) {
      const root = document.documentElement

      root.classList.toggle("dark", event.newValue === "dark")
      root.style.colorScheme = event.newValue
      callback()
    }
  }

  window.addEventListener(themeChangeEvent, callback)
  window.addEventListener("storage", handleStorage)

  return () => {
    window.removeEventListener(themeChangeEvent, callback)
    window.removeEventListener("storage", handleStorage)
  }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement

  root.classList.toggle("dark", theme === "dark")
  root.style.colorScheme = theme
  try {
    window.localStorage.setItem(storageKey, theme)
  } catch {}
  window.dispatchEvent(new Event(themeChangeEvent))
}

export function ThemeToggle() {
  const theme = React.useSyncExternalStore(
    subscribeToTheme,
    getTheme,
    getServerTheme
  )
  const nextTheme = theme === "dark" ? "light" : "dark"
  const Icon = nextTheme === "dark" ? Moon : Sun

  return (
    <button
      className="hover:text-primary inline-flex h-11 w-9 cursor-pointer items-center justify-center border-0 bg-transparent text-inherit transition-colors duration-150"
      type="button"
      onClick={() => applyTheme(nextTheme)}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      <Icon aria-hidden="true" size={19} strokeWidth={1.9} />
    </button>
  )
}
