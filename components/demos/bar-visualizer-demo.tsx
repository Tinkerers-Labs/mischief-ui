"use client"

import * as React from "react"
import { Pause, Play } from "lucide-react"

import { SAMPLE_AUDIO } from "@/components/demos/audio-fixtures"
import { BarVisualizer } from "@/registry/default/bar-visualizer/bar-visualizer"

export function BarVisualizerDemo() {
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [element, setElement] = React.useState<HTMLAudioElement | null>(null)
  const [speaking, setSpeaking] = React.useState(false)

  React.useEffect(() => setElement(audioRef.current), [])

  return (
    <div className="border-border bg-background flex w-full max-w-md items-center gap-3 rounded-xl border p-3">
      <audio
        ref={audioRef}
        src={SAMPLE_AUDIO}
        preload="metadata"
        onPlay={() => setSpeaking(true)}
        onPause={() => setSpeaking(false)}
        onEnded={() => setSpeaking(false)}
      />

      <button
        type="button"
        aria-label={speaking ? "Stop the reply" : "Play the reply"}
        onClick={() => {
          const audio = audioRef.current
          if (!audio) return
          if (speaking) audio.pause()
          else void audio.play().catch(() => {})
        }}
        className="bg-foreground text-background focus-visible:ring-ring inline-flex size-10 shrink-0 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
      >
        {speaking ? (
          <Pause aria-hidden="true" size={16} />
        ) : (
          <Play aria-hidden="true" size={16} />
        )}
      </button>

      <BarVisualizer
        source={element}
        state={speaking ? "speaking" : "idle"}
        className="h-10 flex-1"
      />
    </div>
  )
}
