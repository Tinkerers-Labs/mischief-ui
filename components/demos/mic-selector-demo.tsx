"use client"

import * as React from "react"

import { MicSelector } from "@/registry/default/mic-selector/mic-selector"

export function MicSelectorDemo() {
  const [chosen, setChosen] = React.useState("")

  return (
    <div className="w-full max-w-md space-y-3">
      <MicSelector value={chosen} onValueChange={setChosen} />

      <p className="text-muted-foreground text-xs">
        Names stay hidden until a page has been granted the microphone once, so
        the list reads Microphone 1 and 2 until you run the test.
      </p>
    </div>
  )
}
