import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { EmptyState } from "../registry/default/empty-state/empty-state"
import { Kbd } from "../registry/default/kbd/kbd"
import {
  ModelPicker,
  type Model,
} from "../registry/default/model-picker/model-picker"
import { SourceCard } from "../registry/default/source-card/source-card"
import { StopGenerating } from "../registry/default/stop-generating/stop-generating"
import { TokenMeter } from "../registry/default/token-meter/token-meter"

describe("Kbd", () => {
  it("resolves Mod per platform", () => {
    const { container, rerender } = render(
      <Kbd keys="Mod+K" platform="other" />
    )

    expect(container.textContent).toContain("Ctrl")

    rerender(<Kbd keys="Mod+K" platform="mac" />)
    expect(container.textContent).toContain("⌘")
  })

  it("spells the chord out for a screen reader", () => {
    render(<Kbd keys="Mod+K" platform="mac" />)

    expect(screen.getByText("Command plus K")).toBeInTheDocument()
  })

  it("hides the glyphs from the accessibility tree", () => {
    const { container } = render(<Kbd keys="Mod+K" platform="mac" />)

    expect(
      [...container.querySelectorAll("kbd")].every(
        (key) => key.getAttribute("aria-hidden") === "true"
      )
    ).toBe(true)
  })

  it("takes keys already split apart", () => {
    const { container } = render(
      <Kbd keys={["Shift", "Enter"]} platform="other" />
    )

    expect(container.querySelectorAll("kbd")).toHaveLength(2)
  })
})

describe("StopGenerating", () => {
  it("is absent rather than dimmed when there is nothing to stop", () => {
    render(<StopGenerating running={false} onStop={vi.fn()} />)

    expect(screen.queryByRole("button")).toBeNull()
  })

  it("stops on click", async () => {
    const user = userEvent.setup()
    const onStop = vi.fn()

    render(<StopGenerating onStop={onStop} />)

    await user.click(screen.getByRole("button"))

    expect(onStop).toHaveBeenCalledOnce()
  })

  it("stops on Escape while it is running", () => {
    const onStop = vi.fn()

    render(<StopGenerating onStop={onStop} />)
    fireEvent.keyDown(window, { key: "Escape" })

    expect(onStop).toHaveBeenCalledOnce()
  })

  it("binds nothing when the shortcut is off", () => {
    const onStop = vi.fn()

    render(<StopGenerating onStop={onStop} shortcut={false} />)
    fireEvent.keyDown(window, { key: "Escape" })

    expect(onStop).not.toHaveBeenCalled()
  })

  it("unbinds Escape once it has stopped", () => {
    const onStop = vi.fn()

    const { rerender } = render(<StopGenerating onStop={onStop} />)
    rerender(<StopGenerating onStop={onStop} running={false} />)
    fireEvent.keyDown(window, { key: "Escape" })

    expect(onStop).not.toHaveBeenCalled()
  })
})

describe("TokenMeter", () => {
  it("reports its real bounds", () => {
    render(<TokenMeter used={50} limit={200} />)

    const meter = screen.getByRole("meter")

    expect(meter).toHaveAttribute("aria-valuenow", "50")
    expect(meter).toHaveAttribute("aria-valuemax", "200")
    expect(meter.getAttribute("aria-valuetext")).toContain("25 percent")
  })

  it("adds the segments up", () => {
    render(
      <TokenMeter
        limit={1000}
        segments={[
          { label: "System", value: 100 },
          { label: "History", value: 250 },
        ]}
      />
    )

    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "350")
  })

  it("names each segment in writing, not only in colour", () => {
    render(
      <TokenMeter limit={1000} segments={[{ label: "History", value: 250 }]} />
    )

    expect(screen.getByText("History")).toBeInTheDocument()
  })

  it("marks itself tight past the threshold", () => {
    const { container, rerender } = render(<TokenMeter used={10} limit={100} />)

    expect(
      container.querySelector('[data-slot="token-meter"]')
    ).not.toHaveAttribute("data-tight")

    rerender(<TokenMeter used={90} limit={100} />)
    expect(
      container.querySelector('[data-slot="token-meter"]')
    ).toHaveAttribute("data-tight", "true")
  })

  it("survives a limit of zero rather than dividing by it", () => {
    render(<TokenMeter used={10} limit={0} />)

    expect(screen.getByRole("meter").getAttribute("aria-valuetext")).toContain(
      "100 percent"
    )
  })
})

