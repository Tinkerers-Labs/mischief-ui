"use client"

import * as React from "react"

import { SaveBar } from "@/registry/default/save-bar/save-bar"

const initial = { name: "Field notes", mentions: true }
const failure = "The settings service did not answer."

export function SaveBarDemo() {
  const [saved, setSaved] = React.useState(initial)
  const [draft, setDraft] = React.useState(initial)
  const [fail, setFail] = React.useState(false)

  const dirty = draft.name !== saved.name || draft.mentions !== saved.mentions

  return (
    <div className="bg-background border-border relative w-full max-w-[32rem] overflow-hidden rounded-[1.25rem] border px-6 pt-6 pb-24 shadow-sm">
      <h3 className="text-lg font-semibold">Project settings</h3>
      <p className="text-muted-foreground mt-1 text-sm">
        Change something to bring the bar up.
      </p>

      <div className="mt-6 grid gap-5">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="save-bar-demo-name">
            Project name
          </label>
          <input
            className="border-border bg-background focus-visible:ring-ring min-h-9 rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
            id="save-bar-demo-name"
            onChange={(event) =>
              setDraft((current) => ({ ...current, name: event.target.value }))
            }
            value={draft.name}
          />
        </div>

        <label className="flex items-center gap-2.5 text-sm">
          <input
            checked={draft.mentions}
            className="accent-primary size-4"
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                mentions: event.target.checked,
              }))
            }
            type="checkbox"
          />
          Email me when someone mentions this project
        </label>

        <label className="text-muted-foreground flex items-center gap-2.5 text-xs">
          <input
            checked={fail}
            className="accent-destructive size-3.5"
            onChange={(event) => setFail(event.target.checked)}
            type="checkbox"
          />
          Make the next save fail
        </label>
      </div>

      <SaveBar
        className="absolute inset-x-4 bottom-4 max-w-none"
        dirty={dirty}
        errorMessage={failure}
        onReset={() => setDraft(saved)}
        onSave={async () => {
          await new Promise((resolve) => setTimeout(resolve, 900))
          if (fail) throw new Error(failure)
          setSaved(draft)
        }}
        warnOnLeave={false}
      />
    </div>
  )
}
