import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  Combobox,
  type ComboboxOption,
} from "../registry/default/combobox/combobox"

const languages: ComboboxOption[] = [
  { value: "rust", label: "Rust" },
  { value: "typescript", label: "TypeScript" },
  { value: "go", label: "Go" },
  { value: "python", label: "Python", disabled: true },
]

function field() {
  return screen.getByRole("combobox", { name: "Languages" })
}

describe("Combobox", () => {
  it("opens the list when the field is clicked", async () => {
    const user = userEvent.setup()
    render(<Combobox label="Languages" options={languages} />)

    expect(screen.queryByRole("listbox")).toBeNull()

    await user.click(field())

    expect(screen.getByRole("listbox")).toBeInTheDocument()
    expect(field()).toHaveAttribute("aria-expanded", "true")
  })

  it("narrows the list to what was typed", async () => {
    const user = userEvent.setup()
    render(<Combobox label="Languages" options={languages} />)

    await user.click(field())
    await user.keyboard("ty")

    expect(
      screen.getAllByRole("option").map((option) => option.textContent)
    ).toEqual(["TypeScript"])
  })

  it("says so when nothing matches", async () => {
    const user = userEvent.setup()
    render(<Combobox label="Languages" options={languages} />)

    await user.click(field())
    await user.keyboard("cobol")

    expect(screen.queryAllByRole("option")).toHaveLength(0)
    expect(screen.getByText(/cobol/)).toBeInTheDocument()
  })

  it("reports a single choice as a string and closes", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        label="Languages"
        options={languages}
        onValueChange={(value: string) => onValueChange(value)}
      />
    )

    await user.click(field())
    await user.click(screen.getByRole("option", { name: "Go" }))

    expect(onValueChange).toHaveBeenCalledWith("go")
    expect(screen.queryByRole("listbox")).toBeNull()
    expect(field()).toHaveValue("Go")
  })

  it("reports multiple choices as an array and stays open", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        multiple
        label="Languages"
        options={languages}
        onValueChange={(value: string[]) => onValueChange(value)}
      />
    )

    await user.click(field())
    await user.click(screen.getByRole("option", { name: "Rust" }))
    await user.click(screen.getByRole("option", { name: "Go" }))

    expect(onValueChange).toHaveBeenLastCalledWith(["rust", "go"])
    expect(screen.getByRole("listbox")).toBeInTheDocument()
  })

  it("takes a choice back when it is picked again", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        multiple
        label="Languages"
        options={languages}
        defaultValue={["rust"]}
        onValueChange={onValueChange}
      />
    )

    await user.click(field())
    await user.click(screen.getByRole("option", { name: "Rust" }))

    expect(onValueChange).toHaveBeenLastCalledWith([])
  })

  it("gives each selection a chip that removes itself", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        multiple
        label="Languages"
        options={languages}
        defaultValue={["rust", "go"]}
        onValueChange={onValueChange}
      />
    )

    await user.click(screen.getByRole("button", { name: "Remove Rust" }))

    expect(onValueChange).toHaveBeenCalledWith(["go"])
  })

  it("gives the last chip back on backspace in an empty field", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        multiple
        label="Languages"
        options={languages}
        defaultValue={["rust", "go"]}
        onValueChange={onValueChange}
      />
    )

    await user.click(field())
    await user.keyboard("{Backspace}")

    expect(onValueChange).toHaveBeenCalledWith(["rust"])
  })

  it("keeps backspace ordinary while there is something typed", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        multiple
        label="Languages"
        options={languages}
        defaultValue={["rust"]}
        onValueChange={onValueChange}
      />
    )

    await user.click(field())
    await user.keyboard("go{Backspace}")

    expect(onValueChange).not.toHaveBeenCalled()
    expect(field()).toHaveValue("g")
  })

  it("steps past a disabled option rather than stopping on it", async () => {
    const user = userEvent.setup()
    render(<Combobox label="Languages" options={languages} />)

    await user.click(field())
    const python = screen.getByRole("option", { name: "Python" })

    for (let press = 0; press < languages.length + 1; press += 1) {
      expect(field()).not.toHaveAttribute("aria-activedescendant", python.id)
      await user.keyboard("{ArrowDown}")
    }
  })

  it("chooses the active option on Enter", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        label="Languages"
        options={languages}
        onValueChange={onValueChange}
      />
    )

    await user.click(field())
    await user.keyboard("{ArrowDown}{Enter}")

    expect(onValueChange).toHaveBeenCalledWith("typescript")
  })

  it("closes on Escape, then clears what was typed", async () => {
    const user = userEvent.setup()
    render(<Combobox multiple label="Languages" options={languages} />)

    await user.click(field())
    await user.keyboard("ty")

    await user.keyboard("{Escape}")
    expect(screen.queryByRole("listbox")).toBeNull()
    expect(field()).toHaveValue("ty")

    await user.keyboard("{Escape}")
    expect(field()).toHaveValue("")
  })

  it("puts the chosen label back when closed without choosing", async () => {
    const user = userEvent.setup()
    render(
      <Combobox label="Languages" options={languages} defaultValue="rust" />
    )

    expect(field()).toHaveValue("Rust")

    await user.click(field())
    await user.keyboard("ty")
    await user.keyboard("{Escape}")

    expect(field()).toHaveValue("Rust")
  })

  it("shows every option again once a choice is made", async () => {
    const user = userEvent.setup()
    render(
      <Combobox label="Languages" options={languages} defaultValue="rust" />
    )

    await user.click(field())

    expect(screen.getAllByRole("option")).toHaveLength(languages.length)
  })

  it("leaves the value alone when it is controlled", async () => {
    const user = userEvent.setup()
    render(
      <Combobox
        multiple
        label="Languages"
        options={languages}
        value={["rust"]}
        onValueChange={vi.fn()}
      />
    )

    await user.click(field())
    await user.click(screen.getByRole("option", { name: "Go" }))

    expect(screen.getByRole("button", { name: "Remove Rust" })).toBeVisible()
    expect(screen.queryByRole("button", { name: "Remove Go" })).toBeNull()
  })

  it("marks the list as multi-selectable only when it is", async () => {
    const user = userEvent.setup()
    const { unmount } = render(
      <Combobox multiple label="Languages" options={languages} />
    )

    await user.click(field())
    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-multiselectable",
      "true"
    )

    unmount()
    render(<Combobox label="Languages" options={languages} />)

    await user.click(field())
    expect(screen.getByRole("listbox")).not.toHaveAttribute(
      "aria-multiselectable"
    )
  })

  it("closes when something outside it is pressed", async () => {
    const user = userEvent.setup()
    render(
      <div>
        <Combobox label="Languages" options={languages} />
        <button type="button">Elsewhere</button>
      </div>
    )

    await user.click(field())
    expect(screen.getByRole("listbox")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Elsewhere" }))
    expect(screen.queryByRole("listbox")).toBeNull()
  })
})

