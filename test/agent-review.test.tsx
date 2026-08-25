import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { MemoryChips } from "../registry/default/memory-chips/memory-chips"
import { ReviewableDiff } from "../registry/default/reviewable-diff/reviewable-diff"
import { StoppedRun } from "../registry/default/stopped-run/stopped-run"
import { SubagentTree } from "../registry/default/subagent-tree/subagent-tree"

const before = ["one", "two", "three", "four", "five", "six", "seven"].join(
  "\n"
)
const after = ["one", "TWO", "three", "four", "five", "six", "SEVEN"].join("\n")

describe("ReviewableDiff", () => {
  it("stages every hunk to begin with", () => {
    render(<ReviewableDiff before={before} after={after} context={0} />)

    const boxes = screen.getAllByRole("checkbox")
    expect(boxes.length).toBeGreaterThan(1)
    for (const box of boxes) expect(box).toBeChecked()
  })

  it("applies only what is staged", async () => {
    const onApply = vi.fn()
    const user = userEvent.setup()

    render(
      <ReviewableDiff
        before={before}
        after={after}
        context={0}
        onApply={onApply}
      />
    )

    const boxes = screen.getAllByRole("checkbox")
    await user.click(boxes[0]!)
    await user.click(screen.getByRole("button", { name: "Apply staged" }))

    expect(onApply).toHaveBeenCalledTimes(1)
    expect(onApply.mock.calls[0]![0]).toHaveLength(boxes.length - 1)
  })

  it("counts what is staged out loud", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <ReviewableDiff before={before} after={after} context={0} />
    )

    const live = container.querySelector("[aria-live]")!
    expect(live).toHaveTextContent("2 of 2 hunks staged")

    await user.click(screen.getAllByRole("checkbox")[0]!)
    expect(live).toHaveTextContent("1 of 2 hunks staged")
  })

  it("will not apply nothing", async () => {
    const user = userEvent.setup()
    render(<ReviewableDiff before={before} after={after} context={0} />)

    await user.click(screen.getByRole("button", { name: "Stage none" }))
    expect(screen.getByRole("button", { name: "Apply staged" })).toBeDisabled()
  })

  it("names each box after what ticking it does", () => {
    render(<ReviewableDiff before={before} after={after} context={0} />)

    // Left to the label, the parts join up as "Stage@@ -2 +1 @@".
    const boxes = screen.getAllByRole("checkbox", {
      name: /^Stage @@ .+ @@, \d+ added, \d+ removed$/,
    })

    expect(boxes).toHaveLength(2)
  })

  it("says so when there is nothing to review", () => {
    render(<ReviewableDiff before={before} after={before} />)

    expect(screen.getByText("No changes.")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Apply staged" })).toBeNull()
  })

  it("starts fresh when the diff underneath it changes", async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <ReviewableDiff before={before} after={after} context={0} />
    )

    await user.click(screen.getAllByRole("checkbox")[0]!)

    // Those indexes belonged to the old hunks and mean nothing here.
    const other = ["one", "two", "three"].join("\n")
    rerender(
      <ReviewableDiff before={other} after={"ONE\ntwo\nthree"} context={0} />
    )

    const boxes = screen.getAllByRole("checkbox")
    expect(boxes).toHaveLength(1)
    expect(boxes[0]).toBeChecked()
  })

  it("keeps an unstaged hunk on the page", async () => {
    const user = userEvent.setup()
    render(<ReviewableDiff before={before} after={after} context={0} />)

    await user.click(screen.getByRole("button", { name: "Stage none" }))

    // Dimmed, not removed: a hunk that vanishes is harder to reason about.
    expect(screen.getAllByRole("checkbox")).toHaveLength(2)
    expect(screen.getByText("SEVEN")).toBeInTheDocument()
  })
})

describe("SubagentTree", () => {
  const runs = [
    {
      id: "root",
      label: "Split the work",
      status: "done" as const,
      children: [
        { id: "a", label: "Find the call sites", status: "done" as const },
        { id: "b", label: "Rewrite them", status: "running" as const },
        { id: "c", label: "Check the types", status: "failed" as const },
      ],
    },
  ]

  it("nests with lists rather than a tree widget", () => {
    render(<SubagentTree runs={runs} />)

    expect(screen.queryByRole("tree")).not.toBeInTheDocument()
    expect(screen.getAllByRole("list").length).toBeGreaterThan(1)
  })

  it("says each status rather than only colouring it", () => {
    render(<SubagentTree runs={runs} />)

    const item = screen.getByText("Check the types").closest("li")!
    expect(within(item).getByText(", failed")).toBeInTheDocument()
  })

  it("summarises the fleet once, not once per agent", () => {
    const { container } = render(<SubagentTree runs={runs} />)

    expect(container.querySelectorAll("[aria-live]")).toHaveLength(1)
    expect(container.querySelector("[aria-live]")).toHaveTextContent(
      "1 of 4 agents running"
    )
  })
})

describe("StoppedRun", () => {
  it("keeps what was written and marks it incomplete", () => {
    render(
      <StoppedRun reason="stopped">
        <p>The retry helper backs off between</p>
      </StoppedRun>
    )

    const partial = screen.getByRole("group", { name: "Incomplete answer" })
    expect(partial).toHaveTextContent("The retry helper backs off between")
  })

  it("says why it ended, differently for each reason", () => {
    const { rerender, container } = render(<StoppedRun reason="stopped" />)
    expect(container.querySelector("[aria-live]")).toHaveTextContent(
      "You stopped this answer."
    )

    rerender(<StoppedRun reason="timeout" />)
    expect(container.querySelector("[aria-live]")).toHaveTextContent(
      "took too long"
    )
  })

  it("offers carrying on only when it was given a way to", () => {
    const { rerender } = render(<StoppedRun onRetry={() => {}} />)
    expect(
      screen.queryByRole("button", { name: "Carry on" })
    ).not.toBeInTheDocument()

    rerender(<StoppedRun onRetry={() => {}} onResume={() => {}} />)
    expect(screen.getByRole("button", { name: "Carry on" })).toBeInTheDocument()
  })
})

describe("MemoryChips", () => {
  const memories = [
    { id: "1", text: "Prefers pnpm" },
    { id: "2", text: "Timezone is IST" },
  ]

  it("names what each remove button will remove", () => {
    render(<MemoryChips memories={memories} onForget={() => {}} />)

    expect(
      screen.getByRole("button", { name: "Forget: Prefers pnpm" })
    ).toBeInTheDocument()
  })

  it("announces a removal, since the chip it came from is gone", async () => {
    const onForget = vi.fn()
    const user = userEvent.setup()
    const { container } = render(
      <MemoryChips memories={memories} onForget={onForget} />
    )

    await user.click(
      screen.getByRole("button", { name: "Forget: Prefers pnpm" })
    )

    expect(onForget).toHaveBeenCalledWith("1")
    expect(container.querySelector("[aria-live]")).toHaveTextContent(
      "Forgotten: Prefers pnpm"
    )
  })

  it("withholds forget all unless it was given one", () => {
    const { rerender } = render(<MemoryChips memories={memories} />)
    expect(screen.queryByText(/Forget all/)).not.toBeInTheDocument()

    rerender(<MemoryChips memories={memories} onForgetAll={() => {}} />)
    expect(screen.getByText("Forget all 2")).toBeInTheDocument()
  })

  it("says so when there is nothing stored", () => {
    render(<MemoryChips memories={[]} />)

    expect(
      screen.getByText("Nothing is being remembered about you.")
    ).toBeInTheDocument()
  })
})
