import * as React from "react"
import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  AgentChecklist,
  type AgentChecklistItem,
} from "../registry/default/agent-checklist/agent-checklist"
import {
  Citation,
  InlineCitations,
} from "../registry/default/inline-citations/inline-citations"
import { StreamingText } from "../registry/default/streaming-text/streaming-text"
import { ThinkingState } from "../registry/default/thinking-state/thinking-state"
import { ToolCall } from "../registry/default/tool-call/tool-call"

function deferredSource() {
  const chunks: string[] = []
  let notify: (() => void) | null = null
  let closed = false
  let failure: unknown = null

  const source: AsyncIterable<string> = {
    async *[Symbol.asyncIterator]() {
      for (;;) {
        while (chunks.length > 0) yield chunks.shift() as string
        if (failure) throw failure
        if (closed) return
        await new Promise<void>((resolve) => {
          notify = resolve
        })
      }
    },
  }

  const wake = () => {
    const resume = notify
    notify = null
    resume?.()
  }

  return {
    source,
    async push(chunk: string) {
      chunks.push(chunk)
      await act(async () => {
        wake()
        await Promise.resolve()
      })
    },
    async close() {
      closed = true
      await act(async () => {
        wake()
        await Promise.resolve()
      })
    },
    async fail(error: unknown) {
      failure = error
      await act(async () => {
        wake()
        await Promise.resolve()
      })
    },
  }
}

describe("StreamingText", () => {
  it("renders static text without a source and stays out of a live region", () => {
    render(<StreamingText text="Ready when you are." data-testid="static" />)

    const root = screen.getByTestId("static")
    expect(root).toHaveAttribute("data-status", "idle")
    expect(root).toHaveTextContent("Ready when you are.")
    expect(
      root.querySelector('[data-slot="streaming-text-value"]')
    ).not.toHaveAttribute("aria-hidden")
    expect(root.querySelector('[aria-live="polite"]')).toBeNull()
  })

  it("appends chunks from an async source and settles on done", async () => {
    const stream = deferredSource()
    const onDone = vi.fn()

    render(
      <StreamingText
        source={stream.source}
        onDone={onDone}
        data-testid="live"
      />
    )

    await stream.push("Reading the file. ")
    expect(screen.getByTestId("live")).toHaveTextContent("Reading the file.")
    expect(screen.getByTestId("live")).toHaveAttribute(
      "data-status",
      "streaming"
    )

    await stream.push("Found what you asked for.")
    await stream.close()

    await waitFor(() =>
      expect(screen.getByTestId("live")).toHaveAttribute("data-status", "done")
    )
    expect(onDone).toHaveBeenCalledWith(
      "Reading the file. Found what you asked for."
    )
  })

  it("hides the streaming value from assistive technology until it settles", async () => {
    const stream = deferredSource()

    render(<StreamingText source={stream.source} data-testid="live" />)

    await stream.push("Half a thought")
    const value = () =>
      screen
        .getByTestId("live")
        .querySelector('[data-slot="streaming-text-value"]')

    expect(value()).toHaveAttribute("aria-hidden", "true")

    await stream.close()
    await waitFor(() => expect(value()).not.toHaveAttribute("aria-hidden"))
  })

  it("announces whole sentences rather than fragments", async () => {
    const stream = deferredSource()
    const { container } = render(<StreamingText source={stream.source} />)

    const region = () => container.querySelector('[aria-live="polite"]')

    await stream.push("Looking")
    expect(region()).toHaveTextContent("")

    await stream.push(" it up now.")
    await waitFor(() =>
      expect(region()).toHaveTextContent("Looking it up now.")
    )
  })

  it("reports a failing source through status and onError", async () => {
    const stream = deferredSource()
    const onError = vi.fn()

    render(
      <StreamingText
        source={stream.source}
        onError={onError}
        data-testid="live"
      />
    )

    await stream.push("Starting. ")
    await stream.fail(new Error("connection lost"))

    await waitFor(() =>
      expect(screen.getByTestId("live")).toHaveAttribute("data-status", "error")
    )
    expect(onError).toHaveBeenCalledOnce()
  })

  it("stops updating after unmount", async () => {
    const stream = deferredSource()
    const onDone = vi.fn()

    const { unmount } = render(
      <StreamingText source={stream.source} onDone={onDone} />
    )

    await stream.push("Partial")
    unmount()
    await stream.push(" and more")
    await stream.close()

    expect(onDone).not.toHaveBeenCalled()
  })

  it("shows a cursor while a caller-controlled stream is open", () => {
    const { container, rerender } = render(
      <StreamingText text="Half written" streaming />
    )

    expect(
      container.querySelector('[data-slot="streaming-text-cursor"]')
    ).toBeInTheDocument()

    rerender(<StreamingText text="Half written" streaming={false} />)

    expect(
      container.querySelector('[data-slot="streaming-text-cursor"]')
    ).not.toBeInTheDocument()
  })
})

