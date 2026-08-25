"use client"

import * as React from "react"

import { ScrubBar } from "@/registry/default/scrub-bar/scrub-bar"

export function ScrubBarDemo() {
  const [at, setAt] = React.useState(42)

  return (
    <div className="w-full max-w-md">
      <ScrubBar
        duration={214}
        value={at}
        buffered={158}
        onValueChange={setAt}
        label="Seek the recording"
      />
    </div>
  )
}
