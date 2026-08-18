import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CodeBlock } from "../registry/default/code-block/code-block"
import {
  DiffView,
  diffLines,
  toHunks,
} from "../registry/default/diff-view/diff-view"
import { ResponseActions } from "../registry/default/response-actions/response-actions"
import { TerminalOutput } from "../registry/default/terminal-output/terminal-output"

describe("diffLines", () => {
  it("reports nothing for identical sides", () => {
    const lines = diffLines("a\nb\nc", "a\nb\nc")

    expect(lines.every((line) => line.kind === "context")).toBe(true)
  })

  it("pairs a replaced line as one removal and one addition", () => {
    const lines = diffLines("a\nb\nc", "a\nB\nc")

    expect(lines.map((line) => line.kind)).toEqual([
      "context",
      "remove",
      "add",
      "context",
    ])
  })

  it("numbers each side independently across an insertion", () => {
    const lines = diffLines("a\nc", "a\nb\nc")
    const added = lines.find((line) => line.kind === "add")!
    const last = lines[lines.length - 1]!

    expect(added.beforeNumber).toBeUndefined()
    expect(added.afterNumber).toBe(2)
    expect([last.beforeNumber, last.afterNumber]).toEqual([2, 3])
  })

  it("handles a side that is empty", () => {
    expect(diffLines("", "a\nb").map((line) => line.kind)).toEqual([
      "add",
      "add",
    ])
    expect(diffLines("a\nb", "").map((line) => line.kind)).toEqual([
      "remove",
      "remove",
    ])
  })

  it("finds the one changed line in a long file", () => {
    const before = Array.from({ length: 400 }, (_, i) => `line ${i}`)
    const after = [...before]
    after[200] = "changed"

    const changed = diffLines(before.join("\n"), after.join("\n")).filter(
      (line) => line.kind !== "context"
    )

    expect(changed.map((line) => line.text)).toEqual(["line 200", "changed"])
  })
})

describe("toHunks", () => {
  it("drops unchanged runs far from any change", () => {
    const before = Array.from({ length: 60 }, (_, i) => `line ${i}`)
    const after = [...before]
    after[30] = "changed"

    const hunks = toHunks(diffLines(before.join("\n"), after.join("\n")), 2)

    expect(hunks).toHaveLength(1)
    expect(hunks[0]!.lines).toHaveLength(6)
  })

  it("returns nothing when the sides match", () => {
    expect(toHunks(diffLines("a\nb", "a\nb"), 3)).toEqual([])
  })

  it("merges two changes that share context", () => {
    const before = "a\nb\nc\nd\ne"
    const after = "A\nb\nc\nd\nE"

    expect(toHunks(diffLines(before, after), 3)).toHaveLength(1)
    expect(toHunks(diffLines(before, after), 1)).toHaveLength(2)
  })
})

describe("DiffView", () => {
  it("counts what changed", () => {
    render(<DiffView before={"a\nb"} after={"a\nB\nc"} />)

    expect(screen.getByText("+2")).toBeInTheDocument()
    expect(screen.getByText("-1")).toBeInTheDocument()
  })

  it("says so when nothing changed", () => {
    render(<DiffView before="a" after="a" />)

    expect(screen.getByText("No changes.")).toBeInTheDocument()
  })

  it("offers a decision only when asked to", async () => {
    const user = userEvent.setup()
    const onAccept = vi.fn()

    const { rerender } = render(<DiffView before="a" after="b" />)
    expect(screen.queryByRole("button", { name: "Accept" })).toBeNull()

    rerender(<DiffView before="a" after="b" onAccept={onAccept} />)
    await user.click(screen.getByRole("button", { name: "Accept" }))

    expect(onAccept).toHaveBeenCalledOnce()
  })

  it("replaces the controls with the outcome once decided", () => {
    render(
      <DiffView before="a" after="b" status="accepted" onAccept={vi.fn()} />
    )

    expect(screen.getByRole("status")).toHaveTextContent("Change accepted.")
    expect(screen.queryByRole("button", { name: "Accept" })).toBeNull()
  })

  it("describes itself in the caption rather than by colour alone", () => {
    render(<DiffView filename="total.ts" before="a" after="b" />)

    expect(screen.getByRole("table").textContent).toContain("total.ts")
  })

  it("puts a removal beside the addition that replaced it", () => {
    render(<DiffView before={"a\nb"} after={"a\nB"} view="split" />)

    const row = screen
      .getAllByRole("row")
      .find((candidate) => within(candidate).queryByText("b"))!

    expect(within(row).getByText("B")).toBeInTheDocument()
  })

  it("prefers hunks it is given over diffing the sides", () => {
    render(
      <DiffView
        before="ignored"
        after="ignored too"
        hunks={[{ lines: [{ kind: "add", text: "supplied", afterNumber: 1 }] }]}
      />
    )

    expect(screen.getByText("supplied")).toBeInTheDocument()
    expect(screen.getByText("+1")).toBeInTheDocument()
  })
})

