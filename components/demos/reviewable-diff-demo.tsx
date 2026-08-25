"use client"

import * as React from "react"

import { ReviewableDiff } from "@/registry/default/reviewable-diff/reviewable-diff"

const before = `export function retry(run, attempts = 3) {
  let last

  for (let at = 0; at < attempts; at += 1) {
    try {
      return run()
    } catch (error) {
      last = error
    }
  }

  throw last
}

export function onReconnect(socket, run) {
  socket.addEventListener("open", run)
}`

const after = `export function retry(run, attempts = 3, wait = 200) {
  let last

  for (let at = 0; at < attempts; at += 1) {
    try {
      return run()
    } catch (error) {
      last = error
      sleep(wait * 2 ** at)
    }
  }

  throw last
}

export function onReconnect(socket, run) {
  socket.removeEventListener("open", run)
  socket.addEventListener("open", run)
}`

export function ReviewableDiffDemo() {
  const [applied, setApplied] = React.useState<number | null>(null)

  return (
    <div className="w-full max-w-xl space-y-3">
      <ReviewableDiff
        before={before}
        after={after}
        filename="src/upload/retry.ts"
        context={2}
        onApply={(hunks) => setApplied(hunks.length)}
      />

      {applied !== null ? (
        <p className="text-muted-foreground text-xs">
          Applied {applied} {applied === 1 ? "hunk" : "hunks"}. The rest of the
          patch is still here, unchanged.
        </p>
      ) : null}
    </div>
  )
}
