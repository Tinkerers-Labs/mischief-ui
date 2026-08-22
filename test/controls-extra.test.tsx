import * as React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AvatarStack } from "../registry/default/avatar-stack/avatar-stack"
import { OtpInput } from "../registry/default/otp-input/otp-input"
import { ResizablePanels } from "../registry/default/resizable-panels/resizable-panels"
import { SortableList } from "../registry/default/sortable-list/sortable-list"
import { Stepper } from "../registry/default/stepper/stepper"
import { TagInput } from "../registry/default/tag-input/tag-input"
import { Timeline } from "../registry/default/timeline/timeline"

describe("OtpInput", () => {
  it("spreads a pasted code across the boxes", async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()

    render(<OtpInput onComplete={onComplete} />)

    const first = screen.getByRole("textbox", {
      name: "One time code, character 1 of 6",
    })

    await user.click(first)
    await user.paste("482913")

    expect(onComplete).toHaveBeenCalledWith("482913")
    expect(first).toHaveValue("4")
    expect(
      screen.getByRole("textbox", { name: "One time code, character 6 of 6" })
    ).toHaveValue("3")
  })

  it("refuses characters the pattern does not allow", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<OtpInput onChange={onChange} />)

    await user.click(
      screen.getByRole("textbox", { name: "One time code, character 1 of 6" })
    )
    await user.keyboard("a")

    expect(onChange).not.toHaveBeenCalled()
  })

  it("steps back and clears when backspacing an empty box", async () => {
    const user = userEvent.setup()

    function Harness() {
      const [code, setCode] = React.useState("")
      return <OtpInput value={code} onChange={setCode} />
    }

    render(<Harness />)

    await user.click(
      screen.getByRole("textbox", { name: "One time code, character 1 of 6" })
    )
    await user.keyboard("12")
    await user.keyboard("{Backspace}")
    await user.keyboard("{Backspace}")

    expect(
      screen.getByRole("textbox", { name: "One time code, character 1 of 6" })
    ).toHaveValue("")
  })
})

describe("TagInput", () => {
  it("adds on Enter and says so", async () => {
    const user = userEvent.setup()
    render(<TagInput defaultValue={[]} />)

    await user.click(screen.getByRole("textbox"))
    await user.keyboard("design{Enter}")

    expect(
      screen.getByRole("button", { name: "Remove design" })
    ).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("Added design")
  })

  it("gives the last tag back on backspace in an empty field", async () => {
    const user = userEvent.setup()
    render(<TagInput defaultValue={["design", "motion"]} />)

    await user.click(screen.getByRole("textbox"))
    await user.keyboard("{Backspace}")

    expect(
      screen.queryByRole("button", { name: "Remove motion" })
    ).not.toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("Removed motion")
  })

  it("says why a duplicate was refused instead of doing nothing", async () => {
    const user = userEvent.setup()
    render(<TagInput defaultValue={["design"]} />)

    await user.click(screen.getByRole("textbox"))
    await user.keyboard("design{Enter}")

    expect(screen.getByRole("status")).toHaveTextContent(
      "design is already there"
    )
    expect(
      screen.getAllByRole("button", { name: "Remove design" })
    ).toHaveLength(1)
  })
})

describe("SortableList", () => {
  function Harness() {
    const [items, setItems] = React.useState([
      { id: "a", name: "Read the brief" },
      { id: "b", name: "Sketch three routes" },
      { id: "c", name: "Build one" },
    ])

    return (
      <SortableList
        items={items}
        getKey={(item) => item.id}
        getLabel={(item) => item.name}
        onReorder={setItems}
        renderItem={(item) => <p>{item.name}</p>}
      />
    )
  }

  it("reorders from the keyboard and announces where it went", async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const handle = screen.getByRole("button", {
      name: "Reorder Read the brief",
    })

    handle.focus()
    await user.keyboard(" ")
    expect(handle).toHaveAttribute("aria-pressed", "true")

    await user.keyboard("{ArrowDown}")

    expect(screen.getByRole("status")).toHaveTextContent(
      "Read the brief moved to position 2 of 3"
    )

    const rows = screen.getAllByRole("listitem")
    expect(
      within(rows[0]!).getByText("Sketch three routes")
    ).toBeInTheDocument()
  })

  it("puts the order back when the move is cancelled", async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const handle = screen.getByRole("button", {
      name: "Reorder Read the brief",
    })

    handle.focus()
    await user.keyboard(" ")
    await user.keyboard("{ArrowDown}")
    await user.keyboard("{Escape}")

    const rows = screen.getAllByRole("listitem")
    expect(within(rows[0]!).getByText("Read the brief")).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("Move cancelled")
  })
})

describe("ResizablePanels", () => {
  it("is a separator that carries its value and moves with the arrow keys", async () => {
    const user = userEvent.setup()
    render(<ResizablePanels first={<p>Tree</p>} second={<p>Editor</p>} />)

    const divider = screen.getByRole("separator", { name: "Resize panels" })

    expect(divider).toHaveAttribute("aria-valuenow", "50")
    expect(divider).toHaveAttribute("aria-orientation", "vertical")

    divider.focus()
    await user.keyboard("{ArrowRight}")
    expect(divider).toHaveAttribute("aria-valuenow", "54")

    await user.keyboard("{Home}")
    expect(divider).toHaveAttribute("aria-valuenow", "15")
  })
})

describe("Stepper", () => {
  const steps = [
    { id: "a", label: "Account" },
    { id: "b", label: "Workspace" },
    { id: "c", label: "Done" },
  ]

  it("says each step's state rather than leaving it in a colour", () => {
    render(<Stepper steps={steps} current={1} />)

    const items = screen.getAllByRole("listitem")

    expect(items[0]).toHaveTextContent("Account, finished")
    expect(items[1]).toHaveTextContent("Workspace, in progress")
    expect(items[2]).toHaveTextContent("Done, not started")
    expect(items[1]).toHaveAttribute("aria-current", "step")
  })

  it("offers a way back only for finished steps, and only when asked", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    const { rerender } = render(<Stepper steps={steps} current={1} />)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()

    rerender(<Stepper steps={steps} current={1} onSelect={onSelect} />)

    const back = screen.getAllByRole("button")
    expect(back).toHaveLength(1)

    await user.click(back[0]!)
    expect(onSelect).toHaveBeenCalledWith(0, steps[0])
  })
})

describe("AvatarStack", () => {
  it("carries full names and says how many more there are", () => {
    render(
      <AvatarStack
        max={2}
        people={[
          { id: "1", name: "Ada Lovelace" },
          { id: "2", name: "Grace Hopper" },
          { id: "3", name: "Alan Turing" },
          { id: "4", name: "Radia Perlman" },
        ]}
      />
    )

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument()
    expect(screen.getByText("and 2 more")).toBeInTheDocument()
  })
})

describe("Timeline", () => {
  it("says the tone of every entry", () => {
    render(
      <Timeline
        entries={[
          { id: "1", title: "Opened", tone: "done" },
          { id: "2", title: "Review", tone: "active" },
          { id: "3", title: "Merge", tone: "todo" },
          { id: "4", title: "Deploy", tone: "problem" },
        ]}
      />
    )

    const items = screen.getAllByRole("listitem")
    expect(items[0]).toHaveTextContent("Finished")
    expect(items[1]).toHaveTextContent("Happening now")
    expect(items[2]).toHaveTextContent("Not started")
    expect(items[3]).toHaveTextContent("Went wrong")
  })
})