describe("ModelPicker", () => {
  const models: Model[] = [
    { id: "opus", name: "Opus", description: "Deepest" },
    { id: "sonnet", name: "Sonnet", badges: ["fast"] },
    { id: "legacy", name: "Legacy", disabled: true },
  ]

  it("stays shut until it is opened", () => {
    render(<ModelPicker models={models} />)

    expect(screen.queryByRole("listbox")).toBeNull()
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false")
  })

  it("names the current model on the trigger", () => {
    render(<ModelPicker models={models} defaultValue="sonnet" />)

    expect(
      screen.getByRole("button", { name: "Model: Sonnet" })
    ).toBeInTheDocument()
  })

  it("tracks the active option without moving focus off the list", async () => {
    const user = userEvent.setup()

    render(<ModelPicker models={models} defaultValue="opus" />)

    await user.click(screen.getByRole("button"))

    const list = screen.getByRole("listbox")
    expect(list).toHaveFocus()

    await user.keyboard("{ArrowDown}")

    const options = screen.getAllByRole("option")
    expect(list.getAttribute("aria-activedescendant")).toBe(options[1]!.id)
  })

  it("skips a disabled model when moving by keyboard", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <ModelPicker
        models={models}
        defaultValue="opus"
        onValueChange={onValueChange}
      />
    )

    await user.click(screen.getByRole("button"))
    // Two steps from the first choosable option wraps back to it, because the
    // disabled one is not in the cycle at all.
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}")

    expect(onValueChange).toHaveBeenCalledWith("opus")
  })

  it("closes on Escape and hands focus back", async () => {
    const user = userEvent.setup()

    render(<ModelPicker models={models} />)

    const trigger = screen.getByRole("button")
    await user.click(trigger)
    await user.keyboard("{Escape}")

    expect(screen.queryByRole("listbox")).toBeNull()
    expect(trigger).toHaveFocus()
  })

  it("stays controlled when a value is supplied", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <ModelPicker models={models} value="opus" onValueChange={onValueChange} />
    )

    await user.click(screen.getByRole("button"))
    await user.click(screen.getByRole("option", { name: /Sonnet/ }))

    expect(onValueChange).toHaveBeenCalledWith("sonnet")
    expect(
      screen.getByRole("button", { name: "Model: Opus" })
    ).toBeInTheDocument()
  })

  it("refuses a disabled model on click", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<ModelPicker models={models} onValueChange={onValueChange} />)

    await user.click(screen.getByRole("button"))
    await user.click(screen.getByRole("option", { name: /Legacy/ }))

    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe("SourceCard", () => {
  it("derives the host and marks the link as leaving", () => {
    render(<SourceCard title="Target Size" url="https://www.w3.org/WAI/x" />)

    const link = screen.getByRole("link")

    expect(link).toHaveAttribute("rel", "noreferrer noopener")
    expect(link).toHaveAttribute("target", "_blank")
    expect(screen.getByText("w3.org")).toBeInTheDocument()
  })

  it("prefers a source it was given over the host", () => {
    render(
      <SourceCard title="Notes" url="https://example.com/x" source="Handbook" />
    )

    expect(screen.getByText("Handbook")).toBeInTheDocument()
    expect(screen.queryByText("example.com")).toBeNull()
  })

  it("degrades rather than throwing on a url it cannot parse", () => {
    expect(() =>
      render(<SourceCard title="Broken" url="not a url" />)
    ).not.toThrow()
  })

  it("writes the score out beside the bar", () => {
    render(<SourceCard title="Match" score={0.94} />)

    expect(screen.getByText("94% match")).toBeInTheDocument()
  })

  it("clamps a score that is out of range", () => {
    render(<SourceCard title="Match" score={2} />)

    expect(screen.getByText("100% match")).toBeInTheDocument()
  })

  it("is a heading, so a list of them can be navigated", () => {
    render(<SourceCard title="Findable" />)

    expect(
      screen.getByRole("heading", { name: "Findable" })
    ).toBeInTheDocument()
  })
})

describe("EmptyState", () => {
  it("renders what it was given", () => {
    render(
      <EmptyState
        title="Nothing here"
        description="Add the first one."
        actions={<button type="button">Add</button>}
      />
    )

    expect(screen.getByText("Nothing here")).toBeInTheDocument()
    expect(screen.getByText("Add the first one.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument()
  })

  it("keeps the icon out of the accessibility tree", () => {
    const { container } = render(
      <EmptyState title="Nothing here" icon={<svg data-testid="mark" />} />
    )

    expect(container.querySelector("[aria-hidden='true']")).toContainElement(
      screen.getByTestId("mark")
    )
  })
})
