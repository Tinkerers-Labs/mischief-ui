import {
  act,
  createEvent,
  fireEvent,
  render,
  screen,
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  SwipeActions,
  SwipeActionsItem,
  type SwipeAction,
} from "../registry/default/swipe-actions/swipe-actions"

function setup(handlers: {
  read?: () => void
  archive?: () => void
  remove?: () => void
}) {
  const leading: SwipeAction[] = [
    { label: "Read", onSelect: handlers.read ?? vi.fn(), tone: "primary" },
  ]
  const trailing: SwipeAction[] = [
    {
      label: "Delete",
      onSelect: handlers.remove ?? vi.fn(),
      tone: "destructive",
    },
    { label: "Archive", onSelect: handlers.archive ?? vi.fn() },
  ]

  return render(
    <SwipeActions label="Inbox">
      <SwipeActionsItem
        label="Lease renewal"
        leading={leading}
        trailing={trailing}
      >
        <a href="#lease">Lease renewal</a>
      </SwipeActionsItem>
      <SwipeActionsItem label="Photos" trailing={trailing}>
        <a href="#photos">Photos</a>
      </SwipeActionsItem>
    </SwipeActions>
  )
}

function rows(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>("[data-slot='swipe-actions-item']")
  )
}

function swipe(row: HTMLElement, distance: number, width = 300) {
  const content = row.querySelector<HTMLElement>(
    "[data-slot='swipe-actions-content']"
  )!
  Object.defineProperty(content, "offsetWidth", {
    configurable: true,
    value: width,
  })
  fireEvent.pointerDown(content, {
    button: 0,
    pointerId: 1,
    pointerType: "touch",
    clientX: 200,
    clientY: 10,
  })
  const steps = 4
  for (let step = 1; step <= steps; step += 1) {
    const move = createEvent.pointerMove(content, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 200 + (distance * step) / steps,
      clientY: 10,
    })
    Object.defineProperty(move, "timeStamp", { value: step * 100 })
    fireEvent(content, move)
  }
  fireEvent.pointerUp(content, { pointerId: 1, pointerType: "touch" })
}

afterEach(() => vi.useRealTimers())

describe("SwipeActions", () => {
  it("is a named list of rows, each with a named More actions button", () => {
    setup({})

    expect(screen.getByRole("list", { name: "Inbox" })).toBeInTheDocument()
    expect(screen.getAllByRole("listitem")).toHaveLength(2)
    expect(
      screen.getByRole("button", { name: "More actions for Lease renewal" })
    ).toHaveAttribute("aria-haspopup", "menu")
  })

  it("keeps revealed actions out of reach until the row is open", () => {
    const { container } = setup({})

    expect(screen.queryByRole("button", { name: "Archive" })).toBeNull()

    swipe(rows(container)[0]!, -120)

    expect(rows(container)[0]).toHaveAttribute("data-state", "open")
    expect(rows(container)[0]).toHaveAttribute("data-side", "trailing")
    expect(screen.getByRole("button", { name: "Archive" })).toHaveAttribute(
      "tabindex",
      "0"
    )
  })

  it("runs a revealed action and closes the row", async () => {
    const user = userEvent.setup()
    const archive = vi.fn()
    const { container } = setup({ archive })

    swipe(rows(container)[0]!, -120)
    await user.click(screen.getByRole("button", { name: "Archive" }))

    expect(archive).toHaveBeenCalledTimes(1)
    expect(rows(container)[0]).toHaveAttribute("data-state", "closed")
  })

  it("springs back from a short swipe", () => {
    const { container } = setup({})

    swipe(rows(container)[0]!, -30)

    expect(rows(container)[0]).toHaveAttribute("data-state", "closed")
  })

  it("keeps only one row open", () => {
    const { container } = setup({})

    swipe(rows(container)[0]!, 60)
    expect(rows(container)[0]).toHaveAttribute("data-side", "leading")

    swipe(rows(container)[1]!, -120)
    expect(rows(container)[0]).toHaveAttribute("data-state", "closed")
    expect(rows(container)[1]).toHaveAttribute("data-state", "open")
  })

  it("runs the edge action on a full swipe", () => {
    vi.useFakeTimers()
    const remove = vi.fn()
    const { container } = setup({ remove })

    swipe(rows(container)[0]!, -260)
    expect(rows(container)[0]).toHaveAttribute("data-state", "committing")

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(remove).toHaveBeenCalledTimes(1)
  })

  it("swallows the click that ends a swipe, and the tap that closes the row", () => {
    const { container } = setup({})
    const link = screen.getByRole("link", { name: "Lease renewal" })
    const onClick = vi.fn()
    link.addEventListener("click", onClick)

    swipe(rows(container)[0]!, -120)
    fireEvent.click(link)

    expect(onClick).not.toHaveBeenCalled()
    expect(rows(container)[0]).toHaveAttribute("data-state", "open")

    fireEvent.click(link)

    expect(onClick).not.toHaveBeenCalled()
    expect(rows(container)[0]).toHaveAttribute("data-state", "closed")

    fireEvent.click(link)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("offers every action from a keyboard menu", async () => {
    const user = userEvent.setup()
    const read = vi.fn()
    setup({ read })

    const more = screen.getByRole("button", {
      name: "More actions for Lease renewal",
    })
    more.focus()
    await user.keyboard("{Enter}")

    const menu = screen.getByRole("menu", {
      name: "More actions for Lease renewal",
    })
    const items = screen.getAllByRole("menuitem")
    expect(menu).toBeInTheDocument()
    expect(items.map((item) => item.textContent)).toEqual([
      "Read",
      "Delete",
      "Archive",
    ])
    expect(items[0]).toHaveFocus()

    await user.keyboard("{ArrowUp}")
    expect(items[2]).toHaveFocus()

    await user.keyboard("{Escape}")
    expect(screen.queryByRole("menu")).toBeNull()
    expect(more).toHaveFocus()

    await user.keyboard("{ArrowDown}")
    await user.keyboard("{Enter}")
    expect(read).toHaveBeenCalledTimes(1)
    expect(more).toHaveFocus()
  })

  it("runs a full swipe at once with reduced motion", () => {
    const original = window.matchMedia
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: (query: string) => ({
        ...original(query),
        matches: query.includes("reduce"),
      }),
    })

    try {
      const remove = vi.fn()
      const { container } = setup({ remove })

      swipe(rows(container)[0]!, -260)
      expect(remove).toHaveBeenCalledTimes(1)

      const content = rows(container)[1]!.querySelector<HTMLElement>(
        "[data-slot='swipe-actions-content']"
      )!
      expect(content.style.transition).toBe("none")
    } finally {
      Object.defineProperty(window, "matchMedia", {
        configurable: true,
        value: original,
      })
    }
  })
})
