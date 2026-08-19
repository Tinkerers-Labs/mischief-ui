"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type KbdProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  /** A chord such as "Mod+K", or the keys already split apart. */
  keys: string | readonly string[]
  /** Overrides platform detection. */
  platform?: "auto" | "mac" | "other"
  separator?: React.ReactNode
}

const macNames: Record<string, string> = {
  mod: "⌘",
  meta: "⌘",
  cmd: "⌘",
  command: "⌘",
  alt: "⌥",
  option: "⌥",
  shift: "⇧",
  ctrl: "⌃",
  control: "⌃",
  enter: "↵",
  backspace: "⌫",
  escape: "Esc",
  esc: "Esc",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
}

const otherNames: Record<string, string> = {
  mod: "Ctrl",
  meta: "Win",
  cmd: "Ctrl",
  command: "Ctrl",
  alt: "Alt",
  option: "Alt",
  shift: "Shift",
  ctrl: "Ctrl",
  control: "Ctrl",
  enter: "Enter",
  backspace: "Backspace",
  escape: "Esc",
  esc: "Esc",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
}

/** Spoken form, so a screen reader says "Command" rather than the glyph. */
const spoken: Record<string, string> = {
  "⌘": "Command",
  "⌥": "Option",
  "⇧": "Shift",
  "⌃": "Control",
  "↵": "Enter",
  "⌫": "Backspace",
  "↑": "Up arrow",
  "↓": "Down arrow",
  "←": "Left arrow",
  "→": "Right arrow",
}

const noop = () => () => {}

function isMacClient() {
  return /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent)
}

export function Kbd({
  keys,
  platform = "auto",
  separator,
  className,
  ...rootProps
}: KbdProps) {
  // The server cannot know the platform, so it renders the portable names and
  // the client swaps in the Mac glyphs once it knows better.
  const detected = React.useSyncExternalStore(noop, isMacClient, () => false)

  const mac = platform === "auto" ? detected : platform === "mac"
  const names = mac ? macNames : otherNames

  const parts = (
    typeof keys === "string" ? keys.split("+").map((key) => key.trim()) : keys
  ).filter(Boolean)

  const rendered = parts.map(
    (key) =>
      names[key.toLowerCase()] ?? (key.length === 1 ? key.toUpperCase() : key)
  )

  return (
    <span
      data-slot="kbd"
      className={cn("inline-flex items-center gap-0.5 align-middle", className)}
      {...rootProps}
    >
      <span className="sr-only">
        {rendered.map((key) => spoken[key] ?? key).join(" plus ")}
      </span>

      {rendered.map((key, index) => (
        <React.Fragment key={`${key}-${index}`}>
          {index > 0 && separator ? (
            <span
              aria-hidden="true"
              className="text-muted-foreground text-[0.6875rem]"
            >
              {separator}
            </span>
          ) : null}
          <kbd
            aria-hidden="true"
            className="border-border bg-muted text-muted-foreground inline-flex min-w-[1.5rem] items-center justify-center rounded border px-1.5 py-0.5 font-[family-name:var(--font-mono),monospace] text-[0.6875rem] leading-none"
          >
            {key}
          </kbd>
        </React.Fragment>
      ))}
    </span>
  )
}
