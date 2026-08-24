import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Marquee } from "../registry/default/marquee/marquee"

function items() {
  return ["one", "two"].map((word) => <span key={word}>{word}</span>)
}

describe("Marquee", () => {
  it("repeats the children so the loop has no seam", () => {
    const { container } = render(<Marquee>{items()}</Marquee>)

    const copies = container.querySelectorAll(
      "[data-slot='marquee'] > div > div"
    )
    expect(copies).toHaveLength(2)
  })

  it("says the children once, however many times they are drawn", () => {
    render(<Marquee copies={4}>{items()}</Marquee>)

    // Every repeat past the first is decoration, so it is hidden from the
    // accessibility tree and the text is reachable exactly once.
    expect(
      screen.getAllByText("one", { ignore: "[aria-hidden] *" })
    ).toHaveLength(1)
  })

  it("never draws fewer than the two copies the loop needs", () => {
    const { container } = render(<Marquee copies={1}>{items()}</Marquee>)

    expect(
      container.querySelectorAll("[data-slot='marquee'] > div > div")
    ).toHaveLength(2)
  })

  it("travels exactly one copy's worth, whatever the count", () => {
    const { container } = render(<Marquee copies={4}>{items()}</Marquee>)

    const track = container.querySelector<HTMLElement>(
      "[data-slot='marquee'] > div"
    )!
    expect(track.style.getPropertyValue("--marquee-shift")).toBe("-25%")
  })

  it("turns into a scrolling row when motion is unwelcome", () => {
    const { container } = render(<Marquee>{items()}</Marquee>)

    const root = container.querySelector<HTMLElement>("[data-slot='marquee']")!
    const track = container.querySelector<HTMLElement>(
      "[data-slot='marquee'] > div"
    )!
    const [, second] = container.querySelectorAll(
      "[data-slot='marquee'] > div > div"
    )

    // The animation is only applied when motion is welcome, the overflow
    // becomes scrollable when it is not, and the repeats go with it.
    expect(track.className).toContain("motion-safe:animate-")
    expect(root.className).toContain("motion-reduce:overflow-x-auto")
    expect(second!.className).toContain("motion-reduce:hidden")
  })

  it("scrolls the other way when it runs vertically", () => {
    const { container } = render(<Marquee direction="up">{items()}</Marquee>)

    const root = container.querySelector<HTMLElement>("[data-slot='marquee']")!
    expect(root).toHaveAttribute("data-direction", "up")
    expect(root.className).toContain("motion-reduce:overflow-y-auto")
    expect(
      container.querySelector<HTMLElement>("[data-slot='marquee'] > div")!
        .className
    ).toContain("mischief-marquee-y")
  })

  it("reverses rather than needing a second keyframe", () => {
    const { container } = render(<Marquee direction="right">{items()}</Marquee>)

    const track = container.querySelector<HTMLElement>(
      "[data-slot='marquee'] > div"
    )!
    expect(track.className).toContain("mischief-marquee-x")
    expect(track.className).toContain("[animation-direction:reverse]")
  })

  it("takes its pace and spacing from the props", () => {
    const { container } = render(
      <Marquee duration={7} gap={40}>
        {items()}
      </Marquee>
    )

    const track = container.querySelector<HTMLElement>(
      "[data-slot='marquee'] > div"
    )!
    expect(track.style.getPropertyValue("--marquee-duration")).toBe("7s")

    const copy = container.querySelector<HTMLElement>(
      "[data-slot='marquee'] > div > div"
    )!
    expect(copy.style.gap).toBe("40px")
    expect(copy.style.paddingInlineEnd).toBe("40px")
  })

  it("only softens the edges when asked", () => {
    const { container: plain } = render(<Marquee>{items()}</Marquee>)
    expect(
      plain.querySelector<HTMLElement>("[data-slot='marquee']")!.style.maskImage
    ).toBe("")

    const { container: faded } = render(<Marquee fade>{items()}</Marquee>)
    expect(
      faded.querySelector<HTMLElement>("[data-slot='marquee']")!.style.maskImage
    ).toContain("linear-gradient")
  })
})
