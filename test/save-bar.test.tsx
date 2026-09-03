import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { SaveBar } from "../registry/default/save-bar/save-bar"

/** A form that goes clean once its save resolves, the way a host's would. */
function Settings({ onSave }: { onSave: () => Promise<void> }) {
  const [dirty, setDirty] = React.useState(true)

  return (
    <SaveBar
      dirty={dirty}
      onSave={async () => {
        await onSave()
        setDirty(false)
      }}
    />
  )
}

describe("SaveBar", () => {
  it("stays inert while there is nothing to save", () => {
    render(<SaveBar dirty={false} onSave={vi.fn()} />)

    const bar = screen.getByRole("region", { hidden: true })

    expect(bar).toHaveAttribute("data-state", "clean")
    expect(bar).toHaveAttribute("aria-hidden", "true")
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull()
  })

  it("comes up saying what is unsaved", () => {
    const { container } = render(<SaveBar dirty onSave={vi.fn()} />)

    const bar = screen.getByRole("region")

    expect(bar).toHaveAttribute("data-state", "dirty")
    expect(bar).toHaveTextContent("Unsaved changes")
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      "Unsaved changes"
    )
  })

  it("confirms a save, then leaves", async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)

    render(<Settings onSave={onSave} />)
    await user.click(screen.getByRole("button", { name: "Save" }))

    await waitFor(() =>
      expect(screen.getByRole("region")).toHaveTextContent("Saved")
    )
    expect(onSave).toHaveBeenCalledTimes(1)

    await waitFor(
      () =>
        expect(screen.getByRole("region", { hidden: true })).toHaveAttribute(
          "data-state",
          "clean"
        ),
      { timeout: 3000 }
    )
  })

  it("holds a failure on screen with a way to try again", async () => {
    const user = userEvent.setup()
    const failure = new Error("network")
    const onSaveError = vi.fn()

    render(
      <SaveBar
        dirty
        onSave={vi.fn().mockRejectedValue(failure)}
        onSaveError={onSaveError}
      />
    )
    await user.click(screen.getByRole("button", { name: "Save" }))

    await screen.findByRole("button", { name: "Try again" })

    expect(screen.getByRole("region")).toHaveAttribute("data-state", "error")
    expect(screen.getByRole("region")).toHaveTextContent("Could not save")
    expect(onSaveError).toHaveBeenCalledWith(failure)
  })

  it("saves on the shortcut, and only while there is something to save", async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)

    const { rerender } = render(<SaveBar dirty={false} onSave={onSave} />)
    await user.keyboard("{Control>}s{/Control}")

    expect(onSave).not.toHaveBeenCalled()

    rerender(<SaveBar dirty onSave={onSave} />)
    await user.keyboard("{Control>}s{/Control}")

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1))
  })

  it("offers Reset only when there is something to reset", async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()

    const { rerender } = render(<SaveBar dirty onSave={vi.fn()} />)

    expect(screen.queryByRole("button", { name: "Reset" })).toBeNull()

    rerender(<SaveBar dirty onSave={vi.fn()} onReset={onReset} />)
    await user.click(screen.getByRole("button", { name: "Reset" }))

    expect(onReset).toHaveBeenCalledTimes(1)
  })
})