describe("ThinkingState", () => {
  it("marks itself busy while thinking and reports elapsed time", () => {
    render(
      <ThinkingState
        status="thinking"
        elapsedMs={4200}
        data-testid="thinking"
      />
    )

    const root = screen.getByTestId("thinking")
    expect(root).toHaveAttribute("aria-busy", "true")
    expect(root).toHaveTextContent("Thinking")
    expect(root).toHaveTextContent("4.2s")
  })

  it("drops the busy flag once it settles", () => {
    render(
      <ThinkingState status="done" elapsedMs={9000} data-testid="thinking" />
    )

    const root = screen.getByTestId("thinking")
    expect(root).not.toHaveAttribute("aria-busy")
    expect(root).toHaveTextContent("Thought")
  })

  it("toggles reasoning through an accessible disclosure", async () => {
    const user = userEvent.setup()

    render(
      <ThinkingState
        status="done"
        reasoning={<p>Checked the changelog first.</p>}
      />
    )

    const trigger = screen.getByRole("button", { name: /show reasoning/i })
    expect(trigger).toHaveAttribute("aria-expanded", "false")

    await user.click(trigger)

    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText("Checked the changelog first.")).toBeVisible()
  })

  it("respects a controlled open state", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <ThinkingState
        open={false}
        onOpenChange={onOpenChange}
        reasoning="Hidden"
      />
    )

    const trigger = screen.getByRole("button", { name: /show reasoning/i })
    await user.click(trigger)

    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(trigger).toHaveAttribute("aria-expanded", "false")
  })
})

describe("ToolCall", () => {
  it("announces its status and formats a settled duration", () => {
    render(
      <ToolCall
        name="read_file"
        status="success"
        durationMs={340}
        data-testid="tool"
      />
    )

    const root = screen.getByTestId("tool")
    expect(root).toHaveAttribute("data-status", "success")
    expect(root).toHaveTextContent("340ms")
    expect(screen.getByRole("status")).toHaveTextContent("read_file done")
  })

  it("renders structured input as formatted JSON behind a disclosure", async () => {
    const user = userEvent.setup()

    render(
      <ToolCall
        name="search"
        status="success"
        input={{ query: "agent ui", limit: 5 }}
        output={<p>Three matches.</p>}
      />
    )

    const trigger = screen.getByRole("button", {
      name: /show details for search/i,
    })
    expect(trigger).toHaveAttribute("aria-expanded", "false")

    await user.click(trigger)

    expect(screen.getByText(/"query": "agent ui"/)).toBeVisible()
    expect(screen.getByText("Three matches.")).toBeVisible()
  })

  it("omits the disclosure when there is nothing to reveal", () => {
    render(<ToolCall name="ping" status="running" />)

    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("surfaces an error message", async () => {
    const user = userEvent.setup()

    render(
      <ToolCall
        name="write_file"
        status="error"
        error="Permission denied"
        defaultOpen
      />
    )

    expect(screen.getByText("Permission denied")).toBeVisible()
    await user.click(screen.getByRole("button", { name: /hide details/i }))
    expect(screen.getByText("Permission denied")).not.toBeVisible()
  })
})

describe("AgentChecklist", () => {
  const base: AgentChecklistItem[] = [
    { id: "read", label: "Read the changelog", status: "done" },
    { id: "diff", label: "Compare versions", status: "active" },
    { id: "write", label: "Draft the summary", status: "pending" },
  ]

  it("renders an ordered list with per-item status for assistive technology", () => {
    render(<AgentChecklist items={base} title="Plan" />)

    const items = screen.getAllByRole("listitem")
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveAttribute("data-status", "done")
    expect(items[0]).toHaveTextContent("Read the changelog, done")
    expect(screen.getByText("1/3")).toBeInTheDocument()
  })

  it("announces only what changed between renders", async () => {
    const { container, rerender } = render(<AgentChecklist items={base} />)

    const region = () => container.querySelector('[aria-live="polite"]')
    expect(region()).toHaveTextContent("")

    rerender(
      <AgentChecklist
        items={base.map((item) =>
          item.id === "diff" ? { ...item, status: "done" as const } : item
        )}
      />
    )

    await waitFor(() =>
      expect(region()).toHaveTextContent(
        "Compare versions done. 2 of 3 complete."
      )
    )
  })

  it("stays silent when announcements are turned off", () => {
    const { container } = render(
      <AgentChecklist items={base} announce={false} />
    )

    expect(container.querySelector('[aria-live="polite"]')).toBeNull()
  })
})

describe("InlineCitations", () => {
  const sources = [
    { id: "docs", title: "Agent UI docs", url: "https://example.com/docs" },
    { id: "post", title: "Release notes" },
  ]

  it("numbers markers by source order and links them to the list", () => {
    render(
      <InlineCitations sources={sources}>
        <p>
          Streaming is supported
          <Citation id="post" />
          and documented
          <Citation id="docs" />.
        </p>
      </InlineCitations>
    )

    const markers = screen.getAllByRole("link", { name: /^Source/ })
    expect(markers[0]).toHaveAccessibleName("Source 2: Release notes")
    expect(markers[1]).toHaveAccessibleName("Source 1: Agent UI docs")

    const target = markers[1]?.getAttribute("href")?.slice(1) ?? ""
    expect(document.getElementById(target)).toHaveTextContent("Agent UI docs")
  })

  it("ignores a marker whose source is not listed", () => {
    render(
      <InlineCitations sources={sources}>
        <p>
          Unknown
          <Citation id="missing" />
        </p>
      </InlineCitations>
    )

    expect(
      screen.queryByRole("link", { name: /^Source/ })
    ).not.toBeInTheDocument()
  })

  it("can hide the source list while keeping markers usable", () => {
    render(
      <InlineCitations sources={sources} showSourceList={false}>
        <p>
          Body
          <Citation id="docs" />
        </p>
      </InlineCitations>
    )

    expect(screen.queryByText("Release notes")).not.toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Source 1: Agent UI docs" })
    ).toBeInTheDocument()
  })
})
