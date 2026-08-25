import type { TranscriptLine } from "@/registry/default/audio-player/audio-player"

export const SAMPLE_AUDIO = "/demo/audio/voice-note.m4a"

/**
 * Timed from the four clips this file was assembled out of, so every line
 * starts on the word it names rather than near it.
 */
export const voiceNote: TranscriptLine[] = [
  { start: 0, end: 1.52, text: "Quick note before I forget." },
  {
    start: 1.87,
    end: 5.07,
    text: "The upload retry is firing twice when the network drops.",
  },
  {
    start: 5.42,
    end: 8.1,
    text: "I think the listener gets added again on reconnect.",
  },
  {
    start: 8.45,
    end: 11.88,
    text: "I'll push a fix this afternoon, but I wanted it written down.",
  },
]

export const SAMPLE_VIDEO = "/demo/video/screen-note.mp4"

export const videoCaptions = [
  {
    src: "/demo/video/screen-note.vtt",
    srcLang: "en",
    label: "English",
    default: true,
  },
]
