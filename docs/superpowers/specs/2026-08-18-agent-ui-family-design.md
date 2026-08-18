# Agent UI family — design

Date: 2026-08-18
Status: implemented

## Goal

Add an **Agent UI** family to Mischief: five presentational components for
the surfaces an AI agent shows mid-conversation. At the same time,
consolidate the component taxonomy from nine ad-hoc families to five, so the
gallery can group by family instead of tagging every card.

## Context

The agent-UI space is crowded. Vercel's AI Elements ships roughly sixty
components on the same shadcn registry install path Mischief uses, shadcn/ui
itself added chat primitives in June 2026, and assistant-ui, prompt-kit, and
aicss.dev all cover overlapping ground. Every component in this spec has at
least one existing implementation elsewhere.

This was raised and the decision was to build the set anyway: Mischief should
feel complete for agent UI on its own terms rather than send people to another
library mid-project. The design goal that follows from that is **small,
readable, changeable source** — not feature parity with AI Elements. Where a
choice is between more capability and less code, take less code.

Explicitly out of scope, because they pull in weight the library does not
want: syntax-highlighted code blocks (shiki), data and comparison tables
(shadcn has tables), voice, and workflow canvas.

## Taxonomy

Nine families become five. `family` is display-only — it appears in the
gallery eyebrow and the docs detail header, and is unrelated to the
`categories` tags in `registry.json`. Numbers are display-only too; no URLs
change.

| Family     | Members (new numbering)                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| Controls   | 01 Magnetic Tabs, 02 Elastic Slider, 03 Hold Button, 04 Shift Button, 05 Impossible Checkbox           |
| Wayfinding | 06 Floating Index, 07 Scroll to Top Button                                                             |
| Files      | 08 File Upload, 09 File Thumbnail                                                                      |
| Agent UI   | 10 Ask AI, 11 Streaming Text, 12 Thinking State, 13 Tool Call, 14 Agent Checklist, 15 Inline Citations |
| Blocks     | 16 Signature Footer, 17 Image Gallery                                                                  |

Merges: Tactile controls + Actions + Playful extras into Controls; Layout into
Blocks; Agent handoffs into Agent UI. Files stays separate from Agent UI —
File Upload is a generic dropzone and filing it under Agent UI would be
marketing rather than taxonomy.

Every family now has at least two members, which is what makes grouped
headers viable in the gallery.

## Conventions these components follow

Taken from the existing registry, not invented here:

- `"use client"` at the top of every file.
- A local `cn` helper inlined per file. Components do **not** import shared
  utilities, and do **not** use `registryDependencies`. Each registry item
  installs standalone today and that stays true. Where two components need
  the same ten-line helper, duplicate it — editing one must never affect the
  other.
- Controlled and uncontrolled support via `value` / `defaultValue` /
  `onValueChange`, following `FileUpload`.
- Async work enters through a function or source prop, following
  `FileUploadAdapter`.
- `data-slot="<name>"` attributes on styled nodes so consumers can restyle
  without forking, following `SignatureFooter`.
- Semantic shadcn tokens only (`background`, `foreground`, `muted`, `border`,
  `ring`). No component ships a global theme.
- Exported prop types; root props spread through
  `Omit<React.HTMLAttributes<HTMLDivElement>, ...>`.

## The live-state contract

Every component accepts **either** a plain value or a live source, so the same
component serves SSR, docs previews, and tests without a mock harness:

```ts
export type StreamSource = AsyncIterable<string> | ReadableStream<string>
```

`<StreamingText text="..." />` renders immediately. `<StreamingText
source={stream} />` drives the state machine. This mirrors `FileUpload`'s
`value` / `uploadFile` split.

Consumption rules, applied uniformly:

- Reading starts in an effect, never during render.
- An `AbortController` tears the read down on unmount or when `source`
  changes identity. A `ReadableStream` reader is released in the same path.
- A source is consumed once. Re-running requires a new source identity.
- Errors set `status: "error"` and call `onError`; they are never swallowed.

## Announcement policy

Streaming token-by-token into an `aria-live` region makes screen readers
either stutter on every fragment or drop most of them. Both streaming
components use the same approach:

- Tokens land in the visual node immediately; that node carries
  `aria-hidden="true"` while streaming.
- A sibling `aria-live="polite"` region receives **completed sentences only**,
  flushed on terminal punctuation (`.`, `!`, `?`, newline), after a ~1s idle
  gap, or on completion.
- On completion the visual node drops `aria-hidden` and the live region is
  cleared, so the finished text is readable normally.
- `announce="off"` opts out entirely, for when the component sits inside a
  larger region the host already manages.

Cursor blink and status transitions are disabled under
`prefers-reduced-motion`.

## Component APIs

### 11 · Streaming Text

```ts
export type StreamingTextStatus = "idle" | "streaming" | "done" | "error"

export type StreamingTextProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  text?: string
  source?: StreamSource
  speed?: number // chars/sec when replaying `text`; 0 = instant
  cursor?: React.ReactNode | false
  status?: StreamingTextStatus // controlled
  announce?: "sentences" | "off" // defaults to "sentences"
  onDone?: (text: string) => void
  onError?: (error: unknown) => void
}
```

Renders `data-slot="streaming-text"` with `data-status`. With `source`,
appends chunks as they arrive. With `text` and `speed > 0`, replays it as a
typewriter — this is what makes the docs preview live without a backend.
Zero dependencies beyond `clsx` / `tailwind-merge`.

### 12 · Thinking State

