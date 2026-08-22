import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import * as React from "react"

import { AuroraField } from "../registry/default/aurora-field/aurora-field"
import { Burst, type BurstHandle } from "../registry/default/burst/burst"
import { ConstellationField } from "../registry/default/constellation-field/constellation-field"
import { DisplacementImage } from "../registry/default/displacement-image/displacement-image"
import { GrainOverlay } from "../registry/default/grain-overlay/grain-overlay"
import { RenderSurface } from "../registry/default/render-surface/render-surface"
import { SpotlightCard } from "../registry/default/spotlight-card/spotlight-card"
import { AsciiImage } from "../registry/default/ascii-image/ascii-image"
import { DitherImage } from "../registry/default/dither-image/dither-image"
import { PresenceField } from "../registry/default/presence-field/presence-field"
import { StreamGlow } from "../registry/default/stream-glow/stream-glow"
import { TiltCard } from "../registry/default/tilt-card/tilt-card"
import { WireframeGlobe } from "../registry/default/wireframe-globe/wireframe-globe"

const noop = {
  setup: () => null,
  draw: () => undefined,
}

describe("RenderSurface", () => {
  it("hides the canvas from assistive technology when it is decoration", () => {
    const { container } = render(<RenderSurface {...noop} />)
    const canvas = container.querySelector("canvas")

    expect(canvas).toHaveAttribute("aria-hidden", "true")
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it("announces the canvas as an image once it is given a label", () => {
    render(<RenderSurface {...noop} label="Twelve drifting dots" />)

    expect(
      screen.getByRole("img", { name: "Twelve drifting dots" })
    ).toBeInTheDocument()
  })
})

describe("AuroraField", () => {
  it("renders its children as ordinary markup above the field", () => {
    render(
      <AuroraField>
        <h2>Ship the interface you sketched</h2>
      </AuroraField>
    )

    expect(
      screen.getByRole("heading", { name: "Ship the interface you sketched" })
    ).toBeInTheDocument()
  })
})

describe("ConstellationField", () => {
  it("keeps the field behind its children and out of the pointer's way", () => {
    const { container } = render(
      <ConstellationField>
        <button type="button">Start</button>
      </ConstellationField>
    )

    const surface = container.querySelector("[data-slot='render-surface']")

    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument()
    expect(surface).toHaveClass("pointer-events-none")
  })
})

describe("GrainOverlay", () => {
  it("is decoration that never takes the pointer", () => {
    const { container } = render(<GrainOverlay />)
    const overlay = container.querySelector("[data-slot='grain-overlay']")

    expect(overlay).toHaveAttribute("aria-hidden", "true")
    expect(overlay).toHaveClass("pointer-events-none")
  })

  it("holds one grain still unless it is asked to animate", () => {
    vi.useFakeTimers()

    try {
      const { container } = render(<GrainOverlay />)
      const overlay = container.querySelector<HTMLElement>(
        "[data-slot='grain-overlay']"
      )
      const first = overlay?.style.backgroundImage

      vi.advanceTimersByTime(1000)

      expect(overlay?.style.backgroundImage).toBe(first)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe("SpotlightCard", () => {
  it("writes the light to the element rather than to React state", async () => {
    const user = userEvent.setup()

    const { container } = render(<SpotlightCard>Studio</SpotlightCard>)
    const card = container.querySelector<HTMLElement>(
      "[data-slot='spotlight-card']"
    )!

    expect(card.style.getPropertyValue("--spotlight-on")).toBe("")

    await user.pointer({ target: card, coords: { clientX: 10, clientY: 12 } })

    expect(card.style.getPropertyValue("--spotlight-on")).toBe("1")

    await user.unhover(card)

    expect(card.style.getPropertyValue("--spotlight-on")).toBe("0")
  })

  it("lights every card in the group from one pointer", async () => {
    const user = userEvent.setup()

    const { container } = render(
      <div>
        <SpotlightCard followGroup>Sketch</SpotlightCard>
        <SpotlightCard followGroup>Studio</SpotlightCard>
        <SpotlightCard followGroup>Workshop</SpotlightCard>
      </div>
    )

    const cards = Array.from(
      container.querySelectorAll<HTMLElement>("[data-slot='spotlight-card']")
    )

    await user.pointer({
      target: cards[0]!,
      coords: { clientX: 8, clientY: 8 },
    })

    for (const card of cards) {
      expect(card.style.getPropertyValue("--spotlight-on")).toBe("1")
    }
  })
})

describe("Burst", () => {
  it("says what happened, so the meaning survives without the pieces", async () => {
    function Harness() {
      const burst = React.useRef<BurstHandle>(null)

      return (
        <div>
          <Burst ref={burst} announce="Invoice paid" />
          <button type="button" onClick={() => burst.current?.fire()}>
            Mark as paid
          </button>
        </div>
      )
    }

    const user = userEvent.setup()
    render(<Harness />)

    expect(screen.getByRole("status")).toHaveTextContent("")

    await user.click(screen.getByRole("button", { name: "Mark as paid" }))

    expect(screen.getByRole("status")).toHaveTextContent("Invoice paid")
  })

  it("covers the region it was placed in without taking the pointer", () => {
    const { container } = render(<Burst />)
    const root = container.querySelector("[data-slot='burst']")

    expect(root).toHaveClass("pointer-events-none")
    expect(root).toHaveClass("absolute")
  })
})

describe("DisplacementImage", () => {
  it("shows a real picture whether or not the shader ever runs", () => {
    render(
      <DisplacementImage
        from="/covers/before.jpg"
        to="/covers/after.jpg"
        alt="The studio before and after the rebuild"
      />
    )

    const fallback = screen.getByAltText(
      "The studio before and after the rebuild"
    )

    expect(fallback.tagName).toBe("IMG")
    expect(fallback).toHaveAttribute("src", "/covers/before.jpg")
  })

  it("crosses on focus as well as on hover", async () => {
    const user = userEvent.setup()

    const { container } = render(
      <DisplacementImage from="/a.jpg" to="/b.jpg" alt="A becoming B">
        <button type="button">Open</button>
      </DisplacementImage>
    )

    const root = container.querySelector("[data-slot='displacement-image']")!

    expect(root).not.toHaveAttribute("data-active")

    await user.tab()

    expect(root).toHaveAttribute("data-active")
  })
})

describe("TiltCard", () => {
  it("writes the lean to the element and returns it on the way out", async () => {
    const user = userEvent.setup()

    const { container } = render(<TiltCard>Boarding pass</TiltCard>)
    const card = container.querySelector<HTMLElement>(
      "[data-slot='tilt-card']"
    )!

    await user.pointer({ target: card, coords: { clientX: 4, clientY: 4 } })
    expect(card.style.getPropertyValue("--tilt-x")).not.toBe("")

    await user.unhover(card)
    expect(card.style.getPropertyValue("--tilt-x")).toBe("0deg")
    expect(card.style.getPropertyValue("--tilt-lift")).toBe("0px")
  })
})

describe("PresenceField", () => {
  it("carries the state on the element and keeps the canvas decorative", () => {
    const { container } = render(
      <PresenceField state="streaming">
        <p>Answering</p>
      </PresenceField>
    )

    const field = container.querySelector("[data-slot='presence-field']")
    expect(field).toHaveAttribute("data-state", "streaming")
    expect(screen.getByText("Answering")).toBeInTheDocument()
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })
})

describe("StreamGlow", () => {
  it("marks itself active without taking the pointer or the label", () => {
    const { container } = render(
      <StreamGlow active>
        <p>The answer so far</p>
      </StreamGlow>
    )

    const root = container.querySelector("[data-slot='stream-glow']")!
    expect(root).toHaveAttribute("data-active")

    const layer = root.querySelector("span")!
    expect(layer).toHaveAttribute("aria-hidden", "true")
    expect(layer).toHaveClass("pointer-events-none")
  })
})

describe("WireframeGlobe", () => {
  it("writes the places out as text, not only onto the sphere", () => {
    render(
      <WireframeGlobe
        markers={[
          { id: "lhr", lat: 51.47, lng: -0.45, label: "London" },
          { id: "sin", lat: 1.36, lng: 103.99, label: "Singapore" },
        ]}
      />
    )

    expect(screen.getByText("London")).toBeInTheDocument()
    expect(screen.getByText("Singapore")).toBeInTheDocument()
  })
})

describe("DitherImage", () => {
  it("keeps the photograph underneath whether or not the shader runs", () => {
    render(<DitherImage src="/a.jpg" alt="Ada at her desk" />)

    const fallback = screen.getByAltText("Ada at her desk")
    expect(fallback.tagName).toBe("IMG")
    expect(fallback).toHaveAttribute("src", "/a.jpg")
  })
})

describe("AsciiImage", () => {
  it("describes the picture it drew", () => {
    const { container } = render(
      <AsciiImage src="/a.jpg" alt="Ada, drawn as characters" />
    )

    expect(
      container.querySelector("[data-slot='ascii-image']")
    ).toBeInTheDocument()
  })
})
