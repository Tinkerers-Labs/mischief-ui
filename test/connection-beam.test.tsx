import * as React from "react"
import { render, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ConnectionBeam } from "../registry/default/connection-beam/connection-beam"

/** jsdom lays nothing out, so the boxes say where they are. */
function place(element: HTMLElement, box: Partial<DOMRect>) {
  element.getBoundingClientRect = vi.fn(
    () =>
      ({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        right: 0,
        bottom: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
        ...box,
      }) as DOMRect
  )
}

function Diagram(props: Partial<React.ComponentProps<typeof ConnectionBeam>>) {
  const container = React.useRef<HTMLDivElement>(null)
  const from = React.useRef<HTMLDivElement>(null)
  const to = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    place(container.current!, { left: 0, top: 0, width: 400, height: 200 })
    place(from.current!, { left: 20, top: 80, width: 40, height: 40 })
    place(to.current!, { left: 340, top: 80, width: 40, height: 40 })
  }, [])

  return (
    <div ref={container} data-testid="container">
      <div ref={from} data-testid="from" />
      <div ref={to} data-testid="to" />
      <ConnectionBeam
        containerRef={container}
        fromRef={from}
        toRef={to}
        {...props}
      />
    </div>
  )
}

function beam(container: HTMLElement) {
  return container.querySelector<SVGSVGElement>("[data-slot='connection-beam']")
}

describe("ConnectionBeam", () => {
  it("sizes itself to the box the endpoints live in", async () => {
    const { container } = render(<Diagram />)

    await waitFor(() => expect(beam(container)).toBeInTheDocument())
    expect(beam(container)).toHaveAttribute("width", "400")
    expect(beam(container)).toHaveAttribute("height", "200")
  })

  it("leaves and arrives at the facing edges, not the centres", async () => {
    const { container } = render(<Diagram inset={0} curvature={0} />)

    await waitFor(() => expect(beam(container)).toBeInTheDocument())
    const d = beam(container)!.querySelector("path")!.getAttribute("d")!

    // The run is horizontal, so it leaves the right edge of the first box
    // (20 + 40) and arrives at the left edge of the second (340).
    expect(d).toMatch(/^M 60,100 /)
    expect(d).toMatch(/ 340,100$/)
  })

  it("keeps the clearance it was given at each end", async () => {
    const { container } = render(<Diagram inset={6} curvature={0} />)

    await waitFor(() => expect(beam(container)).toBeInTheDocument())
    const d = beam(container)!.querySelector("path")!.getAttribute("d")!

    expect(d).toMatch(/^M 66,100 /)
    expect(d).toMatch(/ 334,100$/)
  })

  it("bows square to the run, so the curve does not depend on the order", async () => {
    const { container } = render(<Diagram curvature={40} inset={0} />)

    await waitFor(() => expect(beam(container)).toBeInTheDocument())
    const d = beam(container)!.querySelector("path")!.getAttribute("d")!

    // A horizontal run bends vertically: the control point is above the line.
    expect(d).toContain("Q 200,60")
  })

  it("draws the line and the travelling part on the same path", async () => {
    const { container } = render(<Diagram />)

    await waitFor(() => expect(beam(container)).toBeInTheDocument())
    const paths = beam(container)!.querySelectorAll("path")

    expect(paths).toHaveLength(2)
    expect(paths[0]!.getAttribute("d")).toBe(paths[1]!.getAttribute("d"))
  })

  it("measures the travelling part as a share of the line", async () => {
    const { container } = render(<Diagram extent={0.25} />)

    await waitFor(() => expect(beam(container)).toBeInTheDocument())
    const pulse = beam(container)!.querySelectorAll("path")[1]!

    expect(pulse).toHaveAttribute("pathLength", "100")
    expect(pulse).toHaveAttribute("stroke-dasharray", "25 75")
  })

  it("hides the travelling part rather than parking it as a stray dash", async () => {
    const { container } = render(<Diagram />)

    await waitFor(() => expect(beam(container)).toBeInTheDocument())
    const [line, pulse] = beam(container)!.querySelectorAll("path")

    expect(pulse!.getAttribute("class")).toContain("motion-reduce:hidden")
    expect(pulse!.getAttribute("class")).toContain("motion-safe:animate-")
    // The line itself is not animated, so it survives either way.
    expect(line!.getAttribute("class")).toBeNull()
  })

  it("takes theme tokens as colours, and passes anything else through", async () => {
    const { container } = render(
      <Diagram pathColor="--border" beamColor="tomato" />
    )

    await waitFor(() => expect(beam(container)).toBeInTheDocument())
    const [line, pulse] = beam(container)!.querySelectorAll("path")

    expect(line).toHaveAttribute("stroke", "var(--border)")
    expect(pulse).toHaveAttribute("stroke", "tomato")
  })

  it("is decoration, so it is not in the accessibility tree", async () => {
    const { container } = render(<Diagram />)

    await waitFor(() => expect(beam(container)).toBeInTheDocument())
    expect(beam(container)).toHaveAttribute("aria-hidden", "true")
  })

  it("draws nothing until it has something to measure", () => {
    function Empty() {
      const container = React.useRef<HTMLDivElement>(null)
      const missing = React.useRef<HTMLDivElement>(null)

      return (
        <div ref={container}>
          <ConnectionBeam
            containerRef={container}
            fromRef={missing}
            toRef={missing}
          />
        </div>
      )
    }

    const { container } = render(<Empty />)
    expect(beam(container)).toBeNull()
  })
})
