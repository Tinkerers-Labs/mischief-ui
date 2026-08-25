import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { BarVisualizer } from "../registry/default/bar-visualizer/bar-visualizer"
import { MicSelector } from "../registry/default/mic-selector/mic-selector"

function stubDevices(
  devices: Partial<MediaDeviceInfo>[],
  { fail }: { fail?: string } = {}
) {
  const track = { stop: vi.fn() }
  const stream = { getTracks: () => [track] } as unknown as MediaStream

  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      enumerateDevices: vi.fn(async () => devices as MediaDeviceInfo[]),
      getUserMedia: vi.fn(async () => {
        if (fail) {
          const error = new Error(fail)
          error.name = fail
          throw error
        }
        return stream
      }),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  })

  vi.stubGlobal(
    "AudioContext",
    class {
      createAnalyser() {
        return {
          fftSize: 0,
          frequencyBinCount: 32,
          connect: vi.fn(),
          disconnect: vi.fn(),
          getByteTimeDomainData: vi.fn(),
          getByteFrequencyData: vi.fn(),
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

  return { track }
}

const microphones: Partial<MediaDeviceInfo>[] = [
  { deviceId: "built-in", kind: "audioinput" as const, label: "" },
  { deviceId: "usb", kind: "audioinput" as const, label: "" },
  { deviceId: "speakers", kind: "audiooutput" as const, label: "Speakers" },
]

describe("MicSelector", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("lists inputs only, and numbers them while the names are withheld", async () => {
    stubDevices(microphones)

    render(<MicSelector />)

    const list = await screen.findByRole("combobox", { name: "Microphone" })
    const options = within(list).getAllByRole("option")

    expect(options.map((option) => option.textContent)).toEqual([
      "Microphone 1",
      "Microphone 2",
    ])
  })

  it("uses the real names once permission has been given", async () => {
    const named = microphones.map((device) =>
      device.kind === "audioinput"
        ? { ...device, label: `${device.deviceId} microphone` }
        : device
    )
    stubDevices(named)

    render(<MicSelector />)

    expect(
      await screen.findByRole("option", { name: "built-in microphone" })
    ).toBeInTheDocument()
  })

  it("opens the device only when the test is pressed", async () => {
    stubDevices(microphones)
    const user = userEvent.setup()

    render(<MicSelector />)
    await screen.findByRole("combobox")

    expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled()

    await user.click(screen.getByRole("button", { name: "Test Microphone" }))

    await waitFor(() =>
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled()
    )
  })

  it("says a refusal apart from a failure", async () => {
    stubDevices(microphones, { fail: "NotAllowedError" })
    const user = userEvent.setup()

    render(<MicSelector />)
    await screen.findByRole("combobox")
    await user.click(screen.getByRole("button", { name: "Test Microphone" }))

    // The words are shown and announced, so both halves are expected.
    await waitFor(() =>
      expect(
        screen.getAllByText("Microphone permission was refused.")
      ).toHaveLength(2)
    )
  })

  it("stops the device when it goes away", async () => {
    const { track } = stubDevices(microphones)
    const user = userEvent.setup()

    const { unmount } = render(<MicSelector />)
    await screen.findByRole("combobox")
    await user.click(screen.getByRole("button", { name: "Test Microphone" }))
    await screen.findByRole("button", { name: "Stop testing Microphone" })

    unmount()
    expect(track.stop).toHaveBeenCalled()
  })
})

describe("BarVisualizer", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("says what is happening, not only draws it", () => {
    stubDevices([])

    render(<BarVisualizer state="speaking" />)

    expect(screen.getByText("Speaking.")).toBeInTheDocument()
  })

  it("puts the state on the element for a composer to style around", () => {
    stubDevices([])

    const { container } = render(<BarVisualizer state="listening" />)

    expect(
      container.querySelector("[data-slot=bar-visualizer]")
    ).toHaveAttribute("data-state", "listening")
  })
})
