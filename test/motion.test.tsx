import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { NumberTicker } from "../registry/default/number-ticker/number-ticker"
import { Reveal } from "../registry/default/reveal/reveal"
import { ScrollScene } from "../registry/default/scroll-scene/scroll-scene"
import { SplitText } from "../registry/default/split-text/split-text"

describe("Reveal", () => {
  it("has the content in the document before anything has animated", () => {
    render(
      <Reveal>
        <p>Ready to go</p>
      </Reveal>
    )

    expect(screen.getByText("Ready to go")).toBeInTheDocument()
  })
})

describe("SplitText", () => {
  it("is announced as the sentence, not as its letters", () => {
    const line = "Good interfaces"
    const { container } = render(<SplitText trigger="mount">{line}</SplitText>)

    const root = container.querySelector("[data-slot='split-text']")!
    expect(root).toHaveAttribute("aria-label", line)

    expect(root).toHaveTextContent(line)

    // Every piece sits behind an aria-hidden ancestor, so the label is read
    // once instead of the letters one at a time.
    for (const piece of root.querySelectorAll("span")) {
      expect(piece.closest("[aria-hidden='true']")).not.toBeNull()
    }
  })

  it("only lets a line break between words", () => {
    const { container } = render(
      <SplitText trigger="mount">Good interfaces</SplitText>
    )

    const root = container.querySelector("[data-slot='split-text']")!
    const words = root.querySelectorAll(":scope > span")

    // "Good", the space it may break on, and "interfaces".
    expect(words).toHaveLength(3)
    for (const word of words) {
      expect(word.className).toContain("whitespace-nowrap")
    }
  })

  it("splits by word when asked, keeping the spaces", () => {
    const { container } = render(
      <SplitText by="word" trigger="mount">
        two words
      </SplitText>
    )

    const root = container.querySelector("[data-slot='split-text']")!
    expect(root.textContent).toBe("two words")
  })
})

describe("NumberTicker", () => {
  it("is labelled with the value it is counting to, not the one on screen", () => {
    const { container } = render(
      <NumberTicker
        value={1499}
        startOnView={false}
        format={{ style: "currency", currency: "USD" }}
      />
    )

    expect(
      container.querySelector("[data-slot='number-ticker']")
    ).toHaveAttribute("aria-label", "$1,499.00")
  })
})

describe("ScrollScene", () => {
  it("publishes its progress as a custom property on the element", () => {
    const { container } = render(
      <ScrollScene>
        <p>Held</p>
      </ScrollScene>
    )

    const scene = container.querySelector<HTMLElement>(
      "[data-slot='scroll-scene']"
    )!

    expect(scene.style.getPropertyValue("--scroll-progress")).not.toBe("")
    expect(screen.getByText("Held")).toBeInTheDocument()
  })
})
