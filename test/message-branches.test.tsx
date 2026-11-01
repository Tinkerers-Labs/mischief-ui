import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  MessageBranches,
  type BranchNode,
} from "../registry/default/message-branches/message-branches"

const nodes: BranchNode[] = [
  { id: "q1", parentId: null, label: "Keep my changes" },
  { id: "a1", parentId: "q1", label: "reset --soft" },
  { id: "q2", parentId: null, label: "Already pushed" },
  { id: "a2", parentId: "q2", label: "revert" },
  { id: "q2b", parentId: "a2", label: "A merge commit?" },
  { id: "a2b", parentId: "q2b", label: "revert -m 1" },
  { id: "a2c", parentId: "q2b", label: "revert with -m" },
  { id: "q3", parentId: null, label: "Amend the message" },
]

const path = ["q2", "a2", "q2b", "a2b"]

function setup(
  props: Partial<React.ComponentProps<typeof MessageBranches>> = {}
) {
  const onSelect = vi.fn()
  const user = userEvent.setup()
  const view = render(
    <MessageBranches
      activePath={path}
      messageId="q2"
      nodes={nodes}
      onSelect={onSelect}
      {...props}
    />
  )
  return { ...view, onSelect, user }
}

describe("MessageBranches", () => {
  it("renders nothing for a message with one version", () => {
    const { container } = setup({ messageId: "a2" })

    expect(container).toBeEmptyDOMElement()
  })

  it("names the control and says which version is shown", () => {
    setup()

    const group = screen.getByRole("group", {
      name: "Versions of this message",
    })

    expect(group).toHaveTextContent("Version 2 of 3")
  })

  it("steps to the neighbouring versions", async () => {
    const { onSelect, user } = setup()

    await user.click(screen.getByRole("button", { name: "Previous version" }))
    await user.click(screen.getByRole("button", { name: "Next version" }))

    expect(onSelect.mock.calls).toEqual([["q1"], ["q3"]])
  })

  it("keeps focus on an end button instead of disabling it away", async () => {
    const { onSelect, user } = setup({ messageId: "q3" })

    const next = screen.getByRole("button", { name: "Next version" })
    next.focus()
    await user.keyboard("{Enter}")

    expect(next).toHaveAttribute("aria-disabled", "true")
    expect(next).not.toBeDisabled()
    expect(next).toHaveFocus()
    expect(onSelect).not.toHaveBeenCalled()
  })

  it("announces the version after a step", async () => {
    const { container, rerender, user } = setup()
    const live = container.querySelector('[aria-live="polite"]')!

    expect(live).toHaveTextContent("")

    await user.click(screen.getByRole("button", { name: "Next version" }))
    rerender(
      <MessageBranches
        activePath={["q3"]}
        messageId="q3"
        nodes={nodes}
        onSelect={vi.fn()}
      />
    )

    expect(live).toHaveTextContent("Version 3 of 3")
  })

  it("shows the branch structure with linear runs folded into one row", async () => {
    const { user } = setup()

    const trigger = screen.getByRole("button", {
      name: "Show conversation branches",
    })
    await user.click(trigger)

    expect(trigger).toHaveAttribute("aria-expanded", "true")
    const panel = screen.getByRole("dialog", { name: "Conversation branches" })
    const rows = within(panel).getAllByRole("button")

    expect(rows.map((row) => row.getAttribute("aria-label"))).toEqual([
      "Keep my changes, 2 messages",
      "Already pushed, 3 messages, contains this message, shown",
      "revert -m 1, 1 message, shown",
      "revert with -m, 1 message",
      "Amend the message, 1 message",
    ])
    expect(rows[2]).toHaveAttribute("aria-current", "true")
    expect(rows[2]).toHaveFocus()
  })

  it("moves through the overview with arrow keys and selects with Enter", async () => {
    const { onSelect, user } = setup()

    const trigger = screen.getByRole("button", {
      name: "Show conversation branches",
    })
    await user.click(trigger)

    await user.keyboard("{ArrowDown}")
    expect(
      screen.getByRole("button", { name: /^revert with -m/ })
    ).toHaveFocus()

    await user.keyboard("{Home}{Enter}")

    expect(onSelect).toHaveBeenCalledWith("q1")
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(trigger).toHaveFocus()
  })

  it("closes the overview on Escape and on an outside press", async () => {
    const { user } = setup()

    const trigger = screen.getByRole("button", {
      name: "Show conversation branches",
    })
    await user.click(trigger)
    await user.keyboard("{Escape}")

    expect(screen.queryByRole("dialog")).toBeNull()
    expect(trigger).toHaveFocus()

    await user.click(trigger)
    await user.click(document.body)

    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("leaves the overview out when asked", () => {
    setup({ overview: false })

    expect(
      screen.queryByRole("button", { name: "Show conversation branches" })
    ).toBeNull()
  })

  it("drops the counter slide under reduced motion", async () => {
    const { container, user } = setup()

    await user.click(screen.getByRole("button", { name: "Next version" }))

    expect(container.querySelector(".tabular-nums > span")).toHaveClass(
      "motion-reduce:transition-none"
    )
  })
})