const labels: ComboboxOption[] = [
  { value: "bug", label: "Bug", group: "Kind" },
  { value: "chore", label: "Chore", group: "Kind" },
  { value: "p0", label: "P0", group: "Priority" },
  { value: "docs", label: "Docs" },
]

function labelField() {
  return screen.getByRole("combobox", { name: "Labels" })
}

describe("Combobox groups", () => {
  it("gathers options under the heading they name", async () => {
    const user = userEvent.setup()
    render(<Combobox multiple label="Labels" options={labels} />)

    await user.click(labelField())

    const kind = screen.getByRole("group", { name: "Kind" })
    expect(
      within(kind)
        .getAllByRole("option")
        .map((option) => option.textContent)
    ).toEqual(["Bug", "Chore"])
  })

  it("leaves an option with no group out of every group", async () => {
    const user = userEvent.setup()
    render(<Combobox multiple label="Labels" options={labels} />)

    await user.click(labelField())

    expect(
      screen.getByRole("option", { name: "Docs" }).closest("[role=group]")
    ).toBeNull()
  })

  it("drops a heading once nothing under it matches", async () => {
    const user = userEvent.setup()
    render(<Combobox multiple label="Labels" options={labels} />)

    await user.click(labelField())
    await user.keyboard("p0")

    expect(screen.queryByRole("group", { name: "Kind" })).toBeNull()
    expect(screen.getByRole("group", { name: "Priority" })).toBeInTheDocument()
  })
})

describe("Combobox max", () => {
  it("refuses anything more once the cap is reached", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        multiple
        max={2}
        label="Labels"
        options={labels}
        defaultValue={["bug", "chore"]}
        onValueChange={onValueChange}
      />
    )

    await user.click(labelField())
    const p0 = screen.getByRole("option", { name: "P0" })
    expect(p0).toHaveAttribute("aria-disabled", "true")

    await user.click(p0)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("still lets go of something at the cap", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        multiple
        max={2}
        label="Labels"
        options={labels}
        defaultValue={["bug", "chore"]}
        onValueChange={onValueChange}
      />
    )

    await user.click(labelField())
    await user.click(screen.getByRole("option", { name: "Bug" }))

    expect(onValueChange).toHaveBeenCalledWith(["chore"])
  })
})

