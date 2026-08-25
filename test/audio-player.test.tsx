import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AudioPlayer } from "../registry/default/audio-player/audio-player"

const lines = [
  { start: 0, end: 2, text: "Quick note before I forget." },
  { start: 2, end: 5, text: "The upload retry is firing twice." },
]

/** jsdom has no media stack, so playback is driven by hand. */
function stubAudio({ duration = 12 }: { duration?: number } = {}) {
  let current = 0

  Object.defineProperty(HTMLMediaElement.prototype, "duration", {
    configurable: true,
    get: () => duration,
  })
  Object.defineProperty(HTMLMediaElement.prototype, "currentTime", {
    configurable: true,
    get: () => current,
    set(value: number) {
      current = value
    },
  })
  Object.defineProperty(HTMLMediaElement.prototype, "play", {
    configurable: true,
    value: vi.fn(async function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("play"))
    }),
  })
  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value: vi.fn(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("pause"))
    }),
  })

  return {
    element: () => document.querySelector("audio")!,
    at: () => current,
  }
}

describe("AudioPlayer", () => {
  beforeEach(() => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:note")
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {})
  })

  it("seeks with a range input rather than the drawing", async () => {
    const audio = stubAudio()

    render(<AudioPlayer src="/note.m4a" waveform label="voice note" />)
    audio.element().dispatchEvent(new Event("loadedmetadata"))

    const seek = await screen.findByRole("slider", { name: "Seek voice note" })
    fireEvent.change(seek, { target: { value: "7.5" } })

    expect(audio.at()).toBe(7.5)
  })

  it("announces the position as a time, not a number of seconds", async () => {
    stubAudio({ duration: 95 })

    render(<AudioPlayer src="/note.m4a" />)
    document.querySelector("audio")!.dispatchEvent(new Event("loadedmetadata"))

    await waitFor(() =>
      expect(screen.getByRole("slider")).toHaveAttribute(
        "aria-valuetext",
        "0:00 of 1:35"
      )
    )
  })

  it("asks a recording with no duration to measure itself", async () => {
    const audio = stubAudio({ duration: Infinity })

    render(<AudioPlayer src="/note.m4a" />)
    audio.element().dispatchEvent(new Event("loadedmetadata"))

    // A MediaRecorder file reports Infinity until it is seeked past the end.
    await waitFor(() => expect(audio.at()).toBe(Number.MAX_SAFE_INTEGER))
  })

  it("seeks from a transcript line", async () => {
    const audio = stubAudio()
    const user = userEvent.setup()

    render(<AudioPlayer src="/note.m4a" transcript={lines} />)
    audio.element().dispatchEvent(new Event("loadedmetadata"))

    await user.click(
      screen.getByRole("button", { name: /upload retry is firing twice/ })
    )

    expect(audio.at()).toBe(2)
  })

  it("marks the line under the playhead", async () => {
    const audio = stubAudio()

    render(<AudioPlayer src="/note.m4a" transcript={lines} />)

    const element = audio.element()
    element.currentTime = 3
    element.dispatchEvent(new Event("timeupdate"))

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /upload retry is firing twice/ })
      ).toHaveAttribute("aria-current", "true")
    )
  })

  it("plays and pauses from one button", async () => {
    stubAudio()
    const user = userEvent.setup()

    render(<AudioPlayer src="/note.m4a" label="voice note" />)

    await user.click(screen.getByRole("button", { name: "Play voice note" }))
    expect(
      await screen.findByRole("button", { name: "Pause voice note" })
    ).toBeInTheDocument()
  })

  it("releases the url it made for a recording", () => {
    stubAudio()
    const { unmount } = render(<AudioPlayer src={new Blob(["x"])} />)

    unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:note")
  })
})
