"use client"

import * as React from "react"

import { VoiceInput } from "@/registry/default/voice-input/voice-input"

export function VoiceInputDemo() {
  const [recording, setRecording] = React.useState<{
    url: string
    seconds: number
  } | null>(null)
  const startedAt = React.useRef(0)

  React.useEffect(
    () => () => {
      if (recording) URL.revokeObjectURL(recording.url)
    },
    [recording]
  )

  return (
    <div className="w-full max-w-md space-y-3">
      <VoiceInput
        maxDuration={30}
        onStart={() => {
          startedAt.current = Date.now()
          setRecording(null)
        }}
        onResult={(blob) => {
          setRecording({
            url: URL.createObjectURL(blob),
            seconds: (Date.now() - startedAt.current) / 1000,
          })
        }}
      />

      {recording ? (
        <div className="border-border bg-muted/40 space-y-2 rounded-lg border p-3">
          <p className="text-muted-foreground text-xs">
            {recording.seconds.toFixed(1)} seconds captured. Nothing left this
            page: the recording is a blob in memory, for you to send wherever it
            gets read.
          </p>
          <audio controls src={recording.url} className="w-full" />
        </div>
      ) : null}
    </div>
  )
}
