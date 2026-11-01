"use client"

import * as React from "react"
import { Bell, Globe, HardDrive, Info } from "lucide-react"

import {
  StackPanel,
  StackPanelItem,
} from "@/registry/default/stack-panel/stack-panel"

const languages = ["English", "Español", "Français", "Deutsch", "Português"]

const alerts = [
  { id: "comments", label: "Comments on my files" },
  { id: "mentions", label: "Mentions" },
  { id: "summary", label: "Weekly summary" },
] as const

const checkbox =
  "border-border flex min-h-11 items-center gap-3 border-b px-4 text-sm"

export function StackPanelDemo() {
  const [language, setLanguage] = React.useState("English")
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>({
    comments: true,
    mentions: true,
    summary: false,
  })
  const [quiet, setQuiet] = React.useState({ from: "22:00", to: "07:00" })
  const [cache, setCache] = React.useState("86 MB")

  const count = Object.values(enabled).filter(Boolean).length

  return (
    <StackPanel title="Settings" className="h-[26rem] w-full max-w-sm">
      <StackPanelItem
        icon={<Bell />}
        label="Notifications"
        detail={count === 0 ? "Off" : `${count} on`}
      >
        <p className="text-muted-foreground px-4 pt-4 pb-2 text-xs font-medium">
          Email me about
        </p>
        {alerts.map((alert) => (
          <label key={alert.id} className={checkbox}>
            <input
              type="checkbox"
              className="accent-primary size-4"
              checked={enabled[alert.id] ?? false}
              onChange={(event) =>
                setEnabled((current) => ({
                  ...current,
                  [alert.id]: event.target.checked,
                }))
              }
            />
            {alert.label}
          </label>
        ))}
        <StackPanelItem
          label="Quiet hours"
          detail={`${quiet.from} to ${quiet.to}`}
        >
          <p className="text-muted-foreground px-4 pt-4 text-sm">
            Nothing is sent between these times. It arrives together afterwards.
          </p>
          <div className="grid grid-cols-2 gap-3 p-4">
            {(["from", "to"] as const).map((edge) => (
              <label key={edge} className="grid gap-1.5 text-sm font-medium">
                {edge === "from" ? "From" : "Until"}
                <input
                  type="time"
                  className="border-border bg-background focus-visible:ring-ring min-h-9 rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
                  value={quiet[edge]}
                  onChange={(event) =>
                    setQuiet((current) => ({
                      ...current,
                      [edge]: event.target.value,
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </StackPanelItem>
      </StackPanelItem>

      <StackPanelItem icon={<Globe />} label="Language" detail={language}>
        <fieldset>
          <legend className="sr-only">Language</legend>
          {languages.map((name) => (
            <label key={name} className={checkbox}>
              <input
                type="radio"
                name="stack-panel-demo-language"
                className="accent-primary size-4"
                checked={language === name}
                onChange={() => setLanguage(name)}
              />
              {name}
            </label>
          ))}
        </fieldset>
      </StackPanelItem>

      <StackPanelItem icon={<HardDrive />} label="Storage" detail={cache}>
        <StackPanelItem label="Offline files" detail="340 MB" />
        <StackPanelItem label="Cache" detail={cache} />
        <StackPanelItem
          label="Clear cache"
          className="text-primary"
          disabled={cache === "0 MB"}
          onSelect={() => setCache("0 MB")}
        />
      </StackPanelItem>

      <StackPanelItem icon={<Info />} label="About">
        <StackPanelItem label="Version" detail="4.2.0" />
        <StackPanelItem label="Last checked for updates" detail="Today" />
      </StackPanelItem>
    </StackPanel>
  )
}
