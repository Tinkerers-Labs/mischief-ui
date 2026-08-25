"use client"

import { SAMPLE_VIDEO, videoCaptions } from "@/components/demos/audio-fixtures"
import { VideoPlayer } from "@/registry/default/video-player/video-player"

export function VideoPlayerDemo() {
  return (
    <div className="w-full max-w-xl">
      <VideoPlayer
        src={SAMPLE_VIDEO}
        label="a screen recording of the invoice"
        tracks={videoCaptions}
      />
    </div>
  )
}