```ts
export type ThinkingStatus = "idle" | "thinking" | "done" | "error"

export type ThinkingStateProps = React.HTMLAttributes<HTMLDivElement> & {
  status?: ThinkingStatus
  label?: React.ReactNode // defaults to "Thinking"
  doneLabel?: React.ReactNode
  startedAt?: number // epoch ms; drives the live elapsed timer
  showElapsed?: boolean // defaults to true
  reasoning?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}
```

A live elapsed timer ticking on an interval while `status === "thinking"`,
cleared on settle. `aria-busy` reflects thinking. When `reasoning` is given
the component renders a disclosure (button with `aria-expanded` /
`aria-controls`, not `<details>`, so it can animate) containing the reasoning
node. `reasoning` takes a `ReactNode` rather than a source: the caller composes
`<StreamingText>` inside it when they want live reasoning. This was a change
from the original design, which duplicated the stream logic into this file —
composition removes the duplication without creating a registry dependency.

### 13 · Tool Call

```ts
export type ToolCallStatus = "pending" | "running" | "success" | "error"

export type ToolCallProps = React.HTMLAttributes<HTMLDivElement> & {
  name: string
  status?: ToolCallStatus
  input?: unknown
  output?: React.ReactNode
  error?: string
  startedAt?: number // live duration while running
  durationMs?: number // final duration once settled
  icon?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}
```

A collapsed row showing icon, name, status, and duration; expanding reveals
input and output. `input` renders through `JSON.stringify(value, null, 2)`
inside a `<pre>` — deliberately unhighlighted, since highlighting means
shiki. `output` is a `ReactNode` so the host can render whatever it likes.
Status changes announce politely. Depends only on `lucide-react` for status
icons, alongside `clsx` / `tailwind-merge`.

### 14 · Agent Checklist

```ts
export type ChecklistItemStatus =
  "pending" | "active" | "done" | "error" | "skipped"

export type AgentChecklistItem = {
  id: string
  label: React.ReactNode
  status: ChecklistItemStatus
  detail?: React.ReactNode
}

export type AgentChecklistProps = React.HTMLAttributes<HTMLElement> & {
  items: AgentChecklistItem[]
  title?: React.ReactNode
  announce?: boolean // defaults to true
}
```

Renders an `<ol>` with a status icon per item. When `announce`, transitions
are reported politely and debounced — "Step 2 of 5 done: Read the file" —
rather than re-reading the whole list. Fully controlled: the host owns
`items`. Zero dependencies beyond `lucide-react` for icons.

### 15 · Inline Citations

```ts
export type CitationSource = {
  id: string
  title: string
  url?: string
  snippet?: string
}

export type InlineCitationsProps = React.HTMLAttributes<HTMLDivElement> & {
  sources: CitationSource[]
  children: React.ReactNode
  showSourceList?: boolean // defaults to true
}

export type CitationProps = { id: string }
```

Compositional rather than parsed: `InlineCitations` provides context and
renders the numbered source list; `<Citation id="doc-1" />` is placed inline
in the text by the host. A marker is an anchor to its list entry with an
accessible name of `Source 3: <title>`, so it works without hover. Parsing
`[1]` out of a string was considered and rejected — it fails on any text
containing brackets and hides the mapping from the reader.

## Site changes

- `lib/component-docs.ts` — rewrite `family` and `number` on all twelve
  existing entries; add five entries with summary, dependencies, install,
  npm import, usage, props, and accessibility notes.
- `components/component-gallery.tsx` — group sections under one header per
  family; drop the per-card `NN / Family` eyebrow in favour of a family
  header plus a plain number.
- `components/demos/` — one demo component per registry item plus an
  `index.ts` mapping slug to demo. The gallery and the docs preview both had
  their own drifted copy of every demo, and the preview fell through to the
  hold-button demo for any unknown slug. Both now render from `componentDocs`
  and this one catalog, so a new component cannot be silently missing from
  either surface.
- `app/globals.css` — styles for the family header row.
- `registry/default/<slug>/<slug>.tsx` — five new files.
- `registry.json` — five items, `categories` including `"ai"`.
- `packages/mischief-ui` — five subpath exports plus barrel re-exports, and
  matching `tsup` entries.
- Copy: hero and FAQ get a line acknowledging agent components. The FAQ
  should say plainly that these compose with AI Elements rather than replace
  it — people will ask.

## Demos

Each component needs a docs preview that is live without a backend. Streaming
Text and Thinking State replay canned text through `speed`. Tool Call and
Agent Checklist run a scripted timeline on a timer that loops with a restart
control, following the existing `hold-demo` restart pattern in the gallery.
Inline Citations is static.

## Testing

Vitest and Testing Library are already configured. Per component:

- Static props render without any async source.
- A hand-rolled async iterable drives the state machine to `done`; asserted
  through visible text and `data-status`.
- A rejecting source sets `error` status and calls `onError`.
- Unmounting mid-stream aborts and produces no post-unmount state update.
- The live region receives whole sentences, not fragments.
- Controlled `open` / `status` props are respected over internal state.
- `prefers-reduced-motion` disables cursor blink and transitions.

## Sequencing

Two independent pieces; the taxonomy does not depend on the components.

1. **Taxonomy and gallery grouping** — renumber, remap families, add the
   family header row and its CSS. Touches existing files only, ships on its
   own, and makes the gallery ready to receive new sections.
2. **The five components** — each is independent of the others, so they can
   be built in any order or in parallel. Each lands as component file,
   registry entry, package export, docs entry, demo, and tests together.

## Open questions

Names are the least settled part and are cheap to change now, expensive after
publish since the slug reaches the registry, docs URL, and npm subpath.
"Thinking State" and "Agent Checklist" are the two worth a second look —
alternatives are "Reasoning" (collides with AI Elements) and "Task List".
