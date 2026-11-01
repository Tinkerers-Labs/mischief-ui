import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import {
  NotificationStack,
  type NotificationStackItem,
} from "../registry/default/notification-stack/notification-stack"

const items: NotificationStackItem[] = [
  { id: "a", title: "Build passed on main", time: "9m ago" },
  { id: "b", title: "New comment on Launch checklist" },
  { id: "c", title: "Design review starts in 15 minutes" },
  { id: "d", title: "Storage is almost full" },
]

function Inbox({ start = items }: { start?: NotificationStackItem[] }) {
  const [list, setList] = React.useState(start)
  return (
    <NotificationStack
      items={list}
      onDismiss={(id) => setList((all) => all.filter((item) => item.id !== id))}
      onClearAll={() => setList([])}
    />
  )
}

function stack() {
  return screen.getByRole("region", { name: "Notifications" })
}

describe("NotificationStack", () => {
  it("is a named region that counts what it holds", () => {
    render(<Inbox />)

    expect(stack()).toHaveAttribute("data-state", "collapsed")
    expect(stack()).toHaveTextContent("4")
    expect(screen.getAllByRole("listitem")).toHaveLength(3)
  })

  it("spreads out when the mouse rests on it", () => {
    render(<Inbox />)

    fireEvent.pointerEnter(stack(), { pointerType: "mouse" })
    expect(stack()).toHaveAttribute("data-state", "expanded")
    expect(screen.getAllByRole("listitem")).toHaveLength(4)

    fireEvent.pointerLeave(stack(), { pointerType: "mouse" })
    expect(stack()).toHaveAttribute("data-state", "collapsed")
  })

  it("spreads out when Tab moves into it", async () => {
    const user = userEvent.setup()
    render(
      <>
        <button type="button">Before</button>
        <Inbox />
      </>
    )

    screen.getByRole("button", { name: "Before" }).focus()
    await user.tab()

    expect(screen.getByRole("button", { name: "Clear all" })).toHaveFocus()
    expect(stack()).toHaveAttribute("data-state", "expanded")

    await user.tab({ shift: true })
    expect(stack()).toHaveAttribute("data-state", "collapsed")
  })

  it("opens on a tap and closes on a tap outside", () => {
    render(
      <>
        <Inbox />
        <p>Page</p>
      </>
    )

    fireEvent.click(screen.getByText("Storage is almost full"))
    expect(stack()).toHaveAttribute("data-state", "expanded")

    fireEvent.pointerDown(screen.getByText("Page"))
    expect(stack()).toHaveAttribute("data-state", "collapsed")
  })

  it("dismisses one card and moves focus to the next", async () => {
    const user = userEvent.setup()
    render(<Inbox />)

    await user.click(
      screen.getByRole("button", { name: "Dismiss: Build passed on main" })
    )

    await waitFor(() =>
      expect(screen.queryByText("Build passed on main")).toBeNull()
    )
    expect(
      screen.getByRole("button", {
        name: "Dismiss: New comment on Launch checklist",
      })
    ).toHaveFocus()
  })

  it("dismisses a card swiped aside on touch", async () => {
    const onDismiss = vi.fn()
    render(<NotificationStack items={items} onDismiss={onDismiss} />)

    const card = screen.getAllByRole("listitem")[0] as HTMLElement
    fireEvent.pointerDown(card, {
      pointerType: "touch",
      pointerId: 1,
      clientX: 10,
    })
    fireEvent.pointerMove(card, {
      pointerType: "touch",
      pointerId: 1,
      clientX: 60,
    })
    fireEvent.pointerMove(card, {
      pointerType: "touch",
      pointerId: 1,
      clientX: 140,
    })
    fireEvent.pointerUp(card, {
      pointerType: "touch",
      pointerId: 1,
      clientX: 140,
    })

    await waitFor(() => expect(onDismiss).toHaveBeenCalledWith("a"))
  })

  it("leaves a card in place when the swipe is short", () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    render(<NotificationStack items={items} onDismiss={onDismiss} />)

    const card = screen.getAllByRole("listitem")[0] as HTMLElement
    fireEvent.pointerDown(card, {
      pointerType: "touch",
      pointerId: 1,
      clientX: 10,
    })
    fireEvent.pointerMove(card, {
      pointerType: "touch",
      pointerId: 1,
      clientX: 50,
    })
    fireEvent.pointerUp(card, {
      pointerType: "touch",
      pointerId: 1,
      clientX: 50,
    })
    vi.advanceTimersByTime(500)
    vi.useRealTimers()

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it("clears everything and keeps focus in the stack", async () => {
    const user = userEvent.setup()
    render(<Inbox />)

    await user.click(screen.getByRole("button", { name: "Clear all" }))

    expect(stack()).toHaveTextContent("No notifications")
    expect(stack()).toHaveFocus()
  })

  it("announces a notification that arrives, not the ones already there", () => {
    const { container, rerender } = render(
      <NotificationStack items={items} onDismiss={vi.fn()} />
    )
    const live = container.querySelector('[aria-live="polite"]')
    expect(live).toHaveTextContent("")

    rerender(
      <NotificationStack
        items={[{ id: "e", title: "Reply on Launch checklist" }, ...items]}
        onDismiss={vi.fn()}
      />
    )
    expect(live).toHaveTextContent("Reply on Launch checklist")
  })
})