describe("Combobox announcements", () => {
  it("says what was added", async () => {
    const user = userEvent.setup()
    render(<Combobox multiple label="Labels" options={labels} />)

    await user.click(labelField())
    await user.click(screen.getByRole("option", { name: "Bug" }))

    expect(screen.getByRole("status")).toHaveTextContent("Bug added")
  })

  it("says what was removed", async () => {
    const user = userEvent.setup()
    render(
      <Combobox
        multiple
        label="Labels"
        options={labels}
        defaultValue={["bug"]}
      />
    )

    await user.click(screen.getByRole("button", { name: "Remove Bug" }))

    expect(screen.getByRole("status")).toHaveTextContent("Bug removed")
  })

  it("says when the cap has been reached", async () => {
    const user = userEvent.setup()
    render(
      <Combobox
        multiple
        max={2}
        label="Labels"
        options={labels}
        defaultValue={["bug"]}
      />
    )

    await user.click(labelField())
    await user.click(screen.getByRole("option", { name: "Chore" }))

    expect(screen.getByRole("status")).toHaveTextContent(
      "That is the most you can choose"
    )
  })
})

describe("Combobox with results from elsewhere", () => {
  it("reports what was typed", async () => {
    const user = userEvent.setup()
    const onQueryChange = vi.fn()
    render(
      <Combobox
        label="Languages"
        options={languages}
        onQueryChange={onQueryChange}
      />
    )

    await user.click(field())
    await user.keyboard("ty")

    expect(onQueryChange).toHaveBeenLastCalledWith("ty")
  })

  it("leaves results alone when they arrive already matched", async () => {
    const user = userEvent.setup()
    render(<Combobox filter={false} label="Languages" options={languages} />)

    await user.click(field())
    await user.keyboard("zzz")

    expect(screen.getAllByRole("option")).toHaveLength(languages.length)
  })

  it("takes a ranker of its own", async () => {
    const user = userEvent.setup()
    render(
      <Combobox
        label="Languages"
        options={languages}
        rank={(option) => (option.value === "go" ? 0 : false)}
      />
    )

    await user.click(field())
    await user.keyboard("rust")

    expect(
      screen.getAllByRole("option").map((option) => option.textContent)
    ).toEqual(["Go"])
  })

  it("says results are on their way", async () => {
    const user = userEvent.setup()
    render(<Combobox loading label="Languages" options={[]} />)

    await user.click(field())

    expect(screen.getByText("Searching…")).toBeInTheDocument()
    expect(screen.queryByText("No options.")).toBeNull()
  })

  it("marks the list busy while they are", async () => {
    const user = userEvent.setup()
    render(<Combobox loading label="Languages" options={[]} />)

    await user.click(field())

    expect(screen.getByRole("listbox")).toHaveAttribute("aria-busy", "true")
  })
})

describe("Combobox creating", () => {
  it("offers to create what the list does not have", async () => {
    const user = userEvent.setup()
    render(
      <Combobox multiple label="Labels" options={labels} onCreate={vi.fn()} />
    )

    await user.click(labelField())
    await user.keyboard("infra")

    expect(screen.getByRole("option", { name: /Create/ })).toHaveTextContent(
      "infra"
    )
  })

  it("offers nothing to create without somewhere to put it", async () => {
    const user = userEvent.setup()
    render(<Combobox multiple label="Labels" options={labels} />)

    await user.click(labelField())
    await user.keyboard("infra")

    expect(screen.queryByRole("option", { name: /Create/ })).toBeNull()
  })

  it("does not offer to create one the list already has", async () => {
    const user = userEvent.setup()
    render(
      <Combobox multiple label="Labels" options={labels} onCreate={vi.fn()} />
    )

    await user.click(labelField())
    await user.keyboard("bug")

    expect(screen.queryByRole("option", { name: /Create/ })).toBeNull()
  })

  it("creates on Enter and clears the field", async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    render(
      <Combobox multiple label="Labels" options={labels} onCreate={onCreate} />
    )

    await user.click(labelField())
    await user.keyboard("infra{Enter}")

    expect(onCreate).toHaveBeenCalledWith("infra")
    expect(labelField()).toHaveValue("")
  })

  it("says what it created", async () => {
    const user = userEvent.setup()
    render(
      <Combobox multiple label="Labels" options={labels} onCreate={vi.fn()} />
    )

    await user.click(labelField())
    await user.keyboard("infra{Enter}")

    expect(screen.getByRole("status")).toHaveTextContent("infra created")
  })

  it("offers nothing to create once the cap is reached", async () => {
    const user = userEvent.setup()
    render(
      <Combobox
        multiple
        max={1}
        label="Labels"
        options={labels}
        defaultValue={["bug"]}
        onCreate={vi.fn()}
      />
    )

    await user.click(labelField())
    await user.keyboard("infra")

    expect(screen.queryByRole("option", { name: /Create/ })).toBeNull()
  })
})
