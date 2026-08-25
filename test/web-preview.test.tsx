import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { VideoPlayer } from "../registry/default/video-player/video-player"
import { WebPreview } from "../registry/default/web-preview/web-preview"

describe("WebPreview", () => {
  it("names the frame, because an unnamed one announces nothing", () => {
    render(<WebPreview src="/built" title="The page the agent built" />)

    expect(screen.getByTitle("The page the agent built")).toBeInTheDocument()
  })

  it("never grants same-origin alongside scripts", () => {
    const { container } = render(<WebPreview src="/built" title="Preview" />)
    const sandbox = container.querySelector("iframe")!.getAttribute("sandbox")!

    expect(sandbox).toContain("allow-scripts")
    expect(sandbox).not.toContain("allow-same-origin")
  })

  it("remounts the frame to reload, rather than reaching into it", async () => {
    const user = userEvent.setup()
    const { container } = render(<WebPreview src="/built" title="Preview" />)

    const before = container.querySelector("iframe")
    await user.click(screen.getByRole("button", { name: "Reload the preview" }))

    expect(container.querySelector("iframe")).not.toBe(before)
  })

  it("keeps the address read-only until editing is turned on", async () => {
    const onNavigate = vi.fn()
    const user = userEvent.setup()

    const { rerender } = render(<WebPreview src="/built" title="Preview" />)
    expect(screen.getByLabelText("Address")).toHaveAttribute("readonly")

    rerender(
      <WebPreview
        src="/built"
        title="Preview"
        editable
        onNavigate={onNavigate}
      />
    )
    await user.clear(screen.getByLabelText("Address"))
    await user.type(screen.getByLabelText("Address"), "/other{Enter}")

    expect(onNavigate).toHaveBeenCalledWith("/other")
  })

  it("offers widths as pressed toggles", async () => {
    const user = userEvent.setup()
    render(<WebPreview src="/built" title="Preview" defaultSize="phone" />)

    expect(screen.getByRole("button", { name: "Phone" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )

    await user.click(screen.getByRole("button", { name: "Tablet" }))
    expect(screen.getByRole("button", { name: "Tablet" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
  })
})

describe("VideoPlayer", () => {
  it("names the video and every control after it", () => {
    render(<VideoPlayer src="/clip.mp4" label="the walkthrough" />)

    expect(
      screen.getByRole("button", { name: "Play the walkthrough" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("slider", { name: "Seek the walkthrough" })
    ).toBeInTheDocument()
  })

  it("shows a caption toggle only when there are tracks", () => {
    const { rerender } = render(
      <VideoPlayer src="/clip.mp4" label="the walkthrough" />
    )
    expect(
      screen.queryByRole("button", { name: /captions/i })
    ).not.toBeInTheDocument()

    rerender(
      <VideoPlayer
        src="/clip.mp4"
        label="the walkthrough"
        tracks={[
          { src: "/clip.vtt", srcLang: "en", label: "English", default: true },
        ]}
      />
    )
    expect(
      screen.getByRole("button", { name: "Turn captions off" })
    ).toHaveAttribute("aria-pressed", "true")
  })

  it("renders the track so the browser draws the cues", () => {
    const { container } = render(
      <VideoPlayer
        src="/clip.mp4"
        label="the walkthrough"
        tracks={[{ src: "/clip.vtt", srcLang: "en", label: "English" }]}
      />
    )

    const track = container.querySelector("track")!
    expect(track).toHaveAttribute("kind", "captions")
    expect(track).toHaveAttribute("srclang", "en")
  })
})
