"use client"

import * as React from "react"

import {
  FeedbackWidget,
  type FeedbackWidgetValue,
} from "@/registry/default/feedback-widget/feedback-widget"

export function FeedbackWidgetDemo() {
  const [fail, setFail] = React.useState(false)
  const [last, setLast] = React.useState<FeedbackWidgetValue | null>(null)

  return (
    <div className="bg-background border-border relative flex min-h-[30rem] w-full max-w-[34rem] flex-col gap-4 overflow-hidden rounded-[1.25rem] border p-6 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold">Billing settings</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          The feedback button sits in the corner of the page. Open it, pick a
          face, and write a line.
        </p>
      </div>

      <label className="text-muted-foreground flex items-center gap-2.5 text-xs">
        <input
          checked={fail}
          className="accent-destructive size-3.5"
          onChange={(event) => setFail(event.target.checked)}
          type="checkbox"
        />
        Make the next send fail
      </label>

      {last ? (
        <p className="text-muted-foreground text-xs">
          Last sent: {last.sentiment ?? "no sentiment"}
          {last.message ? `, "${last.message}"` : ""}
        </p>
      ) : null}

      <FeedbackWidget
        className="absolute"
        onSubmit={async (value) => {
          await new Promise((resolve) => setTimeout(resolve, 900))
          if (fail) throw new Error("The feedback service did not answer.")
          setLast(value)
        }}
      />
    </div>
  )
}
