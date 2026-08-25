"use client"

import * as React from "react"

import { ScrubBar } from "@/registry/default/scrub-bar/scrub-bar"
import { TranscriptViewer } from "@/registry/default/transcript-viewer/transcript-viewer"

const cues = [
  { id: "1", start: 0, speaker: "Ana", text: "Right, the renewal window." },
  {
    id: "2",
    start: 6,
    speaker: "Sam",
    text: "Sixty days before the term ends.",
  },
  { id: "3", start: 14, speaker: "Ana", text: "And if nobody sends notice?" },
  { id: "4", start: 21, speaker: "Sam", text: "It renews for another year." },
  {
    id: "5",
    start: 29,
    speaker: "Ana",
    text: "That is the bit to flag, then.",
  },
  {
    id: "6",
    start: 36,
    speaker: "Sam",
    text: "Agreed. I will pull the clause.",
  },
]

export function TranscriptViewerDemo() {
  const [time, setTime] = React.useState(14)

  return (
    <div className="w-full max-w-md space-y-3">
      <TranscriptViewer
        cues={cues}
        time={time}
        onSeek={(cue) => setTime(cue.start)}
      />
      <ScrubBar duration={44} value={time} onValueChange={setTime} />
    </div>
  )
}
