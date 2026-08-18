import { packageImport, registryInstallCommand } from "@/site.config"

const entries = [
  {
    slug: "magnetic-tabs",
    kind: "component",
    name: "Magnetic Tabs",
    family: "Controls",
    summary:
      "Familiar tabs with a gentle pull toward the pointer. Selection stays clear and keyboard navigation remains immediate.",
    dependencies: ["@base-ui/react", "motion"],
    install: registryInstallCommand("magnetic-tabs"),
    npmImport: packageImport("MagneticTabs", "magnetic-tabs"),
    usage: `const items = [
  { value: "overview", label: "Overview", content: <p>Ready to go.</p> },
  { value: "activity", label: "Activity", content: <p>No new activity.</p> },
]

export function Example() {
  return <MagneticTabs items={items} />
}`,
    props: [
      [
        "items",
        "MagneticTabItem[]",
        "Labels, values, panels, and disabled states.",
      ],
      ["defaultValue", "string", "The initially selected tab."],
      ["value", "string", "The selected value when controlled."],
      [
        "onValueChange",
        "(value: string) => void",
        "Runs when selection changes.",
      ],
      ["className", "string", "Classes for the root element."],
    ],
    accessibility:
      "Base UI supplies tab semantics, arrow-key navigation, focus handling, and panel relationships. Pointer attraction is removed when reduced motion is enabled.",
  },
  {
    slug: "elastic-slider",
    kind: "component",
    name: "Elastic Slider",
    family: "Controls",
    summary:
      "A precise slider with a small amount of give at either end. The current value stays visible and the control works without a pointer.",
    dependencies: ["@base-ui/react", "motion"],
    install: registryInstallCommand("elastic-slider"),
    npmImport: packageImport("ElasticSlider", "elastic-slider"),
    usage: `export function Volume() {
  return (
    <ElasticSlider
      label="Notification volume"
      defaultValue={68}
      name="volume"
    />
  )
}`,
    props: [
      ["label", "ReactNode", "The visible and accessible label."],
      [
        "defaultValue",
        "number",
        "The initial uncontrolled value. Defaults to 50.",
      ],
      ["value", "number", "The current value when controlled."],
      [
        "onValueChange",
        "(value: number) => void",
        "Runs while the value changes.",
      ],
      [
        "onValueCommitted",
        "(value: number) => void",
        "Runs when interaction finishes.",
      ],
      ["min, max, step", "number", "Range and increment settings."],
      [
        "formatValue",
        "(value: number) => string",
        "Formats the visible value.",
      ],
    ],
    accessibility:
      "The control uses Base UI slider behavior and a native output for the visible value. It supports pointer, touch, and keyboard input. End feedback is removed when reduced motion is enabled.",
  },
  {
    slug: "hold-button",
    kind: "component",
    name: "Hold Button",
    family: "Controls",
    summary:
      "A confirmation button for actions that deserve a second thought. Release early to cancel, or activate once with a keyboard.",
    dependencies: [],
    install: registryInstallCommand("hold-button"),
    npmImport: packageImport("HoldButton", "hold-button"),
    usage: `export function RemoveDownload() {
  return (
    <HoldButton onComplete={removeDownload}>
      Hold to remove download
    </HoldButton>
  )
}`,
    props: [
      [
        "onComplete",
        "() => void",
        "Runs once after a completed hold or keyboard activation.",
      ],
      [
        "duration",
        "number",
        "Hold time in milliseconds. Defaults to 900, minimum 500.",
      ],
      ["completeLabel", "ReactNode", "Content shown after completion."],
      ["children", "ReactNode", "The idle button content."],
      [
        "...buttonProps",
        "ButtonHTMLAttributes",
        "Native button attributes except pointer and click handlers.",
      ],
    ],
    accessibility:
      "Pointer users hold to confirm. Keyboard and assistive technology users activate the native button once, avoiding a timing barrier. Progress and completion are announced politely.",
  },
  {
    slug: "shift-button",
    kind: "component",
    name: "Shift Button",
    family: "Controls",
    summary:
      "A call to action that trades its leading icon for a directional cue when someone approaches it.",
    dependencies: ["@base-ui/react", "lucide-react"],
    install: registryInstallCommand("shift-button"),
    npmImport: packageImport("ShiftButton", "shift-button"),
    usage: `export function DownloadButton() {
  return (
    <ShiftButton
      render={<a href="/download" />}
      leadingIcon={<Apple aria-hidden="true" />}
    >
      Download for Mac
    </ShiftButton>
  )
}`,
    props: [
      ["children", "ReactNode", "The button or link label."],
      ["leadingIcon", "ReactNode", "The icon visible at rest."],
      ["trailingIcon", "ReactNode", "The arriving icon. Defaults to an arrow."],
      ["render", "ReactElement", "Renders another element, such as a link."],
      ["className", "string", "Classes for the root element."],
    ],
    accessibility:
      "Base UI preserves native button behavior and supports rendering a real link for navigation. The label never disappears, focus remains visible, and reduced motion keeps both the leading icon and text still.",
  },
  {
    slug: "impossible-checkbox",
    kind: "component",
    name: "Impossible Checkbox",
    family: "Controls",
    summary:
      "A checkbox with one stubborn rule: the bear will not let you leave it on. Best kept for demos, Easter eggs, and harmless preferences.",
    dependencies: ["motion"],
    install: registryInstallCommand("impossible-checkbox"),
    npmImport: packageImport("ImpossibleCheckbox", "impossible-checkbox"),
    usage: `export function Demo() {
  return (
    <ImpossibleCheckbox
      aria-label="Enable bear mode"
      onAttempt={(attempt) => console.log({ attempt })}
    />
  )
}`,
    props: [
      [
        "onAttempt",
        "(attempt: number) => void",
        "Runs each time someone tries to check it.",
      ],
      [
        "revealAfter",
        "number",
        "Attempts before the bear starts peeking. Defaults to 2.",
      ],
      [
        "angryAfter",
        "number",
        "Attempts before the bear looks angry. Defaults to 5.",
      ],
      ["className", "string", "Classes and custom properties for the frame."],
      [
        "...inputProps",
        "InputHTMLAttributes",
        "Native checkbox attributes except checked and onChange.",
      ],
    ],
    accessibility:
      "The control is a native checkbox and works with pointer, touch, and keyboard input. A polite live region explains that the bear switched it off. Reduced motion skips the swat sequence while keeping the result clear. Do not use it for consent, safety, or any setting a person genuinely needs to change.",
  },
  {
    slug: "floating-index",
    kind: "component",
    name: "Floating Index",
    family: "Wayfinding",
    summary:
      "A compact outline for long pages. It keeps the active section and reading progress visible without becoming another permanent sidebar.",
    dependencies: ["motion", "lucide-react"],
    install: registryInstallCommand("floating-index"),
    npmImport: packageImport("FloatingIndex", "floating-index"),
    usage: `const items = [
  { id: "introduction", label: "Introduction" },
  { id: "details", label: "Details" },
  { id: "examples", label: "Examples" },
]

export function PageIndex() {
  return <FloatingIndex items={items} />
}`,
    props: [
      [
        "items",
        "FloatingIndexItem[]",
        "Section ids, labels, and optional icons.",
      ],
      ["label", "string", "The toggle label. Defaults to Index."],
      ["activeId", "string", "The active section when controlled."],
      ["defaultActiveId", "string", "The initial active section."],
      [
        "onActiveChange",
        "(id: string) => void",
        "Runs when the visible section changes.",
      ],
      [
        "container",
        "HTMLElement | null",
        "Tracks a controlled scroll container that can change after mount.",
      ],
      [
        "containerRef",
        "RefObject<HTMLElement>",
        "Tracks a scroll container instead of the page.",
      ],
      ["className", "string", "Classes for placement and appearance."],
    ],
    accessibility:
      "The index is a labelled navigation landmark with native buttons, visible focus, aria-expanded on the toggle, and aria-current on the active section. Escape closes the outline. Reduced motion removes panel animation and smooth scrolling.",
  },
  {
    slug: "scroll-to-top-button",
    kind: "component",
    name: "Scroll to Top Button",
    family: "Wayfinding",
    summary:
      "A floating way back after someone has moved down a long page or scroll area. It stays hidden near the top.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("scroll-to-top-button"),
    npmImport: packageImport("ScrollToTopButton", "scroll-to-top-button"),
    usage: `export function LongPage() {
  return (
    <>
      <main>{/* Long page content */}</main>
      <ScrollToTopButton />
    </>
  )
}`,
    props: [
      [
        "container",
        "HTMLElement | null",
        "Scrolls a controlled container that can change after mount.",
      ],
      [
        "containerRef",
        "RefObject<HTMLElement>",
        "Scrolls a container instead of the page.",
      ],
      [
        "showAfter",
        "number",
        "Scroll distance before the button appears. Defaults to 320.",
      ],
      [
        "behavior",
        '"auto" | "instant" | "smooth"',
        "The requested scroll behavior. Defaults to smooth.",
      ],
      ["label", "string", "The accessible name and title."],
      ["className", "string", "Classes for placement and appearance."],
      ["...buttonProps", "ButtonHTMLAttributes", "Native button attributes."],
    ],
    accessibility:
      "The control is a named native button with a 48px target. It stays out of the tab order until the page has moved down, uses immediate scrolling when reduced motion is requested, and leaves keyboard navigation unchanged.",
  },
  {
    slug: "file-upload",
    kind: "component",
    name: "File Upload",
    family: "Files",
    summary:
      "A file picker and dropzone with clear validation and a visible queue. Connect your upload function when you need progress, cancel, and retry.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("file-upload"),
    npmImport: packageImport("FileUpload", "file-upload"),
    usage: `async function uploadFile(file, { signal, onProgress }) {
  return uploadToYourStorage(file, { signal, onProgress })
}

export function Attachments() {
  return (
    <FileUpload
      accept="image/*,.pdf"
      maxFiles={5}
      maxSize={10 * 1024 * 1024}
      uploadFile={uploadFile}
    />
  )
}`,
    props: [
      ["accept", "string", "MIME types and extensions accepted by the picker."],
      ["multiple", "boolean", "Allows more than one file. Defaults to true."],
      ["maxFiles", "number", "Maximum files in the queue. Defaults to 5."],
      ["maxSize", "number", "Maximum bytes per file. Defaults to 10 MB."],
      [
        "uploadFile",
        "FileUploadAdapter",
        "Your async upload function with progress and cancellation hooks.",
      ],
      [
        "autoUpload",
        "boolean",
        "Starts the adapter when files are accepted. Defaults to true.",
      ],
      [
        "onFilesAccepted",
        "(files: File[]) => void",
        "Runs with files that pass validation.",
      ],
      [
        "onFilesRejected",
        "(rejections) => void",
        "Reports type, size, count, and duplicate failures.",
      ],
      [
        "onFilesChange",
        "(entries) => void",
        "Runs when the queue or an upload state changes.",
      ],
      [
        "value, defaultValue",
        "FileUploadEntry[]",
        "Controls the queue or supplies its initial entries.",
      ],
      ["onValueChange", "(entries) => void", "Updates a controlled queue."],
      [
        "onUploadComplete",
        "(entry, result) => void",
        "Receives the value returned by your upload adapter.",
      ],
      ["disabled", "boolean", "Disables both picking and dropping."],
      ["className", "string", "Classes for the root element."],
    ],
    accessibility:
      "The picker is a named native button backed by a file input. Drag and drop is an additional path, not the only one. Validation and upload changes are announced politely. Every queue action and the primary picker keep a 44px target. Progress uses native progressbar semantics. File type and size checks must also run on the server because browser validation is not a security boundary.",
  },
  {
    slug: "file-thumbnail",
    kind: "component",
    name: "File Thumbnail",
    family: "Files",
    summary:
      "A compact image preview for attachments, upload queues, and file lists. Browser image files work without any setup.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("file-thumbnail"),
    npmImport: packageImport("FileThumbnail", "file-thumbnail"),
    usage: `export function ImagePreview({ file }: { file: File }) {
  return (
    <FileThumbnail
      file={file}
      className="w-32"
    />
  )
}`,
    props: [
      [
        "file",
        "File | FileThumbnailFile",
        "A browser File or an object with a name and optional MIME type.",
      ],
      [
        "previewImageUrl",
        "string | null",
        "An existing image URL. Browser image File objects preview themselves when omitted.",
      ],
      [
        "previewAspectRatio",
        "number",
        "The frame aspect ratio. Defaults to 1.",
      ],
      ["fit", '"cover" | "contain"', "Image fitting. Defaults to cover."],
      [
        "alt",
        "string",
        "Alternative text for the preview image. Defaults to decorative.",
      ],
      ["isLoading", "boolean", "Shows the loading state."],
      ["hasError", "boolean", "Forces the file-type fallback."],
      ["previewClassName", "string", "Classes for the preview content."],
      ["className", "string", "Classes for the preview frame."],
    ],
    accessibility:
      "Failed previews expose the file name and explain that the image is unavailable. Loading previews use a named status. Preview images default to decorative because file names usually sit beside thumbnails, but alt text can be supplied when the image itself carries meaning. Reduced motion removes the fade and shimmer movement.",
  },
  {
    slug: "conversation",
    kind: "component",
    name: "Conversation",
    family: "Agent UI",
    summary:
      "The scroll container a thread lives in. It follows a streaming reply to the bottom, and stops the moment the reader scrolls up to read something older.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("conversation"),
    npmImport: packageImport("Conversation", "conversation"),
    usage: `export function Thread({ messages }: { messages: Msg[] }) {
  return (
    <Conversation className="h-[32rem]">
      {messages.map((message) => (
        <Message key={message.id} role={message.role}>
          {message.content}
        </Message>
      ))}
    </Conversation>
  )
}`,
    props: [
      [
        "stickToBottom",
        "boolean",
        "Follows new content to the bottom. Defaults to true.",
      ],
      [
        "threshold",
        "number",
        "How close to the bottom still counts as following, in pixels. Defaults to 48.",
      ],
      [
        "showJumpButton, jumpLabel",
        "boolean, string",
        "The control offered once following has stopped.",
      ],
      [
        "onFollowChange",
        "(following: boolean) => void",
        "Runs when the reader leaves or returns to the bottom.",
      ],
    ],
    accessibility:
      "Scrolling is never taken away from the reader. New content is followed only while they are already at the bottom, so scrolling up to read something older is not undone by the next token. Returning is an ordinary button rather than a gesture. The viewport uses contained overscroll so reaching the end does not scroll the page behind it.",
  },
  {
    slug: "message",
    kind: "component",
    name: "Message",
    family: "Agent UI",
    summary:
      "One turn in a thread, with a role, an optional avatar and timestamp, and actions that stay reachable without a pointer.",
    dependencies: [],
    install: registryInstallCommand("message"),
    npmImport: packageImport("Message", "message"),
    usage: `export function Turn() {
  return (
    <Message role="assistant" avatar="M" timestamp="just now">
      <StreamingText source={reply} />
    </Message>
  )
}`,
    props: [
      [
        "role",
        '"user" | "assistant" | "system"',
        "Who is speaking. Sets the layout and the announced name.",
      ],
      ["name", "ReactNode", "Overrides the name read out for the role."],
      ["avatar", "ReactNode", "A decorative avatar beside the turn."],
      ["timestamp", "ReactNode", "Shown under the body."],
      ["actions", "ReactNode", "Controls such as copy or regenerate."],
      ["pending", "boolean", "Marks the turn busy while it is still arriving."],
    ],
    accessibility:
      "Each turn is an article naming its speaker, so a thread can be navigated turn by turn instead of read as one block. Actions are hidden with opacity rather than display, which keeps them focusable by keyboard and reveals them on focus as well as hover; on touch, where there is no hover, they stay visible. A turn still arriving reports aria-busy.",
  },
  {
    slug: "prompt-input",
    kind: "component",
    name: "Prompt Input",
    family: "Agent UI",
    summary:
      "The composer. Grows with the message, sends on Enter, keeps Shift+Enter for a new line, and turns into a stop button while a reply streams.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("prompt-input"),
    npmImport: packageImport("PromptInput", "prompt-input"),
    usage: `export function Composer() {
  return (
    <PromptInput
      status={isStreaming ? "streaming" : "ready"}
      onSubmit={send}
      onStop={stop}
    />
  )
}`,
    props: [
      [
        "value, defaultValue, onValueChange",
        "string, string, (value: string) => void",
        "The text, controlled or uncontrolled.",
      ],
      ["onSubmit", "(value: string) => void", "Runs with the trimmed message."],
      [
        "status",
        '"ready" | "streaming"',
        "Swaps the send button for a stop button.",
      ],
      ["onStop", "() => void", "Runs when the stop button is pressed."],
      [
        "maxRows",
        "number",
        "How far the field grows before it scrolls. Defaults to 8.",
      ],
      [
        "attachments, actions",
        "ReactNode",
        "Slots above the field and beside the send button.",
      ],
    ],
    accessibility:
      "The field has a real label and the send and stop buttons have accessible names rather than only icons. Enter sends and Shift+Enter starts a new line, but Enter is left alone while an input method editor has a candidate open, so composing text in Japanese or Chinese does not send the message early. Sending is refused when the field holds only whitespace.",
  },
  {
    slug: "suggestions",
    kind: "component",
    name: "Suggestions",
    family: "Agent UI",
    summary:
      "A row of prompts to start or continue with, for the moment someone does not know what to ask.",
    dependencies: [],
    install: registryInstallCommand("suggestions"),
    npmImport: packageImport("Suggestions", "suggestions"),
    usage: `const prompts = [
  { id: "summary", label: "Summarise this document" },
  { id: "risks", label: "Find the risks" },
]

export function Starters() {
  return <Suggestions suggestions={prompts} onSelect={send} />
}`,
    props: [
      [
        "suggestions",
        "Suggestion[]",
        "Id, label, and an optional prompt and icon.",
      ],
      [
        "onSelect",
        "(suggestion: Suggestion) => void",
        "Runs with the chosen suggestion.",
      ],
      ["disabled", "boolean", "Disables every suggestion at once."],
      ["label", "string", "The accessible name of the row."],
    ],
    accessibility:
      "The row is a labelled navigation landmark holding a list of buttons, so it can be skipped or entered deliberately rather than being an unlabelled run of controls. It scrolls horizontally with snap points and every target meets the minimum touch size. Nothing is rendered at all when there is nothing to suggest.",
  },
  {
    slug: "ask-ai",
    kind: "component",
    name: "Ask AI",
    family: "Agent UI",
    summary:
      "Hand someone a prepared, source-aware prompt in the AI assistant they already use, or let them copy it for another one.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("ask-ai"),
    npmImport: packageImport("AskAi", "ask-ai"),
    usage: `const prompt = [
  "Explain what Acme does using current web sources.",
  "Prefer Acme's own docs, cite every claim, and flag anything unverified.",
].join("\\n")

export function AskAboutAcme() {
  return <AskAi subject="Acme" prompt={prompt} />
}`,
    props: [
      [
        "subject",
        "string",
        "The product or topic named in the heading and labels.",
      ],
      [
        "prompt",
        "string",
        "The complete prompt sent to or copied for an assistant.",
      ],
      [
        "targets",
        "readonly AskAiTarget[]",
        "Custom assistant names and prepared URLs. Defaults to ChatGPT, Claude, Perplexity, and Grok.",
      ],
      ["description", "ReactNode", "Supporting copy below the heading."],
      ["copyLabel", "string", "The idle copy button label."],
      [
        "onPromptCopied",
        "(prompt: string) => void",
        "Runs after the prompt reaches the clipboard.",
      ],
      ["className", "string", "Classes for the root element."],
      [
        "...rootProps",
        "HTMLAttributes<HTMLDivElement>",
        "Native root attributes.",
      ],
    ],
    accessibility:
      "Every assistant is a named external link with a 44px target and explicit new-tab wording. The copy action is a native button. Success and failure are shown in the button and announced through a polite status region. The component does not open a destination until someone chooses it. Prompts are placed in destination URLs, so they must not contain secrets or private data.",
  },
  {
    slug: "streaming-text",
    kind: "component",
    name: "Streaming Text",
    family: "Agent UI",
    summary:
      "Text that arrives a piece at a time from an async source, with a cursor while it runs and sentence-level announcements for screen readers.",
    dependencies: [],
    install: registryInstallCommand("streaming-text"),
    npmImport: packageImport("StreamingText", "streaming-text"),
    usage: `export function Answer({ stream }: { stream: AsyncIterable<string> }) {
  return <StreamingText source={stream} onDone={saveAnswer} />
}`,
    props: [
      ["text", "string", "Static content, or the script replayed by speed."],
      [
        "source",
        "AsyncIterable<string> | ReadableStream<string>",
        "A live source consumed once and appended as it arrives.",
      ],
      [
        "speed",
        "number",
        "Characters per second when replaying text. Defaults to 0, which renders instantly.",
      ],
      [
        "streaming",
        "boolean",
        "Forces the streaming state when the caller owns the text.",
      ],
      [
        "cursor",
        "ReactNode | false",
        "Replaces or removes the trailing cursor.",
      ],
      [
        "announce",
        '"sentences" | "off"',
        'How the live region reports progress. Defaults to "sentences".',
      ],
      ["onDone", "(text: string) => void", "Runs once the source completes."],
      ["onError", "(error: unknown) => void", "Runs when the source rejects."],
      [
        "onStatusChange",
        "(status: StreamingTextStatus) => void",
        "Runs on every status transition.",
      ],
    ],
    accessibility:
      "While text is arriving the visible node is hidden from assistive technology and a polite live region receives completed sentences instead, flushed on terminal punctuation, after a one second pause, or on completion. When the source settles the visible text is exposed normally and the live region is cleared. Static text never populates a live region. The cursor stops animating under reduced motion.",
  },
  {
    slug: "thinking-state",
    kind: "component",
    name: "Thinking State",
    family: "Agent UI",
    summary:
      "A status row for work in progress, with a live elapsed timer and optional reasoning behind a disclosure.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("thinking-state"),
    npmImport: packageImport("ThinkingState", "thinking-state"),
    usage: `export function Status({ startedAt }: { startedAt: number }) {
  return (
    <ThinkingState
      status="thinking"
      startedAt={startedAt}
      reasoning={<StreamingText source={reasoningStream} />}
    />
  )
}`,
    props: [
      [
        "status",
        '"idle" | "thinking" | "done" | "error"',
        'The current phase. Defaults to "thinking".',
      ],
      ["label, doneLabel, errorLabel", "ReactNode", "Copy for each phase."],
      [
        "startedAt",
        "number",
        "Epoch milliseconds. Drives a timer that ticks while thinking.",
      ],
      [
        "elapsedMs",
        "number",
        "A fixed duration, used instead of the timer when supplied.",
      ],
      ["showElapsed", "boolean", "Shows the duration. Defaults to true."],
      [
        "reasoning",
        "ReactNode",
        "Optional detail behind a disclosure. Compose Streaming Text here for live reasoning.",
      ],
      [
        "open, defaultOpen, onOpenChange",
        "boolean, boolean, (open: boolean) => void",
        "Controls the reasoning disclosure.",
      ],
    ],
    accessibility:
      "The root carries aria-busy while thinking and drops it once the work settles. Reasoning uses a native button with aria-expanded and aria-controls rather than a details element, so it can animate and stay predictable. The spinner and label stop animating under reduced motion.",
  },
  {
    slug: "tool-call",
    kind: "component",
    name: "Tool Call",
    family: "Agent UI",
    summary:
      "A compact record of one tool invocation: name, status, duration, and the input and output behind a disclosure.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("tool-call"),
    npmImport: packageImport("ToolCall", "tool-call"),
    usage: `export function Search() {
  return (
    <ToolCall
      name="web_search"
      status="success"
      input={{ query: "agent ui", limit: 5 }}
      output={<p>Three matches.</p>}
      durationMs={340}
    />
  )
}`,
    props: [
      ["name", "string", "The tool name shown in the header."],
      [
        "status",
        '"pending" | "running" | "success" | "error"',
        'The current phase. Defaults to "pending".',
      ],
      [
        "input",
        "unknown",
        "Rendered as formatted JSON, or as-is when it is a string.",
      ],
      ["output", "ReactNode", "Whatever the tool returned, rendered by you."],
      ["error", "string", "A failure message shown inside the panel."],
      [
        "startedAt",
        "number",
        "Epoch milliseconds. Drives a live duration while running.",
      ],
      ["durationMs", "number", "The final duration once the call settles."],
      ["icon", "ReactNode", "Replaces the default tool icon."],
      [
        "open, defaultOpen, onOpenChange",
        "boolean, boolean, (open: boolean) => void",
        "Controls the detail disclosure.",
      ],
    ],
    accessibility:
      "Status changes are announced through a polite status region naming the tool. The disclosure is a native button with aria-expanded and aria-controls, and its accessible name says which tool it belongs to. Input is rendered as plain preformatted text in a horizontally scrollable region, with no syntax highlighting and no extra dependency.",
  },
  {
    slug: "agent-checklist",
    kind: "component",
    name: "Agent Checklist",
    family: "Agent UI",
    summary:
      "A task list whose items change state as work proceeds, announcing what changed instead of re-reading the whole list.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("agent-checklist"),
    npmImport: packageImport("AgentChecklist", "agent-checklist"),
    usage: `const items = [
  { id: "read", label: "Read the changelog", status: "done" },
  { id: "diff", label: "Compare versions", status: "active" },
  { id: "write", label: "Draft the summary", status: "pending" },
]

export function Plan() {
  return <AgentChecklist items={items} title="Plan" />
}`,
    props: [
      [
        "items",
        "AgentChecklistItem[]",
        "Id, label, status, and optional detail per step. Fully controlled.",
      ],
      ["title", "ReactNode", "An optional heading above the list."],
      [
        "announce",
        "boolean",
        "Announces status transitions politely. Defaults to true.",
      ],
      [
        "showProgress",
        "boolean",
        "Shows the settled count in the header. Defaults to true.",
      ],
    ],
    accessibility:
      "The list is an ordered list and every item states its status in text for screen readers, not through colour or icon alone. When a status changes, only the difference is announced along with a running count, so a long list does not get re-read on every update. Spinners stop under reduced motion.",
  },
  {
    slug: "inline-citations",
    kind: "component",
    name: "Inline Citations",
    family: "Agent UI",
    summary:
      "Numbered markers placed inside generated text, each linking to its entry in a source list underneath.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("inline-citations"),
    npmImport: packageImport("InlineCitations", "inline-citations"),
    usage: `const sources = [
  { id: "docs", title: "Agent UI docs", url: "https://example.com/docs" },
]

export function Answer() {
  return (
    <InlineCitations sources={sources}>
      <p>
        Streaming is supported<Citation id="docs" />.
      </p>
    </InlineCitations>
  )
}`,
    props: [
      [
        "sources",
        "CitationSource[]",
        "Id, title, and optional url and snippet. Order sets the numbering.",
      ],
      [
        "children",
        "ReactNode",
        "The text, with Citation markers placed inline.",
      ],
      [
        "showSourceList",
        "boolean",
        "Renders the numbered list below the text. Defaults to true.",
      ],
      ["sourceListLabel", "ReactNode", "Heading for the source list."],
      ["id (Citation)", "string", "Which source this marker points at."],
    ],
    accessibility:
      "Markers are real anchors to their list entry, so they work without hover or a pointer. Each one has an accessible name giving the number and the source title, and the visible digit is hidden from assistive technology to avoid reading it twice. A marker whose id is not in sources renders nothing rather than a dead link. External source links say that they open in a new tab.",
  },
  {
    slug: "approval-card",
    kind: "component",
    name: "Approval Card",
    family: "Agent UI",
    summary:
      "The question an agent asks before it acts. Ordinary answers take one click; destructive ones have to be held.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("approval-card"),
    npmImport: packageImport("ApprovalCard", "approval-card"),
    usage: `export function Confirm() {
  return (
    <ApprovalCard
      question="Delete 40 files the agent flagged as unused?"
      description="This cannot be undone from here."
      options={[
        { id: "delete", label: "Delete all 40", destructive: true },
        { id: "review", label: "Show me the list first" },
      ]}
      onApprove={handleApprove}
    />
  )
}`,
    props: [
      ["question", "ReactNode", "What the agent is asking."],
      ["description", "ReactNode", "Supporting detail below the question."],
      [
        "options",
        "ApprovalOption[]",
        "Id, label, optional description, and a destructive flag.",
      ],
      [
        "answerId, defaultAnswerId",
        "string",
        "The chosen option, controlled or uncontrolled.",
      ],
      [
        "holdDuration",
        "number",
        "Hold time for destructive options in milliseconds. Defaults to 900, minimum 500.",
      ],
      ["freeform", "boolean", "Adds a field for an answer you did not list."],
      [
        "onApprove",
        "(optionId: string) => void",
        "Runs when an option is chosen.",
      ],
      [
        "onFreeformSubmit",
        "(value: string) => void",
        "Runs when the freeform answer is sent.",
      ],
      ["onDismiss", "() => void", "Shows a dismiss control when supplied."],
    ],
    accessibility:
      "The card is a labelled region and the options are a group tied to the question. Ordinary options are ordinary buttons. A destructive option cannot be triggered by a stray tap: pointer input has to be held, and releasing early cancels. Keyboard and assistive technology users activate it once instead, since holding a key is not a fair requirement. The progress fill is decorative and is hidden under reduced motion.",
  },
  {
    slug: "bounding-boxes",
    kind: "component",
    name: "Bounding Boxes",
    family: "Documents",
    summary:
      "Selectable regions drawn over a page image from normalized coordinates, for showing an agent exactly where an answer came from.",
    dependencies: [],
    install: registryInstallCommand("bounding-boxes"),
    npmImport: packageImport("BoundingBoxes", "bounding-boxes"),
    usage: `const boxes = [
  { id: "total", label: "Total", x: 0.62, y: 0.71, width: 0.2, height: 0.04 },
]

export function Invoice() {
  return <BoundingBoxes src="/page-1.png" alt="Invoice, page 1" boxes={boxes} />
}`,
    props: [
      ["src, alt", "string", "The page image and its description."],
      [
        "boxes",
        "BoundingBox[]",
        "Id, optional label and tone, and x, y, width, height as fractions of the page from 0 to 1.",
      ],
      [
        "activeId, defaultActiveId",
        "string | null",
        "The selected region, controlled or uncontrolled.",
      ],
      [
        "onActiveChange",
        "(id: string | null) => void",
        "Runs when a region is selected or cleared.",
      ],
      ["showLabels", "boolean", "Shows the label tab above each region."],
      [
        "renderImage",
        "(props) => ReactNode",
        "Uses a framework image component instead of a plain img.",
      ],
    ],
    accessibility:
      "Regions are a labelled list of toggle buttons, so they are reachable by keyboard and announced with their label and pressed state rather than only by colour. The visible label is decorative and hidden from assistive technology to avoid reading it twice. Coordinates are clamped to the page, so bad data cannot push a region off the image or out of the document flow.",
  },
  {
    slug: "annotation-layer",
    kind: "component",
    name: "Annotation Layer",
    family: "Documents",
    summary:
      "Notes attached to regions of a page. Drag to add one, select to read it, and the coordinates stay relative to the page rather than the screen.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("annotation-layer"),
    npmImport: packageImport("AnnotationLayer", "annotation-layer"),
    usage: `export function Review({ page }: { page: string }) {
  return (
    <AnnotationLayer
      src={page}
      alt="Contract, page 2"
      annotations={notes}
      onCreate={(rect) => addNote(rect)}
    />
  )
}`,
    props: [
      ["src, alt", "string", "The page image and its description."],
      [
        "annotations",
        "Annotation[]",
        "Id, note, author, and x, y, width, height as fractions of the page.",
      ],
      [
        "onCreate",
        "(rect: AnnotationRect) => void",
        "Runs with a new region when someone drags one out. Omit it to disable drawing.",
      ],
      [
        "onDelete",
        "(id: string) => void",
        "Shows a delete control when given.",
      ],
      [
        "activeId, defaultActiveId, onActiveChange",
        "string | null",
        "The selected note, controlled or uncontrolled.",
      ],
      [
        "minSize",
        "number",
        "Smallest drag that counts as a region. Defaults to 0.01 of the page.",
      ],
    ],
    accessibility:
      "Regions are toggle buttons carrying their note as an accessible name, so notes can be reached and read without a pointer. The note itself appears in a polite live region rather than a hover card. A drag that never moved is treated as a deselect instead of creating an unusably small region. Coordinates are fractions of the page, so they survive zoom and a change of screen.",
  },
  {
    slug: "redaction",
    kind: "component",
    name: "Redaction",
    family: "Documents",
    summary:
      "Mark regions to black out before a document leaves the building, with a reveal that says plainly it is only a preview.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("redaction"),
    npmImport: packageImport("Redaction", "redaction"),
    usage: `export function Prepare({ page }: { page: string }) {
  return (
    <Redaction
      src={page}
      alt="Statement, page 1"
      regions={regions}
      onCreate={(rect) => addRegion(rect)}
      onDelete={removeRegion}
    />
  )
}`,
    props: [
      ["src, alt", "string", "The page image and its description."],
      [
        "regions",
        "RedactionRegion[]",
        "Id, optional reason, and x, y, width, height as fractions of the page.",
      ],
      [
        "onCreate",
        "(rect: RedactionRect) => void",
        "Runs with a new region. Omit it to disable drawing.",
      ],
      ["onDelete", "(id: string) => void", "Removes a region."],
      [
        "revealed, defaultRevealed, onRevealedChange",
        "boolean",
        "Whether the covered regions are shown for review.",
      ],
      ["readOnly", "boolean", "Shows the result without editing controls."],
    ],
    accessibility:
      "Every region carries a number and its reason in text, and says when it is revealed, so the state is never conveyed by a black rectangle alone. Revealing raises a status message stating that the cover is visual only and the source file still has to be redacted, because a component that merely paints over a page must not be mistaken for one that removes data.",
  },
  {
    slug: "page-navigator",
    kind: "component",
    name: "Page Navigator",
    family: "Documents",
    summary:
      "A rail of page thumbnails for moving through a long document, with arrow-key navigation and a clear active page.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("page-navigator"),
    npmImport: packageImport("PageNavigator", "page-navigator"),
    usage: `export function Sidebar({ pages }: { pages: DocumentPage[] }) {
  return <PageNavigator pages={pages} onActivePageChange={scrollToPage} />
}`,
    props: [
      [
        "pages",
        "DocumentPage[]",
        "Page number, optional thumbnail src, and optional label.",
      ],
      [
        "activePage, defaultActivePage",
        "number",
        "The current page, controlled or uncontrolled.",
      ],
      [
        "onActivePageChange",
        "(page: number) => void",
        "Runs when the page changes.",
      ],
      [
        "orientation",
        '"vertical" | "horizontal"',
        'Rail direction. Defaults to "vertical".',
      ],
      [
        "renderImage",
        "(props) => ReactNode",
        "Uses a framework image component for thumbnails.",
      ],
    ],
    accessibility:
      "The rail is a tab list with a single tab stop. Arrow keys move between pages along the rail's orientation, Home and End jump to the ends, and focus follows selection. Pages without a thumbnail fall back to an icon and still carry their number, so the control works before any image has loaded.",
  },
  {
    slug: "file-tree",
    kind: "component",
    name: "File Tree",
    family: "Documents",
    summary:
      "An expandable tree of folders and files with full keyboard navigation and correct tree semantics.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("file-tree"),
    npmImport: packageImport("FileTree", "file-tree"),
    usage: `const nodes = [
  {
    id: "invoices",
    name: "invoices",
    kind: "folder",
    children: [{ id: "jan", name: "january.pdf" }],
  },
]

export function Files() {
  return <FileTree nodes={nodes} onSelect={openFile} />
}`,
    props: [
      [
        "nodes",
        "FileTreeNode[]",
        "Id, name, kind, optional children, meta, and icon.",
      ],
      [
        "expandedIds, defaultExpandedIds",
        "string[]",
        "Which folders are open, controlled or uncontrolled.",
      ],
      [
        "selectedId, defaultSelectedId",
        "string | null",
        "The selected node, controlled or uncontrolled.",
      ],
      ["onSelect", "(node: FileTreeNode) => void", "Runs on selection."],
      [
        "onExpandedChange",
        "(ids: string[]) => void",
        "Runs when a folder opens or closes.",
      ],
    ],
    accessibility:
      "The tree uses tree and treeitem roles with aria-level and aria-expanded on every row, so depth and state are announced rather than implied by indentation. There is one tab stop into the tree. Up and Down move between visible rows, Right opens a folder or steps into it, Left closes it or moves to its parent, Home and End jump to the ends, and Enter or Space selects.",
  },
  {
    slug: "document-splits",
    kind: "component",
    name: "Document Splits",
    family: "Documents",
    summary:
      "Mark where one scanned batch becomes several documents. Splits are toggled between pages and the segments update as you go.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("document-splits"),
    npmImport: packageImport("DocumentSplits", "document-splits"),
    usage: `export function Batch({ pages }: { pages: SplitPage[] }) {
  return <DocumentSplits pages={pages} onSplitChange={saveSplits} />
}`,
    props: [
      [
        "pages",
        "SplitPage[]",
        "Page number, optional thumbnail src, and optional label.",
      ],
      [
        "splitAfter, defaultSplitAfter",
        "number[]",
        "Page numbers a split follows, controlled or uncontrolled.",
      ],
      [
        "onSplitChange",
        "(splitAfter: number[]) => void",
        "Runs with the sorted boundaries whenever they change.",
      ],
      [
        "segmentLabel",
        "(segment: DocumentSegment) => ReactNode",
        "Replaces the default heading above each document.",
      ],
      [
        "renderImage",
        "(props) => ReactNode",
        "Uses a framework image component for thumbnails.",
      ],
    ],
    accessibility:
      "Each split control is a toggle button naming the page it follows, so the action is clear without seeing the layout. No control is offered after the final page, since a split there would mean nothing. Segment headings state the document number and page count as text.",
  },
  {
    slug: "schema-builder",
    kind: "component",
    name: "Schema Builder",
    family: "Documents",
    summary:
      "Build the shape you want extracted from a document. Fields carry a name, type, description, and requirement, and object and array fields nest.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("schema-builder"),
    npmImport: packageImport("SchemaBuilder", "schema-builder"),
    usage: `export function Extraction() {
  return (
    <SchemaBuilder
      defaultFields={[{ id: "total", name: "total", type: "number" }]}
      onFieldsChange={saveSchema}
    />
  )
}`,
    props: [
      [
        "fields, defaultFields",
        "SchemaField[]",
        "The schema, controlled or uncontrolled.",
      ],
      [
        "onFieldsChange",
        "(fields: SchemaField[]) => void",
        "Runs on every edit.",
      ],
      [
        "types",
        "readonly SchemaFieldType[]",
        "The type options offered. Defaults to string, number, boolean, date, object, and array.",
      ],
      [
        "maxDepth",
        "number",
        "How far object and array fields may nest. Defaults to 3.",
      ],
      [
        "createId",
        "() => string",
        "Supplies ids for new fields when you need them stable.",
      ],
    ],
    accessibility:
      "Every input has a label naming the field it belongs to, so a screen reader user knows which row they are editing rather than hearing a run of unlabelled boxes. Nesting controls say which field they open, and remove buttons name the field they delete. Only object and array fields offer nesting, and nesting stops at maxDepth.",
  },
  {
    slug: "signature-pad",
    kind: "component",
    name: "Signature Pad",
    family: "Documents",
    summary:
      "Sign with a pointer on a canvas, or type a name instead. Returns a PNG data URL or the typed text.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("signature-pad"),
    npmImport: packageImport("SignaturePad", "signature-pad"),
    usage: `export function Sign() {
  return <SignaturePad onChange={(value) => setSignature(value)} />
}`,
    props: [
      [
        "mode, defaultMode",
        '"draw" | "type"',
        "The active method, controlled or uncontrolled.",
      ],
      [
        "onChange",
        "(value: SignatureValue | null) => void",
        "Runs with the PNG data URL or typed text, and null once cleared.",
      ],
      ["penColor, lineWidth", "string, number", "Stroke appearance."],
      ["height", "number", "Signing area height in pixels. Defaults to 180."],
      ["typedFontFamily", "string", "The face used for a typed signature."],
      ["hint", "ReactNode", "Guidance shown under the signing area."],
    ],
    accessibility:
      "Drawing on a canvas cannot be done with a keyboard, so typing is a first-class method rather than a fallback, and the canvas says so in its accessible name. The method switch is a labelled group of toggle buttons. Clearing is disabled while there is nothing to clear. The canvas is redrawn at the device pixel ratio so a signature is not blurred on a high-density screen.",
  },
  {
    slug: "csv-viewer",
    kind: "component",
    name: "CSV Viewer",
    family: "Documents",
    summary:
      "A real table for delimited data, with sortable columns, a sticky header, and a row cap so a large file cannot lock the page.",
    dependencies: ["papaparse", "lucide-react"],
    install: registryInstallCommand("csv-viewer"),
    npmImport: packageImport("CsvViewer", "csv-viewer"),
    usage: `export function Preview({ file }: { file: File }) {
  return <CsvViewer source={file} maxRows={200} />
}`,
    props: [
      ["source", "string | File", "CSV text or a file to parse."],
      [
        "table",
        "CsvTable",
        "Already parsed data as fields and rows. Skips the parser entirely.",
      ],
      [
        "parser",
        "(source) => Promise<CsvTable>",
        "Replaces the default parser. Supply this and papaparse is never loaded.",
      ],
      ["maxRows", "number", "How many rows to render. Defaults to 200."],
      ["emptyLabel, loadingLabel", "ReactNode", "Copy for those two states."],
    ],
    accessibility:
      "The data is a real table with a caption, column headers, and aria-sort on the sorted column, so it can be navigated with table commands rather than read as a wall of text. Sorting is a button inside each header. Numeric columns sort numerically instead of as text. When rows are capped the footer says how many of the total are shown, rather than silently truncating.",
  },
  {
    slug: "docx-viewer",
    kind: "component",
    name: "DOCX Viewer",
    family: "Documents",
    summary:
      "Renders a Word document as elements built through an allowlist, so a file you did not write cannot bring its own scripts or links.",
    dependencies: ["mammoth", "lucide-react"],
    install: registryInstallCommand("docx-viewer"),
    npmImport: packageImport("DocxViewer", "docx-viewer"),
    usage: `export function Contract({ file }: { file: File }) {
  return <DocxViewer source={file} />
}`,
    props: [
      ["source", "ArrayBuffer | Blob", "The document to convert."],
      [
        "result",
        "DocxResult",
        "Already converted html and messages. Skips the converter.",
      ],
      [
        "converter",
        "(source: ArrayBuffer) => Promise<DocxResult>",
        "Replaces the default converter. Supply this and mammoth is never loaded.",
      ],
      [
        "allowedTags",
        "readonly string[]",
        "The tags permitted in the output. Anything else keeps its text and loses its wrapper.",
      ],
      ["showWarnings", "boolean", "Lists conversion messages under the body."],
    ],
    accessibility:
      "Converted markup is never injected. The HTML is parsed and rebuilt as React elements through a tag and attribute allowlist, so event handler attributes cannot survive and a javascript: link loses its href while keeping its text. Links that do survive open in a new tab with noreferrer. The region reports aria-busy while a document is converting.",
  },
  {
    slug: "pdf-viewer",
    kind: "component",
    name: "PDF Viewer",
    family: "Documents",
    summary:
      "Page-by-page PDF rendering on a canvas, with paging and zoom, over any loader you give it.",
    dependencies: ["pdfjs-dist", "lucide-react"],
    install: registryInstallCommand("pdf-viewer"),
    npmImport: packageImport("PdfViewer", "pdf-viewer"),
    usage: `export function Contract() {
  return <PdfViewer source="/agreement.pdf" workerSrc={workerUrl} />
}`,
    props: [
      ["source", "string | ArrayBuffer", "The document to open."],
      [
        "document",
        "PdfDocumentHandle",
        "An already open document. Skips the loader.",
      ],
      [
        "loader",
        "(source) => Promise<PdfDocumentHandle>",
        "Replaces the default loader. Supply this and pdfjs-dist is never loaded.",
      ],
      [
        "page, defaultPage, onPageChange",
        "number, number, (page: number) => void",
        "The current page, controlled or uncontrolled.",
      ],
      [
        "defaultScale, minScale, maxScale",
        "number",
        "Zoom range. Defaults to 1, 0.5, and 3.",
      ],
      [
        "workerSrc",
        "string",
        "The pdfjs worker URL, which most bundlers need set explicitly.",
      ],
    ],
    accessibility:
      "The canvas carries an accessible name naming the document and the page it is showing, and the page counter is a polite live region so moving through a document is announced. Paging and zoom controls are disabled at their limits rather than silently doing nothing. A canvas cannot expose the text underneath it, so pair this with a text layer or a downloadable original when the content has to be readable.",
  },
  {
    slug: "markdown-blocks",
    kind: "component",
    name: "Markdown Blocks",
    family: "Documents",
    summary:
      "Extracted document regions rendered as markdown, each one selectable so it can be tied back to where it came from.",
    dependencies: ["react-markdown", "remark-gfm"],
    install: registryInstallCommand("markdown-blocks"),
    npmImport: packageImport("MarkdownBlocks", "markdown-blocks"),
    usage: `const blocks = [
  { id: "title", kind: "heading", content: "# Master Agreement", page: 1 },
]

export function Layout() {
  return <MarkdownBlocks blocks={blocks} onActiveChange={highlightRegion} />
}`,
    props: [
      [
        "blocks",
        "MarkdownBlock[]",
        "Id, markdown content, and optional kind, page, and label.",
      ],
      [
        "activeId, defaultActiveId",
        "string | null",
        "The selected block, controlled or uncontrolled.",
      ],
      [
        "onActiveChange",
        "(id: string | null) => void",
        "Runs when a block is selected or cleared. Pair with Bounding Boxes.",
      ],
      ["showKinds", "boolean", "Shows the kind and page above each block."],
    ],
    accessibility:
      "Blocks are an ordered list of toggle buttons, so selection is reachable by keyboard and announced. Raw HTML inside a block is not rendered, since react-markdown ignores it unless a raw plugin is added, which this component deliberately does not add. Tables come from GitHub flavoured markdown and render as real tables.",
  },
  {
    slug: "signature-footer",
    kind: "block",
    name: "Signature Footer",
    family: "Blocks",
    summary:
      "A complete closing section with room for the useful links first and one oversized wordmark at the end.",
    dependencies: [],
    install: registryInstallCommand("signature-footer"),
    npmImport: packageImport("SignatureFooter", "signature-footer"),
    usage: `export function Footer() {
  return (
    <SignatureFooter
      eyebrow="One last useful thought"
      heading="Make the ending memorable."
      description="Keep the links practical. Let the wordmark do the rest."
      action={<a href="/work">See our work</a>}
      navigation={<nav aria-label="Footer">...</nav>}
      brand={<a href="/">Northstar</a>}
      meta={<span>Independent and curious.</span>}
      wordmark="Northstar"
    />
  )
}`,
    props: [
      ["heading", "ReactNode", "The footer's main invitation."],
      ["wordmark", "string", "The oversized closing brand name."],
      ["eyebrow", "ReactNode", "A short label above the heading."],
      ["description", "ReactNode", "Supporting copy below the heading."],
      ["action", "ReactNode", "A primary link or button."],
      ["navigation", "ReactNode", "Product, company, or social links."],
      ["brand", "ReactNode", "The compact logo or home link."],
      ["meta", "ReactNode", "License, location, or ownership details."],
      ["className", "string", "Classes for the footer element."],
    ],
    accessibility:
      "The component uses a semantic footer and heading. Navigation, links, and labels remain yours, so their names stay specific to your site. The repeated oversized wordmark is decorative and hidden from assistive technology.",
  },
  {
    slug: "image-gallery",
    kind: "block",
    name: "Image Gallery",
    family: "Blocks",
    summary:
      "A responsive image collection with equal and masonry layouts, plus a lightbox that handles focus, keyboard navigation, and scroll locking.",
    dependencies: ["@base-ui/react", "lucide-react"],
    install: registryInstallCommand("image-gallery"),
    npmImport: packageImport("ImageGallery", "image-gallery"),
    usage: `const images = [
  {
    id: "studio",
    src: "/photos/studio.jpg",
    alt: "Sunlight across the studio table",
    width: 1600,
    height: 1200,
    caption: "The studio",
  },
]

export function WorkGallery() {
  return <ImageGallery images={images} title="Recent work" />
}`,
    props: [
      [
        "images",
        "ImageGalleryItem[]",
        "Image sources, alt text, captions, and optional downloads.",
      ],
      ["title", "ReactNode", "The heading above the collection."],
      ["layout", '"grid" | "masonry"', "The layout when controlled."],
      [
        "defaultLayout",
        '"grid" | "masonry"',
        "The initial uncontrolled layout.",
      ],
      ["onLayoutChange", "(layout) => void", "Runs when the layout changes."],
      ["selectedId", "string | null", "The open image when controlled."],
      [
        "onSelectedIdChange",
        "(id) => void",
        "Runs when the lightbox opens, moves, or closes.",
      ],
      ["showLayoutToggle", "boolean", "Shows or hides the layout control."],
      [
        "emptyState",
        "ReactNode",
        "Content shown when the collection is empty.",
      ],
      [
        "renderImage",
        "(image, context) => ReactNode",
        "Uses a framework image component or another custom renderer.",
      ],
    ],
    accessibility:
      "Every thumbnail is a named button. Base UI supplies the modal dialog, focus trap, scroll lock, Escape handling, and focus restoration. Left and Right Arrow move between images. Captions, position, and close controls remain available without hover.",
  },
] as const

export const componentDocs = entries.map((entry, index) => ({
  ...entry,
  number: String(index + 1).padStart(2, "0"),
}))

export type ComponentDoc = (typeof componentDocs)[number]

export type ComponentSlug = ComponentDoc["slug"]

export function getComponentDoc(slug: string) {
  return componentDocs.find((component) => component.slug === slug)
}
