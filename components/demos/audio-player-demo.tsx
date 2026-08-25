"use client"

import { SAMPLE_AUDIO, voiceNote } from "@/components/demos/audio-fixtures"
import { AudioPlayer } from "@/registry/default/audio-player/audio-player"

export function AudioPlayerDemo() {
  return (
    <div className="w-full max-w-lg">
      <AudioPlayer
        src={SAMPLE_AUDIO}
        waveform
        transcript={voiceNote}
        label="voice note"
      />
    </div>
  )
}
