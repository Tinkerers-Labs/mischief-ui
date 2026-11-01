import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  parseSlashCommand,
  SlashMenu,
  type SlashCommand,
} from "../registry/default/slash-menu/slash-menu"

const commands: SlashCommand[] = [
  {
    name: "translate",
    description: "Translate text",
    args: ["language", "text"],
  },
  { name: "summarize", args: ["length"] },
  { name: "clear", description: "Start over" },
]

function Field(props: { onKeyDown?: () => void }) {
  const [value, setValue] = React.useState("")
  return (
    <SlashMenu
      commands={commands}
      onKeyDown={props.onKeyDown}
      onValueChange={setValue}
      value={value}
    />
  )
}

const field = () => screen.getByRole("combobox", { name: "Message" })
const options = () =>
  screen.getAllByRole("option").map((option) => option.textContent)

describe("SlashMenu", () => {
  it("opens on a slash at the start of a word and filters as you type", async () => {
    const user = userEvent.setup()
    render(<Field />)

    expect(field()).toHaveAttribute("aria-expanded", "false")

    await user.type(field(), "/")
    expect(field()).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("listbox", { name: "Commands" })).toBeVisible()
    expect(options()).toHaveLength(3)

    await user.type(field(), "su")
    expect(options()).toEqual(["/summarize <length>"])
  })

  it("does not open for a slash inside a word", async () => {
    const user = userEvent.setup()
    render(<Field />)

    await user.type(field(), "and/or")

    expect(field()).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("listbox")).toBeNull()
  })

  it("moves the active option with the arrow keys", async () => {
    const user = userEvent.setup()
    render(<Field />)

    await user.type(field(), "/")
    const [first, second, third] = screen.getAllByRole("option")
    expect(field()).toHaveAttribute("aria-activedescendant", first!.id)
    expect(first).toHaveAttribute("aria-selected", "true")

    await user.keyboard("{ArrowDown}")
    expect(field()).toHaveAttribute("aria-activedescendant", second!.id)

    await user.keyboard("{ArrowUp}{ArrowUp}")
    expect(field()).toHaveAttribute("aria-activedescendant", third!.id)
  })

  it("picks on Enter without passing the key to the host", async () => {
    const user = userEvent.setup()
    const onKeyDown = vi.fn()
    render(<Field onKeyDown={onKeyDown} />)

    await user.type(field(), "Please /tr")
    onKeyDown.mockClear()
    await user.keyboard("{Enter}")

    expect(field()).toHaveValue("Please /translate ")
    expect(onKeyDown).not.toHaveBeenCalled()
    expect(field()).toHaveAttribute("aria-expanded", "false")

    await user.keyboard("{Enter}")
    expect(onKeyDown).toHaveBeenCalledTimes(1)
  })

  it("picks on Tab and puts the caret after the command", async () => {
    const user = userEvent.setup()
    render(<Field />)

    await user.type(field(), "/cl")
    await user.keyboard("{Tab}")

    expect(field()).toHaveValue("/clear ")
    expect(field()).toHaveFocus()
    expect((field() as HTMLTextAreaElement).selectionStart).toBe(7)
  })

  it("picks with the pointer", async () => {
    const user = userEvent.setup()
    const onCommandSelect = vi.fn()
    render(<SlashMenu commands={commands} onCommandSelect={onCommandSelect} />)

    await user.type(field(), "/")
    await user.click(screen.getByRole("option", { name: /summarize/ }))

    expect(field()).toHaveValue("/summarize ")
    expect(onCommandSelect).toHaveBeenCalledWith(commands[1])
  })

  it("closes on Escape until a new slash is typed", async () => {
    const user = userEvent.setup()
    render(<Field />)

    await user.type(field(), "/tra")
    await user.keyboard("{Escape}")
    expect(field()).toHaveAttribute("aria-expanded", "false")

    await user.type(field(), "n")
    expect(field()).toHaveAttribute("aria-expanded", "false")

    await user.type(field(), " /")
    expect(field()).toHaveAttribute("aria-expanded", "true")
  })

  it("opens on the side with room, unless a side is set", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Field />)
    const popup = () => document.querySelector("[data-slot='slash-menu-popup']")

    await user.type(field(), "/")
    expect(popup()).toHaveAttribute("data-side", "bottom")
    unmount()

    render(<SlashMenu commands={commands} side="top" />)
    await user.type(field(), "/")
    expect(popup()).toHaveAttribute("data-side", "top")
  })

  it("says so when nothing matches", async () => {
    const user = userEvent.setup()
    render(<Field />)

    await user.type(field(), "/zzz")

    expect(field()).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByText("No command matches /zzz")).toBeInTheDocument()
  })

  it("spells out the arguments and marks the one the caret is in", async () => {
    const user = userEvent.setup()
    render(<Field />)

    await user.type(field(), "/translate ")
    await user.keyboard("{Escape}")

    const hint = () => document.querySelector("[data-slot='slash-menu-hint']")
    const active = () => hint()?.querySelector("[data-active]")?.textContent

    expect(field()).toHaveAccessibleDescription(/translate <language> <text>/)
    expect(active()).toBe("<language>")

    await user.type(field(), "Spanish")
    expect(active()).toBe("<language>")

    await user.type(field(), " Where is the station")
    expect(active()).toBe("<text>")

    await user.keyboard("{Home}")
    expect(hint()).toBeNull()
  })
})

describe("parseSlashCommand", () => {
  it("splits arguments, giving the rest of the line to the last one", () => {
    expect(
      parseSlashCommand("/translate Spanish Where is it?", commands)
    ).toEqual({ command: commands[0], args: ["Spanish", "Where is it?"] })
  })

  it("returns null for text that is not a known command", () => {
    expect(parseSlashCommand("hello", commands)).toBeNull()
    expect(parseSlashCommand("/deploy now", commands)).toBeNull()
  })

  it("returns no arguments for a bare command", () => {
    expect(parseSlashCommand("/clear", commands)).toEqual({
      command: commands[2],
      args: [],
    })
  })
})
