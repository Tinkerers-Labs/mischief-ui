import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  StackPanel,
  StackPanelItem,
} from "../registry/default/stack-panel/stack-panel"

function Settings({ onClear = vi.fn() }: { onClear?: () => void }) {
  return (
    <StackPanel title="Settings">
      <StackPanelItem label="Notifications" detail="On">
        <StackPanelItem label="Quiet hours" detail="22:00 to 07:00">
          <label>
            Start
            <input defaultValue="22:00" />
          </label>
        </StackPanelItem>
      </StackPanelItem>
      <StackPanelItem label="Storage">
        <StackPanelItem label="Clear cache" onSelect={onClear} />
      </StackPanelItem>
      <StackPanelItem label="Version" detail="4.2.0" />
    </StackPanel>
  )
}

function visiblePage() {
  return screen.getByRole("region", {
    name: (_, element) => !element.closest("[inert]"),
  })
}

describe("StackPanel", () => {
  it("shows only the first page, titled, with a row for each item", () => {
    render(<Settings />)

    expect(
      screen.getByRole("heading", { level: 2, name: "Settings" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Notifications/ })
    ).toHaveTextContent("On")
    expect(screen.queryByRole("button", { name: /Version/ })).toBeNull()
    expect(screen.getByText("4.2.0")).toBeInTheDocument()
    expect(screen.queryByText("Quiet hours")).toBeNull()
  })

  it("pushes the next page under the row's label and moves focus to it", async () => {
    const user = userEvent.setup()
    render(<Settings />)

    await user.click(screen.getByRole("button", { name: /Notifications/ }))

    const heading = screen.getByRole("heading", { name: "Notifications" })
    expect(heading).toHaveFocus()
    expect(visiblePage()).toHaveAccessibleName("Notifications")
    expect(
      screen.getByRole("button", { name: "Back to Settings" })
    ).toBeInTheDocument()
  })

  it("makes the covered page inert", async () => {
    const user = userEvent.setup()
    const { container } = render(<Settings />)

    await user.click(screen.getByRole("button", { name: /Notifications/ }))

    const pages = container.querySelectorAll("[data-slot='stack-panel-page']")
    expect(pages[0]).toHaveAttribute("inert")
    expect(pages[0]).toHaveAttribute("data-state", "covered")
    expect(pages[1]).not.toHaveAttribute("inert")
  })

  it("goes back and returns focus to the row it came from", async () => {
    const user = userEvent.setup()
    render(<Settings />)

    await user.click(screen.getByRole("button", { name: /Notifications/ }))
    await user.click(screen.getByRole("button", { name: "Back to Settings" }))

    expect(screen.queryByRole("heading", { name: "Notifications" })).toBeNull()
    expect(screen.getByRole("button", { name: /Notifications/ })).toHaveFocus()
  })

  it("goes back one level at a time on Escape", async () => {
    const user = userEvent.setup()
    render(<Settings />)

    await user.click(screen.getByRole("button", { name: /Notifications/ }))
    await user.click(screen.getByRole("button", { name: /Quiet hours/ }))
    expect(screen.getByRole("heading", { name: "Quiet hours" })).toHaveFocus()
    expect(
      screen.getByRole("button", { name: "Back to Notifications" })
    ).toBeInTheDocument()

    await user.keyboard("{Escape}")
    expect(screen.getByRole("button", { name: /Quiet hours/ })).toHaveFocus()

    await user.keyboard("{Escape}")
    expect(screen.getByRole("button", { name: /Notifications/ })).toHaveFocus()
  })

  it("goes back on Backspace, except while typing", async () => {
    const user = userEvent.setup()
    render(<Settings />)

    await user.click(screen.getByRole("button", { name: /Notifications/ }))
    await user.click(screen.getByRole("button", { name: /Quiet hours/ }))

    const field = screen.getByRole("textbox", { name: "Start" })
    await user.click(field)
    await user.keyboard("{Backspace}")

    expect(field).toHaveValue("22:0")
    expect(screen.getByRole("heading", { name: "Quiet hours" })).toBeVisible()

    screen.getByRole("heading", { name: "Quiet hours" }).focus()
    await user.keyboard("{Backspace}")
    expect(screen.queryByRole("heading", { name: "Quiet hours" })).toBeNull()
  })

  it("runs a row that opens nothing", async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(<Settings onClear={onClear} />)

    await user.click(screen.getByRole("button", { name: /Storage/ }))
    await user.click(screen.getByRole("button", { name: "Clear cache" }))

    expect(onClear).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("heading", { name: "Storage" })).toBeVisible()
  })

  it("leaves Escape alone on the first page", async () => {
    const user = userEvent.setup()
    const onKeyDown = vi.fn()

    render(
      <div onKeyDown={(event) => onKeyDown(event.key)}>
        <Settings />
      </div>
    )

    screen.getByRole("button", { name: /Notifications/ }).focus()
    await user.keyboard("{Escape}")

    expect(onKeyDown).toHaveBeenCalledWith("Escape")
  })

  it("keeps a page's own state while it is covered", async () => {
    const user = userEvent.setup()

    function Counter() {
      const [count, setCount] = React.useState(0)
      return (
        <StackPanel title="Root">
          <button type="button" onClick={() => setCount(count + 1)}>
            Count {count}
          </button>
          <StackPanelItem label="Next">
            <p>Second page</p>
          </StackPanelItem>
        </StackPanel>
      )
    }

    render(<Counter />)
    await user.click(screen.getByRole("button", { name: "Count 0" }))
    await user.click(screen.getByRole("button", { name: /Next/ }))
    await user.click(screen.getByRole("button", { name: "Back to Root" }))

    expect(screen.getByRole("button", { name: "Count 1" })).toBeInTheDocument()
  })
})
