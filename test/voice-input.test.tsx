import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { VoiceInput } from "../registry/default/voice-input/voice-input"

/** A microphone that yields one chunk and then stops. */
function stubMedia({ fail }: { fail?: string } = {}) {
  const track = { stop: vi.fn() }
  const stream = { getTracks: () => [track] } as unknown as MediaStream

  const getUserMedia = vi.fn(async () => {
    if (fail) {
      const error = new Error(fail)
      error.name = fail
      throw error
    }
    return stream
  })

  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia },
  })

  const listeners = new Map<string, (event: unknown) => void>()

  class Recorder {
    state = "inactive"
    mimeType = "audio/webm"
    static isTypeSupported = () => true
    addEventListener(name: string, handler: (event: unknown) => void) {
      listeners.set(name, handler)
    }
    start() {
      this.state = "recording"
    }
    stop() {
      this.state = "inactive"
      listeners.get("dataavailable")?.({ data: new Blob(["x"]) })
      listeners.get("stop")?.({})
    }
  }

  vi.stubGlobal("MediaRecorder", Recorder)
  vi.stubGlobal(
    "AudioContext",
    class {
      createAnalyser() {
        return {
          fftSize: 0,
          frequencyBinCount: 32,
          connect: vi.fn(),
          getByteTimeDomainData: vi.fn(),
        }
      }
      createMediaStreamSource() {
        return { connect: vi.fn() }
      }
      close() {
        return Promise.resolve()
      }
    }
  )

  return { getUserMedia, track }
}

afterEach(() => {
  vi.unstubAllGlobals()
  Reflect.deleteProperty(navigator, "mediaDevices")
})

describe("VoiceInput", () => {
  it("says so when the browser cannot record, rather than offering a dead button", async () => {
    render(<VoiceInput />)

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled()
    })
    expect(
      screen.getByText("Recording is not available in this browser.", {
        selector: "p",
      })
    ).toBeInTheDocument()
  })

  it("says the message once, not once visibly and once aloud", async () => {
    render(<VoiceInput />)

    await waitFor(() => expect(screen.getByRole("button")).toBeDisabled())

    const spoken = screen.getAllByText(
      "Recording is not available in this browser."
    )
    // Both halves are in the DOM; only one of them is in the accessibility
    // tree, so the message is not read out twice.
    expect(spoken).toHaveLength(2)
    expect(
      spoken.filter((node) => !node.closest("[aria-hidden='true']"))
    ).toHaveLength(1)
  })

  it("asks for the microphone and reports that it is listening", async () => {
    const { getUserMedia } = stubMedia()
    const user = userEvent.setup()
    render(<VoiceInput />)

    const button = screen.getByRole("button", { name: "Record a message" })
    await waitFor(() => expect(button).toBeEnabled())
    await user.click(button)

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true })
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Stop recording" })
      ).toHaveAttribute("aria-pressed", "true")
    })
  })

  it("hands back what it recorded, and lets go of the microphone", async () => {
    const { track } = stubMedia()
    const onResult = vi.fn()
    const user = userEvent.setup()
    render(<VoiceInput onResult={onResult} />)

    const button = screen.getByRole("button")
    await waitFor(() => expect(button).toBeEnabled())
    await user.click(button)

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Stop recording" })
      ).toBeInTheDocument()
    )
    await user.click(screen.getByRole("button", { name: "Stop recording" }))

    await waitFor(() => expect(onResult).toHaveBeenCalledTimes(1))
    expect(onResult.mock.calls[0]![0]).toBeInstanceOf(Blob)
    // The microphone light should not stay on after the recording ends.
    expect(track.stop).toHaveBeenCalled()
  })

  it("tells a refusal apart from a failure", async () => {
    stubMedia({ fail: "NotAllowedError" })
    const user = userEvent.setup()
    render(<VoiceInput />)

    const button = screen.getByRole("button")
    await waitFor(() => expect(button).toBeEnabled())
    await user.click(button)

    await waitFor(() => {
      expect(
        screen.getByText("Microphone permission was refused.", {
          selector: "p",
        })
      ).toBeInTheDocument()
    })
  })

  it("calls a missing device something other than a refusal", async () => {
    stubMedia({ fail: "NotFoundError" })
    const user = userEvent.setup()
    render(<VoiceInput />)

    const button = screen.getByRole("button")
    await waitFor(() => expect(button).toBeEnabled())
    await user.click(button)

    await waitFor(() => {
      expect(
        screen.getByText("The microphone could not be started.", {
          selector: "p",
        })
      ).toBeInTheDocument()
    })
  })

  it("reports its state on the element, for anything styling around it", async () => {
    stubMedia()
    const onStatusChange = vi.fn()
    const user = userEvent.setup()
    const { container } = render(<VoiceInput onStatusChange={onStatusChange} />)

    const root = container.querySelector("[data-slot='voice-input']")!
    await waitFor(() => expect(screen.getByRole("button")).toBeEnabled())
    expect(root).toHaveAttribute("data-status", "idle")

    await user.click(screen.getByRole("button"))
    await waitFor(() =>
      expect(root).toHaveAttribute("data-status", "listening")
    )
    expect(onStatusChange).toHaveBeenCalledWith("listening")
  })
})
