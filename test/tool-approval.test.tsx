import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ToolApproval } from "../registry/default/tool-approval/tool-approval"

const wait = (ms: number) =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)))

describe("ToolApproval", () => {
  it("names the tool and lists its arguments", async () => {
    const user = userEvent.setup()

    render(
      <ToolApproval
        input={{ path: "src/index.ts", lines: 40 }}
        name="read_file"
        onDecision={vi.fn()}
      />
    )

    const card = screen.getByRole("group", { name: "Allow read_file to run?" })
    expect(card).toHaveAccessibleDescription("path src/index.ts lines 40")

    const raw = screen.getByRole("button", { name: "Raw input" })
    expect(raw).toHaveAttribute("aria-expanded", "false")
    await user.click(raw)
    expect(raw).toHaveAttribute("aria-expanded", "true")
    expect(card.querySelector("pre")).toHaveTextContent('"lines": 40')
  })

  it("settles into a resolved line and moves focus to it", async () => {
    const user = userEvent.setup()
    const onDecision = vi.fn()

    render(<ToolApproval name="read_file" onDecision={onDecision} />)
    await user.click(screen.getByRole("button", { name: "Always allow" }))

    expect(onDecision).toHaveBeenCalledWith("allow-always")
    const line = await screen.findByRole("status")
    expect(line).toHaveTextContent("Always allowed read_file")
    expect(line).toHaveFocus()
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("holds a pending state, and puts the choices back on a rejection", async () => {
    const user = userEvent.setup()
    let reject: (reason: unknown) => void = () => undefined
    const onDecision = vi.fn(
      () =>
        new Promise<void>((_, rejectWith) => {
          reject = rejectWith
        })
    )

    render(<ToolApproval name="send_email" onDecision={onDecision} />)
    await user.click(screen.getByRole("button", { name: "Deny" }))

    const deny = screen.getByRole("button", { name: "Deny" })
    expect(deny).toBeDisabled()
    expect(deny).toHaveAttribute("aria-busy", "true")
    expect(screen.getByRole("group")).toHaveAttribute("data-state", "pending")

    await act(async () => reject(new Error("offline")))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "did not go through"
    )
    expect(screen.getByRole("button", { name: "Deny" })).toBeEnabled()
  })

  it("shows a decision made earlier", () => {
    render(<ToolApproval decision="deny" name="rm" onDecision={vi.fn()} />)

    expect(screen.getByRole("status")).toHaveTextContent("Denied rm")
  })

  it("can leave out Always allow", () => {
    render(<ToolApproval allowAlways={false} name="rm" onDecision={vi.fn()} />)

    expect(screen.queryByRole("button", { name: "Always allow" })).toBeNull()
  })

  describe("when destructive", () => {
    it("ignores a plain press", async () => {
      const user = userEvent.setup()
      const onDecision = vi.fn()

      render(
        <ToolApproval
          destructive
          holdDuration={500}
          name="delete_branch"
          onDecision={onDecision}
        />
      )
      await user.click(screen.getByRole("button", { name: "Allow once" }))
      await wait(600)

      expect(onDecision).not.toHaveBeenCalled()
    })

    it("allows after a full pointer hold, and cancels on an early release", async () => {
      const onDecision = vi.fn()

      render(
        <ToolApproval
          destructive
          holdDuration={500}
          name="delete_branch"
          onDecision={onDecision}
        />
      )
      const allow = screen.getByRole("button", { name: "Allow once" })
      expect(allow).toHaveAccessibleDescription(/Press and hold to allow/)

      fireEvent.pointerDown(allow, { button: 0, pointerId: 1 })
      await wait(150)
      expect(allow).toHaveAttribute("data-state", "holding")
      fireEvent.pointerUp(allow, { pointerId: 1 })
      await wait(500)
      expect(onDecision).not.toHaveBeenCalled()
      expect(allow).toHaveAttribute("data-state", "idle")

      fireEvent.pointerDown(allow, { button: 0, pointerId: 1 })
      await wait(650)
      expect(onDecision).toHaveBeenCalledWith("allow-once")
    })

    it("allows from the keyboard only while Enter is held", async () => {
      const onDecision = vi.fn()

      render(
        <ToolApproval
          destructive
          holdDuration={500}
          name="delete_branch"
          onDecision={onDecision}
        />
      )
      const allow = screen.getByRole("button", { name: "Always allow" })
      allow.focus()

      fireEvent.keyDown(allow, { key: "Enter" })
      fireEvent.keyUp(allow, { key: "Enter" })
      await wait(600)
      expect(onDecision).not.toHaveBeenCalled()

      fireEvent.keyDown(allow, { key: "Enter" })
      fireEvent.keyDown(allow, { key: "Enter", repeat: true })
      await wait(650)
      expect(onDecision).toHaveBeenCalledWith("allow-always")
    })

    it("confirms a direct activation in two steps", async () => {
      const onDecision = vi.fn()

      render(
        <ToolApproval
          destructive
          name="delete_branch"
          onDecision={onDecision}
        />
      )

      fireEvent.click(screen.getByRole("button", { name: "Allow once" }), {
        detail: 0,
      })
      expect(onDecision).not.toHaveBeenCalled()

      const confirm = screen.getByRole("button", {
        name: "Press again to allow",
      })
      fireEvent.click(confirm, { detail: 0 })

      expect(onDecision).toHaveBeenCalledWith("allow-once")
    })

    it("lets Deny through with one press", async () => {
      const user = userEvent.setup()
      const onDecision = vi.fn()

      render(
        <ToolApproval
          destructive
          name="delete_branch"
          onDecision={onDecision}
        />
      )
      await user.click(screen.getByRole("button", { name: "Deny" }))

      expect(onDecision).toHaveBeenCalledWith("deny")
    })
  })

  it("keeps the spinner still under reduced motion", async () => {
    const user = userEvent.setup()

    render(
      <ToolApproval name="read_file" onDecision={() => new Promise(() => {})} />
    )
    await user.click(screen.getByRole("button", { name: "Allow once" }))

    const spinner = screen
      .getByRole("button", { name: "Allow once" })
      .querySelector("svg")
    expect(spinner).toHaveClass("motion-reduce:animate-none")
  })
})