describe("CodeBlock", () => {
  const code = "one\ntwo\nthree\nfour"

  it("copies the whole source, not the visible part", async () => {
    const user = userEvent.setup()

    render(<CodeBlock code={code} maxLines={2} />)

    await user.click(screen.getByRole("button", { name: "Copy code" }))

    expect(await navigator.clipboard.readText()).toBe(code)
  })

  it("hides the tail until asked, then shows it", async () => {
    const user = userEvent.setup()

    render(<CodeBlock code={code} maxLines={2} />)

    expect(screen.queryByText("four")).toBeNull()

    await user.click(screen.getByRole("button", { name: "Show 2 more lines" }))
    expect(screen.getByText("four")).toBeInTheDocument()
  })

  it("marks the lines it was told to", () => {
    const { container } = render(<CodeBlock code={code} highlightLines={[2]} />)

    const marked = container.querySelectorAll("[data-highlighted]")

    expect(marked).toHaveLength(1)
    expect(marked[0]).toHaveTextContent("two")
  })

  it("lets the control override the wrap prop", async () => {
    const user = userEvent.setup()

    render(<CodeBlock code={code} wrappable />)

    const toggle = screen.getByRole("button", { name: "Wrap long lines" })
    expect(toggle).toHaveAttribute("aria-pressed", "false")

    await user.click(toggle)
    expect(toggle).toHaveAttribute("aria-pressed", "true")
  })

  it("leaves the copy control out when it is not wanted", () => {
    render(<CodeBlock code={code} copyable={false} />)

    expect(screen.queryByRole("button", { name: "Copy code" })).toBeNull()
  })
})

describe("TerminalOutput", () => {
  it("splits a plain string into lines", () => {
    render(<TerminalOutput output={"first\nsecond\n"} />)

    expect(screen.getByText("first")).toBeInTheDocument()
    expect(screen.getByText("second")).toBeInTheDocument()
  })

  it("strips ANSI escapes rather than printing them", () => {
    render(<TerminalOutput output={"\u001B[31mred\u001B[0m"} />)

    expect(screen.getByText("red")).toBeInTheDocument()
  })

  it("marks stderr apart from stdout", () => {
    const { container } = render(
      <TerminalOutput
        output={[{ text: "fine" }, { text: "broken", stream: "stderr" }]}
      />
    )

    expect(container.querySelector('[data-stream="stderr"]')).toHaveTextContent(
      "broken"
    )
  })

  it("marks the log busy while the command runs", () => {
    const { rerender } = render(<TerminalOutput output="x" running />)

    expect(screen.getByRole("log")).toHaveAttribute("aria-busy", "true")
    expect(screen.queryByText(/^exit/)).toBeNull()

    rerender(<TerminalOutput output="x" exitCode={0} />)
    expect(screen.getByText("exit 0")).toBeInTheDocument()
  })

  it("flags a non-zero exit", () => {
    const { container } = render(<TerminalOutput output="x" exitCode={2} />)

    expect(
      container.querySelector('[data-slot="terminal-output-status"]')
    ).toHaveAttribute("data-failed", "true")
  })
})

describe("ResponseActions", () => {
  it("shows only the controls it was configured for", () => {
    render(<ResponseActions copyText="hello" />)

    expect(
      screen.getByRole("button", { name: "Copy response" })
    ).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Good response" })).toBeNull()
  })

  it("copies the answer", async () => {
    const user = userEvent.setup()

    render(<ResponseActions copyText="the answer" />)

    await user.click(screen.getByRole("button", { name: "Copy response" }))

    expect(await navigator.clipboard.readText()).toBe("the answer")
  })

  it("clears a rating when it is chosen twice", async () => {
    const user = userEvent.setup()
    const onFeedbackChange = vi.fn()

    render(<ResponseActions onFeedbackChange={onFeedbackChange} />)

    const up = screen.getByRole("button", { name: "Good response" })

    await user.click(up)
    expect(onFeedbackChange).toHaveBeenLastCalledWith("up")
    expect(up).toHaveAttribute("aria-pressed", "true")

    await user.click(up)
    expect(onFeedbackChange).toHaveBeenLastCalledWith(null)
    expect(up).toHaveAttribute("aria-pressed", "false")
  })

  it("swaps one rating for the other", async () => {
    const user = userEvent.setup()

    render(<ResponseActions defaultFeedback="up" onFeedbackChange={vi.fn()} />)

    await user.click(screen.getByRole("button", { name: "Bad response" }))

    expect(
      screen.getByRole("button", { name: "Good response" })
    ).toHaveAttribute("aria-pressed", "false")
    expect(
      screen.getByRole("button", { name: "Bad response" })
    ).toHaveAttribute("aria-pressed", "true")
  })

  it("stays controlled when feedback is supplied", async () => {
    const user = userEvent.setup()
    const onFeedbackChange = vi.fn()

    render(
      <ResponseActions feedback={null} onFeedbackChange={onFeedbackChange} />
    )

    await user.click(screen.getByRole("button", { name: "Good response" }))

    expect(onFeedbackChange).toHaveBeenCalledWith("up")
    expect(
      screen.getByRole("button", { name: "Good response" })
    ).toHaveAttribute("aria-pressed", "false")
  })
})
