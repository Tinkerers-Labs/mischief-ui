import { packageImport, registryInstallCommand } from "@/site.config"

/**
 * An ordered piece of a guidance section. Sections exist for concerns a
 * component genuinely has -- a coordinate system, a worker URL, a data shape --
 * and a component without one carries no sections at all.
 */
export type DocBlock =
  | { kind: "text"; text: string }
  | { kind: "code"; code: string; caption?: string }
  | { kind: "list"; items: readonly string[] }
  | {
      kind: "table"
      headers: readonly string[]
      rows: readonly (readonly string[])[]
    }

export type DocSection = {
  id: string
  title: string
  blocks: readonly DocBlock[]
}

/** A table for a type the component exports besides its own props. */
export type DocTypeTable = {
  name: string
  description?: string
  rows: readonly (readonly [string, string, string])[]
}

const entries = [
  {
    slug: "magnetic-tabs",
    featured: true,
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
    featured: true,
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
    featured: true,
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
    featured: true,
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
    slug: "command-palette",
    kind: "component",
    name: "Command Palette",
    family: "Wayfinding",
    summary:
      "A search dialog over anything you can list, opened from a keyboard shortcut, with ranked matches and hidden keywords.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("command-palette"),
    npmImport: packageImport("CommandPalette", "command-palette"),
    usage: `const items = [
  { id: "hold-button", label: "Hold Button", group: "Controls" },
  { id: "redaction", label: "Redaction", group: "Documents" },
]

export function Search() {
  return <CommandPalette items={items} onSelect={(item) => open(item.id)} />
}`,
    sections: [
      {
        id: "ranking",
        title: "How matches are ranked",
        blocks: [
          {
            kind: "text",
            text: "Everything is matched case-insensitively against the trimmed query, and each item is scored by the strongest thing it matched. Lower wins, and ties are broken alphabetically by label, so the order never depends on the order you passed items in.",
          },
          {
            kind: "table",
            headers: ["Rank", "Match"],
            rows: [
              ["0", "The label is exactly the query"],
              ["1", "The label starts with the query"],
              ["2", "The label contains the query"],
              ["3", "The group contains the query"],
              ["4", "A keyword contains the query"],
              ["5", "The description contains the query"],
            ],
          },
          {
            kind: "text",
            text: "An item matching none of these is dropped rather than ranked last. Use keywords for the words people actually type that are not in the label -- the old name for a thing, a synonym, the noun rather than the verb.",
          },
          {
            kind: "code",
            code: `const items = [
  {
    id: "redaction",
    label: "Redaction",
    group: "Documents",
    description: "Mark regions to black out",
    keywords: ["privacy", "black bar", "hide", "gdpr"],
  },
]`,
            caption:
              "Typing privacy finds this even though the label never says it.",
          },
        ],
      },
    ],
    types: [
      {
        name: "CommandItem",
        rows: [
          ["id", "string", "Unique within the set."],
          ["label", "string", "What is shown and matched first."],
          ["description", "string", "A second line, matched last."],
          ["group", "string", "Heading the item is listed under, and matched."],
          [
            "keywords",
            "string[]",
            "Words that should find the item but are not shown.",
          ],
        ],
      },
    ],
    props: [
      [
        "items",
        "CommandItem[]",
        "Id and label, plus an optional group, description, and keywords that match without being shown.",
      ],
      [
        "onSelect",
        "(item: CommandItem) => void",
        "Runs with the chosen item. Navigate or act from here.",
      ],
      [
        "open, defaultOpen, onOpenChange",
        "boolean",
        "Whether the dialog is showing, controlled or uncontrolled.",
      ],
      [
        "shortcut",
        "string | false",
        'Key used with Meta or Control. Defaults to "k". Pass false to bind nothing.',
      ],
      ["maxResults", "number", "How many matches to show. Defaults to 8."],
      [
        "placeholder, label, emptyMessage",
        "string, string, (query) => ReactNode",
        "Copy for the field, the dialog, and the no-match state.",
      ],
    ],
    accessibility:
      "The field is a combobox owning a listbox, and the highlighted option is reported through aria-activedescendant, so arrow keys move the selection while focus stays in the field and typing is never interrupted. It is a native dialog opened as a modal, which brings the focus trap, the escape key, and inert content behind it without rebuilding any of them. A search that matches nothing says so in a status region rather than showing an empty list.",
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
    slug: "install-command",
    kind: "component",
    name: "Install Command",
    family: "Docs",
    summary:
      "The install line for a library, switchable between package managers, with the runner and the installer kept apart.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("install-command"),
    npmImport: packageImport("InstallCommand", "install-command"),
    usage: `export function Install() {
  return (
    <InstallCommand
      run="shadcn@latest add tabs"
      add="my-lib"
      prompt="Read the docs, then add Tabs to this project."
    />
  )
}`,
    props: [
      [
        "run",
        "string",
        "Arguments for a one-off runner, such as shadcn@latest add tabs.",
      ],
      ["add", "string", "Packages to add as a dependency."],
      [
        "prompt",
        "string",
        "An instruction to paste into a coding agent, offered beside the commands.",
      ],
      [
        "managers, defaultManager",
        "PackageManager[], PackageManager",
        "Which package managers to offer and which leads. Defaults to npm.",
      ],
      [
        "packageLabel, promptLabel, note",
        "string, string, ReactNode",
        "Copy for the two extra options and the line beneath.",
      ],
    ],
    accessibility:
      "The options are a labelled group of toggle buttons reporting their pressed state, so the current choice is announced rather than shown only by a border. Running a package and adding a dependency are separate verbs, so they come from separate tables instead of one being derived from the other by rewriting a string. Only the options you supply are rendered, and a prompt wraps rather than scrolling sideways.",
  },
  {
    slug: "copy-for-ai",
    kind: "component",
    name: "Copy for AI",
    family: "Docs",
    summary:
      "Hands the page to an assistant as markdown, by clipboard, by link, or by opening it somewhere that can read it.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("copy-for-ai"),
    npmImport: packageImport("CopyForAi", "copy-for-ai"),
    usage: `export function PageActions({ markdown }: { markdown: string }) {
  return (
    <CopyForAi
      markdown={markdown}
      markdownUrl="https://example.com/docs/tabs.md"
    />
  )
}`,
    props: [
      [
        "markdown",
        "string",
        "The page as markdown. This is what the button copies.",
      ],
      [
        "markdownUrl",
        "string",
        "Where the same markdown is served. Adds a link and points destinations at it.",
      ],
      [
        "prompt",
        "string",
        "What a destination is asked to do. Defaults to reading the markdown address.",
      ],
      [
        "destinations",
        "AiDestination[]",
        "Where the page can be opened. Defaults to ChatGPT and Claude.",
      ],
      [
        "copyLabel, copiedLabel, viewLabel, menuLabel",
        "string",
        "Copy for the button and the menu.",
      ],
    ],
    accessibility:
      "Copying is a button and every destination is a link, so each behaves the way its shape promises. The menu closes on Escape and on a click outside it, and the copy is announced through a polite live region rather than only changing an icon. Destinations open in a new tab and are marked so they are not followed.",
  },
  {
    slug: "table-of-contents",
    kind: "component",
    name: "Table of Contents",
    family: "Docs",
    summary:
      "An outline of the page that keeps up with the reader, marking the section they are in as they scroll.",
    dependencies: [],
    install: registryInstallCommand("table-of-contents"),
    npmImport: packageImport("TableOfContents", "table-of-contents"),
    usage: `const sections = [
  { id: "install", label: "Install" },
  { id: "usage", label: "Usage" },
]

export function Outline() {
  return <TableOfContents sections={sections} />
}`,
    props: [
      [
        "sections",
        "TocSection[]",
        "The id of each section and the label to show for it.",
      ],
      [
        "offset",
        "number",
        "How far below the top a heading counts as reached. Defaults to 96.",
      ],
      ["label", "string", "The accessible name and the visible heading."],
      [
        "onActiveChange",
        "(id: string | null) => void",
        "Runs when the reader moves into another section.",
      ],
    ],
    accessibility:
      "The current entry is marked with aria-current, so its position is announced rather than shown only in weight. Sections on a documentation page are tall and very uneven, so this tracks the heading most recently scrolled past instead of observing which box intersects a band, which selects several at once or none. The final section is often too short to reach the line, so the bottom of the page selects it outright.",
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
    sections: [
      {
        id: "validation",
        title: "Validation is not a boundary",
        blocks: [
          {
            kind: "text",
            text: "accept and maxSize exist so someone can correct a mistake before waiting for an upload to fail. They are not security. Every one of them is trivially bypassed -- the accept attribute is a filter in a file dialog, the size is read from the file the browser hands over, and the type comes from an extension rather than the bytes.",
          },
          {
            kind: "text",
            text: "Repeat every check on the server, and sniff the actual content rather than trusting the reported type. A file named invoice.pdf is only a PDF if its bytes say so.",
          },
        ],
      },
      {
        id: "rejections",
        title: "Why a file was refused",
        blocks: [
          {
            kind: "text",
            text: "Refused files arrive through onReject with a code, so you can respond to the reason rather than parsing a message.",
          },
          {
            kind: "table",
            headers: ["Code", "Meaning"],
            rows: [
              ["type", "Did not match accept."],
              ["size", "Larger than maxSize."],
              ["duplicate", "Already in the queue."],
              ["count", "Would exceed maxFiles."],
            ],
          },
          {
            kind: "text",
            text: "Each rejection carries the file it refers to, so several can be reported at once when a whole folder is dropped in.",
          },
        ],
      },
      {
        id: "progress",
        title: "Driving progress",
        blocks: [
          {
            kind: "text",
            text: "The component queues files and shows their state; it never uploads anything. Move each item through its status yourself, and set progress from whatever your transport reports.",
          },
          {
            kind: "code",
            code: `async function upload(item) {
  update(item.id, { status: "uploading", progress: 0 })

  try {
    const result = await put(item.file, {
      onProgress: (progress) => update(item.id, { progress }),
    })
    update(item.id, { status: "complete", progress: 100, result })
  } catch (error) {
    update(item.id, { status: "error", error: String(error) })
  }
}`,
          },
        ],
      },
    ],
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
    featured: true,
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
    sections: [
      {
        id: "following",
        title: "Following the newest message",
        blocks: [
          {
            kind: "text",
            text: "The viewport sticks to the bottom while it is already there, so a streaming answer stays in view. Scroll up and following stops immediately; come back within threshold pixels of the end and it resumes. That is what makes it possible to read back through a conversation while one is still arriving, without being dragged away mid-sentence.",
          },
          {
            kind: "text",
            text: "A jump control appears whenever following has stopped, so getting back to the newest message is one click rather than a long scroll. onFollowChange reports the same state if you want to show something of your own.",
          },
          {
            kind: "code",
            code: `<Conversation threshold={64} onFollowChange={setAtBottom}>
  {messages.map((message) => (
    <Message key={message.id} role={message.role}>
      {message.text}
    </Message>
  ))}
</Conversation>`,
            caption:
              "Raise threshold when messages are tall, so near the bottom still counts as the bottom.",
          },
          {
            kind: "text",
            text: "Turn the behaviour off entirely with stickToBottom={false} for a transcript that should open where it was left rather than at the end.",
          },
        ],
      },
    ],
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
      [
        "avatar",
        "ReactNode",
        "Initials, an icon, or an img. An image is cropped to fill the circle whatever its shape.",
      ],
      ["timestamp", "ReactNode", "Shown under the body."],
      ["actions", "ReactNode", "Controls such as copy or regenerate."],
      ["pending", "boolean", "Marks the turn busy while it is still arriving."],
    ],
    accessibility:
      "Each turn is an article naming its speaker, so a thread can be navigated turn by turn instead of read as one block. The avatar is hidden from assistive technology, since the speaker is already named in text, so a profile picture needs no alternative text of its own. Actions are hidden with opacity rather than display, which keeps them focusable by keyboard and reveals them on focus as well as hover; on touch, where there is no hover, they stay visible. A turn still arriving reports aria-busy.",
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
    sections: [
      {
        id: "keys",
        title: "Sending and not sending",
        blocks: [
          {
            kind: "text",
            text: "Enter submits and Shift+Enter starts a new line, which is what people expect from a message box and the opposite of what a plain textarea does. Submission is skipped when the field is empty or holds only whitespace, so a stray Enter never sends an empty turn.",
          },
          {
            kind: "text",
            text: "The box grows with what is typed and stops at maxRows, scrolling after that rather than pushing the rest of the page away.",
          },
        ],
      },
      {
        id: "status",
        title: "Submitting, then stopping",
        blocks: [
          {
            kind: "text",
            text: "status decides which control is offered. While an answer is being generated the send control becomes a stop control, so the same place in the layout always holds the thing you currently want -- and there is never a send button that quietly does nothing.",
          },
          {
            kind: "code",
            code: `<PromptInput
  status={streaming ? "streaming" : "ready"}
  onSubmit={send}
  onStop={abort}
  attachments={<FileThumbnail file={pending} />}
/>`,
          },
          {
            kind: "text",
            text: "attachments and actions are slots either side of the control, for what is going with the message and for what changes how it is sent -- a model picker, a tool toggle -- so the composer stays yours to arrange.",
          },
        ],
      },
    ],
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
    slug: "questionnaire",
    kind: "component",
    name: "Questionnaire",
    featured: true,
    family: "Agent UI",
    summary:
      "The questions an agent asks before it starts. One at a time, with single or multiple answers, an open answer alongside them, and required ones it will not move past.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("questionnaire"),
    npmImport: packageImport("Questionnaire", "questionnaire"),
    usage: `const questions = [
  {
    id: "scope",
    prompt: "What should I change?",
    required: true,
    choices: [
      { id: "one", label: "Only this file" },
      { id: "all", label: "Every file that matches" },
    ],
  },
]

export function Clarify() {
  return <Questionnaire questions={questions} onSubmit={start} />
}`,
    sections: [
      {
        id: "answers",
        title: "The answer shape",
        blocks: [
          {
            kind: "text",
            text: "Answers are a record of question id to an array of strings, whatever the question. A single-choice question holds one entry, a multiple-choice question holds several, and a freeform answer is the typed text itself. One shape means reading the result never depends on how the question was configured.",
          },
          {
            kind: "code",
            code: `{
  "scope": ["invoices"],
  "fields": ["total", "tax", "due-date"],
  "notes": ["Skip anything before 2024"]
}`,
          },
          {
            kind: "text",
            text: "A question with required set is not satisfied until its array is non-empty, and submission stays blocked until every required question is.",
          },
        ],
      },
      {
        id: "freeform",
        title: "Freeform answers",
        blocks: [
          {
            kind: "text",
            text: "Every question offers an open text answer by default, because the moment the choices do not cover the case, a fixed list forces a wrong answer. Turn it off for the whole set with freeform={false}, or per question, when the choices really are exhaustive.",
          },
          {
            kind: "code",
            code: `<Questionnaire
  questions={questions}
  freeform={false}
  onSubmit={start}
/>`,
            caption:
              "A question may still opt back in with freeform on itself.",
          },
        ],
      },
      {
        id: "shortcuts",
        title: "Keyboard",
        blocks: [
          {
            kind: "list",
            items: [
              "Number keys pick the matching choice, and are ignored while a text field has focus.",
              "Tab reaches every choice and the freeform field in order.",
              "Enter submits once the required questions are answered.",
            ],
          },
        ],
      },
    ],
    types: [
      {
        name: "Question",
        rows: [
          ["id", "string", "Key this question's answer is stored under."],
          ["prompt", "ReactNode", "The question itself."],
          ["description", "ReactNode", "A clarifying line beneath the prompt."],
          [
            "choices",
            "QuestionChoice[]",
            "Offered answers. Omit for a purely open question.",
          ],
          ["multiple", "boolean", "Allows more than one choice."],
          [
            "freeform",
            "boolean",
            "Overrides the set-wide setting for this question.",
          ],
          [
            "freeformLabel, freeformPlaceholder",
            "string, string",
            "Wording for the open answer.",
          ],
          ["required", "boolean", "Blocks submission until answered."],
        ],
      },
      {
        name: "QuestionChoice",
        rows: [
          ["id", "string", "What lands in the answer array."],
          ["label", "ReactNode", "The choice as shown."],
          ["description", "ReactNode", "A second line under the choice."],
        ],
      },
    ],
    props: [
      [
        "questions",
        "Question[]",
        "Prompt, optional description, choices, and flags for multiple, freeform, and required.",
      ],
      [
        "answers, defaultAnswers, onAnswersChange",
        "QuestionnaireAnswers",
        "Chosen choice ids per question, controlled or uncontrolled.",
      ],
      [
        "onSubmit",
        "(answers: QuestionnaireAnswers) => void",
        "Runs with every answer once the last question is submitted.",
      ],
      [
        "freeform",
        "boolean",
        "Offers an open answer on every question. Defaults to true, and a question can set its own.",
      ],
      [
        "shortcuts",
        "boolean",
        "Number keys pick the choice they label. Defaults to true.",
      ],
      ["showProgress", "boolean", "Shows the position and a progress bar."],
      [
        "previousLabel, nextLabel, skipLabel, submitLabel, requiredMessage",
        "string",
        "Copy for the controls and the validation message.",
      ],
    ],
    accessibility:
      "Each question is a fieldset with its prompt as the legend, so the whole question is announced rather than a run of loose options. A single answer uses radios and several uses checkboxes, which brings the right keyboard behaviour without rebuilding it. Position is reported in a polite live region, and a required question that is not answered raises an alert tied to the inputs rather than only colouring them. Number shortcuts are ignored while a freeform answer is being typed.",
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
    sections: [
      {
        id: "sources",
        title: "Two ways to drive it",
        blocks: [
          {
            kind: "text",
            text: "Pass text and it is typed out at speed, which is the right thing for a canned answer or a demonstration. Pass source -- an async iterable of chunks -- and it renders what actually arrives, at the pace it arrives, with no artificial delay in front of a real response.",
          },
          {
            kind: "code",
            code: `<StreamingText
  source={response.body}
  onDone={(text) => save(text)}
  onError={report}
/>`,
            caption:
              "Anything async-iterable works, including a fetch body reader.",
          },
          {
            kind: "text",
            text: "Callbacks fire from the status they describe rather than from inside a render, so onDone runs once when the stream finishes and never during React's own work.",
          },
        ],
      },
      {
        id: "announcing",
        title: "What a screen reader hears",
        blocks: [
          {
            kind: "text",
            text: "Announcing every character would be unusable, so the live region is filled a sentence at a time as sentences complete. A reader hears the answer in whole thoughts, slightly behind the text on screen, instead of a stream of letters.",
          },
          {
            kind: "text",
            text: "Set announce to off where the text is decorative, or where something else on the page is already announcing the same content. A static render -- no streaming, no source -- fills nothing, so a transcript of past messages does not re-announce itself on mount.",
          },
        ],
      },
    ],
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
    sections: [
      {
        id: "lifecycle",
        title: "The four states",
        blocks: [
          {
            kind: "text",
            text: "A call moves through as many of these as it needs. Each one changes what is shown and is announced politely, naming the tool, so a reader who is not watching still learns what happened.",
          },
          {
            kind: "table",
            headers: ["Status", "Shows"],
            rows: [
              [
                "pending",
                "Queued. The input, and nothing that has happened yet.",
              ],
              [
                "running",
                "In flight, with a live duration if startedAt is set.",
              ],
              ["success", "The output, and the final duration."],
              ["error", "The failure message in place of the output."],
            ],
          },
          {
            kind: "text",
            text: "Pass startedAt while running and the duration counts up on its own; pass durationMs once it settles and that fixed figure is shown instead. Setting neither is fine -- the call simply reports no timing.",
          },
        ],
      },
      {
        id: "input-output",
        title: "Input and output",
        blocks: [
          {
            kind: "text",
            text: "Input is rendered for you: an object is formatted as JSON, a string is shown as it is. Output is not, because only you know whether the result is a table, a paragraph, or three files. Render it and pass it in.",
          },
          {
            kind: "code",
            code: `<ToolCall
  name="search_files"
  status="success"
  input={{ pattern: "nullable email", path: "migrations/" }}
  output={<FileTree nodes={matches} />}
  durationMs={340}
/>`,
          },
          {
            kind: "text",
            text: "There is no syntax highlighting on the input, and no dependency that would provide it. Keep what you pass small enough to read: the arguments that decide what the call did, not everything that was in scope.",
          },
        ],
      },
    ],
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
    sections: [
      {
        id: "numbering",
        title: "How references are numbered",
        blocks: [
          {
            kind: "text",
            text: "Numbers come from the position of a source in the sources array, not from the order the citations appear in the text. Two mentions of the same source are therefore the same number wherever they fall, and reordering a paragraph never renumbers anything.",
          },
          {
            kind: "code",
            code: `<InlineCitations sources={sources}>
  <p>
    The window is fifteen minutes <Citation id="rfc" />, and the counter
    resets on success <Citation id="rfc" /> rather than on expiry{" "}\n    <Citation id="notes" />.
  </p>
</InlineCitations>`,
            caption:
              "Both rfc marks read as the same number; notes takes the next one.",
          },
          {
            kind: "text",
            text: "It also means the array is the thing to sort. Put the sources in the order you want them listed -- by relevance, or by the order you expect them to be met -- and the marks follow.",
          },
        ],
      },
      {
        id: "sources",
        title: "Writing the source list",
        blocks: [
          {
            kind: "text",
            text: "A citation is only useful if it can be checked. Give every source a title that says what it is rather than where it lives, and a snippet holding the sentence the claim actually rests on, so a reader can judge it without leaving the page.",
          },
          {
            kind: "text",
            text: "Sources without a url still work, and are the right shape for an internal document or a passage retrieved from your own store. Hide the printed list with showSourceList={false} when you are rendering it yourself somewhere else on the page.",
          },
        ],
      },
    ],
    types: [
      {
        name: "CitationSource",
        rows: [
          ["id", "string", "What a citation mark refers to."],
          [
            "title",
            "string",
            "Shown in the list, and as the mark's accessible name.",
          ],
          ["url", "string", "Makes the entry a link. Optional."],
          ["snippet", "string", "The passage the claim rests on."],
        ],
      },
    ],
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
    sections: [
      {
        id: "coordinates",
        title: "Coordinate system",
        blocks: [
          {
            kind: "text",
            text: "Boxes are positioned in fractions of the image, not pixels. x and y are the top-left corner, width and height run from there, and every value is between 0 and 1. That is what lets the same box survive the image being resized, zoomed, or rendered at a different density.",
          },
          {
            kind: "code",
            code: `// Bottom-right quarter of the image, whatever size it renders at.
const box = { id: "total", x: 0.5, y: 0.5, width: 0.5, height: 0.5 }`,
          },
          {
            kind: "text",
            text: "Values outside the range are clamped rather than rejected, so a box that runs past an edge is drawn to the edge instead of spilling out of the frame.",
          },
          {
            kind: "text",
            text: "Detection models rarely hand you fractions. Divide by the page dimensions the model reported, not by the dimensions you are displaying at.",
          },
          {
            kind: "code",
            code: `const boxes = predictions.map((prediction) => ({
  id: prediction.id,
  label: prediction.field,
  x: prediction.left / page.width,
  y: prediction.top / page.height,
  width: prediction.width / page.width,
  height: prediction.height / page.height,
}))`,
            caption: "Converting pixel output from a document model.",
          },
        ],
      },
      {
        id: "tones",
        title: "Tones",
        blocks: [
          {
            kind: "text",
            text: "Each box takes a tone, which sets its border and fill. Tone is decoration: the label carries the meaning, so a box never depends on colour to be understood.",
          },
          {
            kind: "table",
            headers: ["Tone", "Reads as"],
            rows: [
              ["default", "An ordinary extraction."],
              ["accent", "Something confirmed, or the field in hand."],
              ["warning", "Low confidence, or a value that needs a human."],
            ],
          },
        ],
      },
    ],
    types: [
      {
        name: "BoundingBox",
        rows: [
          ["id", "string", "Unique within the set. Drives selection."],
          ["label", "string", "Shown on the box, and read as its name."],
          [
            "tone",
            '"default" | "accent" | "warning"',
            'Border and fill. Defaults to "default".',
          ],
          [
            "x, y",
            "number",
            "Top-left corner as a fraction of the image, from 0 to 1.",
          ],
          [
            "width, height",
            "number",
            "Size as a fraction of the image, from 0 to 1.",
          ],
        ],
      },
    ],
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
    sections: [
      {
        id: "coordinates",
        title: "Coordinate system",
        blocks: [
          {
            kind: "text",
            text: "Annotations are stored as fractions of the image rather than pixels: x and y are the top-left corner, width and height run from there, and everything sits between 0 and 1. A note therefore stays on the same words when the image is resized, zoomed, or rendered on a denser screen, and the same numbers survive being stored and read back at another size.",
          },
          {
            kind: "code",
            code: `// A note over the middle of the page, whatever it renders at.
const annotation = {
  id: "clause-4",
  x: 0.25,
  y: 0.4,
  width: 0.5,
  height: 0.08,
  note: "Check this against the master agreement",
  author: "Aman",
}`,
          },
        ],
      },
      {
        id: "drawing",
        title: "Drawing and storing",
        blocks: [
          {
            kind: "text",
            text: "The component holds no list of its own. Dragging on the image calls onCreate with the rectangle, and it is yours to store, give an id, and pass back in. Nothing appears until you do, which is what lets you await a save and show a failure instead of a note that was never kept.",
          },
          {
            kind: "code",
            code: `async function onCreate(rect) {
  const saved = await api.annotate({ ...rect, note: await ask() })
  setAnnotations((current) => [...current, saved])
}`,
          },
          {
            kind: "text",
            text: "readOnly keeps the notes visible and stops new ones being drawn, which is the right mode for anyone without permission to comment. minSize discards a stray click that would leave an annotation too small to find again.",
          },
        ],
      },
    ],
    types: [
      {
        name: "Annotation",
        rows: [
          ["id", "string", "Unique within the set. Drives selection."],
          [
            "x, y",
            "number",
            "Top-left corner as a fraction of the image, from 0 to 1.",
          ],
          [
            "width, height",
            "number",
            "Size as a fraction of the image, from 0 to 1.",
          ],
          ["note", "string", "The comment itself."],
          ["author", "string", "Who left it."],
        ],
      },
    ],
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
    featured: true,
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
    sections: [
      {
        id: "not-redaction",
        title: "This hides, it does not remove",
        blocks: [
          {
            kind: "text",
            text: "The black boxes are drawn over an image in the browser. Nothing about the file underneath changes. If you serve the original alongside the regions, everyone still has the unredacted document, and a reader who opens it directly, saves the image, or asks the network tab will see exactly what you meant to hide.",
          },
          {
            kind: "text",
            text: "Treat this component as the place where a person decides what to hide, and treat the regions it produces as instructions for a server that then does the hiding for real: rasterising the page with the pixels removed, or stripping the text from the source before the file is ever sent.",
          },
          {
            kind: "list",
            items: [
              "Never send the original to a client that is only allowed to see the redacted version.",
              "Burn the redaction into the pixels on the server, then delete the original from anything the client can reach.",
              "For a PDF, removing the drawn rectangle is not enough -- the text layer beneath it has to go too, or the words remain selectable.",
            ],
          },
          {
            kind: "text",
            text: "The reveal control exists for the person doing the redacting, so they can check their own work. It is not a permission boundary, and anything it can show was already in the page.",
          },
        ],
      },
      {
        id: "regions",
        title: "Regions",
        blocks: [
          {
            kind: "text",
            text: "Regions are fractions of the image, from 0 to 1, and are clamped into that range rather than rejected. That keeps them correct as the image is resized, and it means the same numbers can be handed to a server that renders the page at a completely different scale.",
          },
          {
            kind: "code",
            code: `function onCreate(rect) {
  setRegions((current) => [
    ...current,
    { id: crypto.randomUUID(), reason: "Bank details", ...rect },
  ])
}`,
            caption:
              "onCreate hands you the drawn rectangle; you decide what it means and keep it.",
          },
          {
            kind: "text",
            text: "minSize rejects an accidental click that would otherwise leave an invisible region behind. Give a reason where you can: it is what makes an audit of what was hidden, and why, possible later.",
          },
        ],
      },
    ],
    types: [
      {
        name: "RedactionRegion",
        rows: [
          ["id", "string", "Unique within the set. Used to delete."],
          [
            "x, y",
            "number",
            "Top-left corner as a fraction of the image, from 0 to 1.",
          ],
          [
            "width, height",
            "number",
            "Size as a fraction of the image, from 0 to 1.",
          ],
          [
            "reason",
            "string",
            "Why this was hidden. Worth recording for an audit.",
          ],
        ],
      },
    ],
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
    sections: [
      {
        id: "shape",
        title: "Building the tree",
        blocks: [
          {
            kind: "text",
            text: "Nodes nest through children. A node is treated as a folder when it has a children array -- including an empty one -- so an empty folder is spelled children: [] rather than left out. Set kind explicitly when you want a folder that has not loaded its contents yet to still look like a folder.",
          },
          {
            kind: "code",
            code: `const nodes = [
  {
    id: "app",
    name: "app",
    children: [
      { id: "app/page.tsx", name: "page.tsx", meta: "2.4 kB" },
      { id: "app/api", name: "api", children: [] },
    ],
  },
  { id: "README.md", name: "README.md" },
]`,
          },
          {
            kind: "text",
            text: "Ids must be unique across the whole tree, not just among siblings, because expansion and selection are tracked by id. Paths make good ids for that reason.",
          },
        ],
      },
      {
        id: "loading",
        title: "Loading children on demand",
        blocks: [
          {
            kind: "text",
            text: "The component renders the nodes it is given and does not fetch anything. To fill a folder when it opens, control expansion and replace that node's children as the answer arrives.",
          },
          {
            kind: "code",
            code: `const [expandedIds, setExpandedIds] = useState<string[]>([])

async function onExpandedChange(ids: string[]) {
  const opened = ids.find((id) => !expandedIds.includes(id))
  setExpandedIds(ids)

  if (opened && !loaded.has(opened)) {
    setNodes(await withChildren(opened, await listDirectory(opened)))
  }
}`,
            caption:
              "Give the folder a spinner in meta while its request is in flight.",
          },
        ],
      },
    ],
    types: [
      {
        name: "FileTreeNode",
        rows: [
          ["id", "string", "Unique across the whole tree. Paths work well."],
          ["name", "string", "The label."],
          [
            "kind",
            '"file" | "folder"',
            "Overrides the guess made from children.",
          ],
          [
            "children",
            "FileTreeNode[]",
            "Present, even empty, means a folder.",
          ],
          ["meta", "ReactNode", "Trailing detail such as a size or a status."],
          ["icon", "ReactNode", "Replaces the default file or folder mark."],
        ],
      },
    ],
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
    sections: [
      {
        id: "output",
        title: "The shape it produces",
        blocks: [
          {
            kind: "text",
            text: "Fields come back as a tree, in the order they were arranged. Object and array fields nest through their own fields array, and everything else is a leaf. This is deliberately not JSON Schema: it is small enough to read, and short enough to convert into whatever your extractor actually wants.",
          },
          {
            kind: "code",
            code: `const fields = [
  { id: "1", name: "total", type: "number", required: true },
  {
    id: "2",
    name: "supplier",
    type: "object",
    fields: [
      { id: "3", name: "name", type: "string", required: true },
      { id: "4", name: "vat", type: "string" },
    ],
  },
]`,
          },
          {
            kind: "text",
            text: "Six types are offered by default -- string, number, boolean, date, object, and array. Narrow that with types when your extractor supports fewer, and cap nesting with maxDepth so nobody builds a structure the other end cannot represent.",
          },
        ],
      },
      {
        id: "ids",
        title: "Ids for new fields",
        blocks: [
          {
            kind: "text",
            text: "New fields need an id, and the default generator is fine for a form whose result is read once. Pass createId when the ids are going to outlive the page -- stored, compared, or sent somewhere that expects them to be stable.",
          },
          {
            kind: "code",
            code: `<SchemaBuilder
  defaultFields={fields}
  createId={() => crypto.randomUUID()}
  onFieldsChange={save}
/>`,
            caption:
              "crypto.randomUUID is available in the browser and on modern Node.",
          },
        ],
      },
    ],
    types: [
      {
        name: "SchemaField",
        rows: [
          ["id", "string", "Unique across the whole tree."],
          ["name", "string", "The field name as it will be extracted."],
          [
            "type",
            "SchemaFieldType",
            "string, number, boolean, date, object, or array.",
          ],
          [
            "description",
            "string",
            "A hint for whoever, or whatever, fills it.",
          ],
          ["required", "boolean", "Marks the field as expected."],
          ["fields", "SchemaField[]", "Children, on an object or an array."],
        ],
      },
    ],
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
    sections: [
      {
        id: "value",
        title: "What you get back",
        blocks: [
          {
            kind: "text",
            text: "onChange reports the whole signature or null when it is cleared. A drawn signature arrives as a PNG data URL; a typed one arrives as the text, leaving the rendering to you. The mode tells you which of the two you are holding, so you never have to guess from which field is set.",
          },
          {
            kind: "code",
            code: `<SignaturePad
  onChange={(value) => {
    if (!value) return clear()
    if (value.mode === "draw") return save({ image: value.dataUrl })
    save({ typed: value.text })
  }}
/>`,
          },
          {
            kind: "text",
            text: "Store the typed variant as text rather than as a picture of text. It stays searchable, it survives a font change, and you can render it at whatever size the document needs.",
          },
        ],
      },
      {
        id: "canvas",
        title: "Sharpness",
        blocks: [
          {
            kind: "text",
            text: "The canvas is sized to the device pixel ratio and the drawing context scaled to match, so strokes are sharp on a retina screen instead of soft. That also means the exported PNG comes out at the device's resolution, not at the CSS size: on a 2x screen a 480 by 180 pad exports 960 by 360.",
          },
          {
            kind: "text",
            text: "Size for that if the image is going into a printed document, and remember the export carries whatever penColor and lineWidth were set, on a transparent background.",
          },
        ],
      },
    ],
    types: [
      {
        name: "SignatureValue",
        rows: [
          ["mode", '"draw" | "type"', "Which kind of signature this is."],
          ["dataUrl", "string", "PNG data URL, on a drawn signature."],
          ["text", "string", "The typed name, on a typed signature."],
        ],
      },
    ],
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
    sections: [
      {
        id: "parsing",
        title: "Parsing",
        blocks: [
          {
            kind: "text",
            text: "papaparse is an optional peer, imported the first time a source is parsed and never bundled for anyone who does not open a CSV. Without it installed, and without a parser of your own, the component says so rather than failing quietly.",
          },
          {
            kind: "text",
            text: "Pass table when the data is already parsed -- from your API, from a worker, from a database -- and no parser is involved at all. Pass parser to use something else, or to parse somewhere that will not block the page.",
          },
          {
            kind: "code",
            code: `<CsvViewer
  source={file}
  parser={async (input) => {
    const { fields, rows } = await parseInWorker(input)
    return { fields, rows }
  }}
/>`,
            caption:
              "A parser returns { fields, rows }; how it gets there is up to you.",
          },
          {
            kind: "text",
            text: "Delimiters, quoting, and encoding are the parser's business, not the viewer's. papaparse detects the common ones; a file that needs a fixed delimiter or a particular encoding is a good reason to pass your own.",
          },
        ],
      },
      {
        id: "size",
        title: "Large files",
        blocks: [
          {
            kind: "text",
            text: "Every row given to the component is rendered. maxRows caps what is shown, which keeps a large file from putting hundreds of thousands of cells into the page, and is the difference between a preview that opens instantly and a tab that stops responding.",
          },
          {
            kind: "text",
            text: "Treat this as a preview of a file rather than a spreadsheet. When someone needs to work through all of it, page or virtualise on your side and hand the viewer one page at a time.",
          },
        ],
      },
    ],
    types: [
      {
        name: "CsvTable",
        rows: [
          ["fields", "string[]", "Column headers, in order."],
          ["rows", "string[][]", "Cells per row, aligned to fields."],
        ],
      },
    ],
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
    sections: [
      {
        id: "rendering",
        title: "What actually reaches the page",
        blocks: [
          {
            kind: "text",
            text: "mammoth converts a .docx into an HTML string. That string is never handed to the browser as markup. It is parsed, walked, and rebuilt as React elements, keeping only tags on an allowlist and only attributes allowed for each of those tags, so a document from someone else cannot introduce script, styling, or event handlers into your page.",
          },
          {
            kind: "list",
            items: [
              "Elements outside the allowlist are dropped, and script and style subtrees are dropped whole rather than unwrapped.",
              "href values are checked, and javascript: links are stripped.",
              "Whitespace-only text between structural tags is discarded, so tables and lists do not inherit stray gaps.",
            ],
          },
          {
            kind: "text",
            text: "Widen or narrow the allowlist with allowedTags when your documents need something more, and keep it as small as the documents allow.",
          },
        ],
      },
      {
        id: "fidelity",
        title: "Fidelity",
        blocks: [
          {
            kind: "text",
            text: "This is a structural view, not a page-faithful one. Headings, lists, tables, links, and emphasis survive; page geometry does not. Fonts, margins, columns, headers and footers, page breaks, and anything positioned absolutely are lost, because the source markup does not carry them.",
          },
          {
            kind: "text",
            text: "When the layout is the point -- a contract that must look like the signed copy -- convert to PDF on the server and use the PDF Viewer instead.",
          },
        ],
      },
    ],
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
    sections: [
      {
        id: "worker",
        title: "The worker",
        blocks: [
          {
            kind: "text",
            text: "pdf.js renders on a background worker, and it cannot find that worker on its own once your code has been bundled. This is the one thing that reliably goes wrong: without workerSrc the viewer fails at the first document, usually with a message about a missing or mismatched worker.",
          },
          {
            kind: "text",
            text: "Point it at a copy of the worker you serve yourself. Copy the file out of pdfjs-dist at build time rather than linking a CDN, so the worker version can never drift from the library version.",
          },
          {
            kind: "code",
            code: `// scripts/copy-pdf-worker.mjs
import { copyFile } from "node:fs/promises"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const worker = require.resolve("pdfjs-dist/build/pdf.worker.min.mjs")

await copyFile(worker, "public/pdf.worker.min.mjs")`,
            caption:
              'Run it from your build script, then pass workerSrc="/pdf.worker.min.mjs".',
          },
        ],
      },
      {
        id: "loader",
        title: "Bringing your own loader",
        blocks: [
          {
            kind: "text",
            text: "pdfjs-dist is an optional peer, imported dynamically the first time a document opens. Supply loader and it is never imported at all, which is how you swap in your own renderer, reuse a document you already have open, or keep the dependency out of the build entirely.",
          },
          {
            kind: "code",
            code: `<PdfViewer
  document={openedElsewhere}
  loader={async (source) => myPdfLibrary.open(source)}
/>`,
          },
          {
            kind: "text",
            text: "Pass document when you already hold an open handle. The loader is skipped and the viewer renders straight from it.",
          },
        ],
      },
      {
        id: "text",
        title: "What a canvas cannot do",
        blocks: [
          {
            kind: "text",
            text: "Pages are painted to a canvas, so the words in them are pixels. Nothing on the page can be selected, copied, searched with find-in-page, or read by a screen reader, and no amount of ARIA changes that.",
          },
          {
            kind: "text",
            text: "When the text has to be reachable, pair the viewer with something that carries it: a text layer positioned over the canvas, an extracted transcript beside it, or a link to download the original. Treat this as a requirement rather than an enhancement if the document is the content of your page.",
          },
        ],
      },
    ],
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
    featured: true,
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
  {
    slug: "code-block",
    kind: "component",
    name: "Code Block",
    family: "Code",
    summary:
      "A code panel with copy, optional line numbers, highlighted lines, and a collapse for anything long.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("code-block"),
    npmImport: packageImport("CodeBlock", "code-block"),
    usage: `export function Snippet() {
  return (
    <CodeBlock
      code={source}
      filename="server.ts"
      showLineNumbers
      highlightLines={[4, 5]}
      maxLines={12}
    />
  )
}`,
    sections: [
      {
        id: "highlighting",
        title: "On syntax highlighting",
        blocks: [
          {
            kind: "text",
            text: "There is none, and that is deliberate. Every highlighter worth using is larger than this entire library, and one baked in would be paid for by everyone who only wanted a copy button. The component is a place to put code, not an opinion about how code should be coloured.",
          },
          {
            kind: "text",
            text: "When you do want it, highlight on the server and pass the result as children of your own pre, or reach for shiki or Prism directly. The language prop is a label rather than an instruction -- nothing reads it but the header.",
          },
        ],
      },
      {
        id: "long",
        title: "Long code",
        blocks: [
          {
            kind: "text",
            text: "maxLines collapses anything past a point behind a toggle that says how much is hidden, and the copy button always copies the whole source rather than the visible part. Combine it with wrappable when lines are long as well as many, so the reader can choose between scrolling sideways and reading wrapped.",
          },
          {
            kind: "code",
            code: `<CodeBlock
  code={source}
  filename="server.ts"
  showLineNumbers
  highlightLines={[12, 13]}
  maxLines={20}
  wrappable
/>`,
            caption: "highlightLines is one-based, matching the gutter.",
          },
        ],
      },
    ],
    props: [
      [
        "code",
        "string",
        "The source to render. A single trailing newline is dropped.",
      ],
      [
        "filename",
        "string",
        "Shown in the header, and preferred over language.",
      ],
      [
        "language",
        "string",
        "A short label such as tsx, used when there is no filename.",
      ],
      [
        "showLineNumbers",
        "boolean",
        "Adds a gutter sized to the highest line number.",
      ],
      [
        "highlightLines",
        "number[]",
        "One-based lines to mark as the interesting ones.",
      ],
      [
        "maxLines",
        "number",
        "Collapses anything past this many lines behind a toggle.",
      ],
      [
        "wrap, wrappable",
        "boolean, boolean",
        "Wrap long lines, and offer a control that overrides it.",
      ],
      ["copyable", "boolean", "Shows the copy control. Defaults to true."],
      ["actions", "ReactNode", "Extra controls placed in the header."],
    ],
    accessibility:
      "The code region is focusable so it can be scrolled from the keyboard. Copying announces itself through a polite live region, and the copy control renames itself once it succeeds. Line numbers and the diff-style gutter are aria-hidden, so a screen reader reads the source rather than the decoration. There is no syntax highlighting and no highlighting dependency.",
  },
  {
    slug: "diff-view",
    kind: "component",
    name: "Diff View",
    family: "Code",
    summary:
      "A proposed change shown as a unified or side-by-side diff, with optional accept and reject controls.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("diff-view"),
    npmImport: packageImport("DiffView", "diff-view"),
    usage: `export function Review() {
  return (
    <DiffView
      filename="server.ts"
      before={original}
      after={proposed}
      onAccept={apply}
      onReject={discard}
    />
  )
}`,
    sections: [
      {
        id: "algorithm",
        title: "How the diff is computed",
        blocks: [
          {
            kind: "text",
            text: "Diffing happens by line, and only when you do not supply hunks yourself. Matching lines at the start and end are peeled off first, so an edit to one line of a long file only ever costs the length of that file. What is left in the middle goes through a longest-common-subsequence table.",
          },
          {
            kind: "text",
            text: "That table is quadratic, so it is capped: past two million cells the two middles are reported as one wholesale replacement instead of a line-by-line match. You will only meet this with two large and almost entirely different files, and the output stays correct -- it simply stops being minimal.",
          },
          {
            kind: "text",
            text: "diffLines and toHunks are exported, so you can run the same diff outside the component -- to count what changed before deciding whether to show anything at all.",
          },
          {
            kind: "code",
            code: `import { diffLines, toHunks } from "mischief-ui/diff-view"

const lines = diffLines(before, after)
const changed = lines.filter((line) => line.kind !== "context")

if (changed.length > 0) {
  show(toHunks(lines, 3))
}`,
          },
        ],
      },
      {
        id: "hunks",
        title: "Bringing your own hunks",
        blocks: [
          {
            kind: "text",
            text: "Pass hunks and the built-in diff is skipped entirely. This is the path to take when something upstream has already done the work and done it better -- git, a language server, or a model that returned a patch -- or when you want word-level detail the line diff cannot produce.",
          },
          {
            kind: "code",
            code: `<DiffView
  filename="lib/total.ts"
  hunks={parseUnifiedDiff(patch)}
/>`,
            caption:
              "Supplied hunks win over before and after, which may then be omitted.",
          },
          {
            kind: "text",
            text: "Line numbers come from beforeNumber and afterNumber on each line rather than being counted, so a hunk starting at line 400 reads as line 400.",
          },
        ],
      },
    ],
    types: [
      {
        name: "DiffLine",
        rows: [
          [
            "kind",
            '"context" | "add" | "remove"',
            "What happened to this line.",
          ],
          ["text", "string", "The line, without its ending."],
          [
            "beforeNumber",
            "number",
            "Line number on the old side. Absent on an addition.",
          ],
          [
            "afterNumber",
            "number",
            "Line number on the new side. Absent on a removal.",
          ],
        ],
      },
      {
        name: "DiffHunk",
        rows: [
          [
            "header",
            "string",
            "The band above the hunk. Generated when omitted.",
          ],
          ["lines", "DiffLine[]", "The lines in order, context included."],
        ],
      },
    ],
    props: [
      [
        "before, after",
        "string, string",
        "The two sides. Diffed by line when no hunks are given.",
      ],
      [
        "hunks",
        "DiffHunk[]",
        "Precomputed hunks, which win over before and after.",
      ],
      [
        "filename",
        "string",
        "Shown in the header. Falls back to Proposed change.",
      ],
      ["view", '"unified" | "split"', 'Layout. Defaults to "unified".'],
      [
        "context",
        "number",
        "Unchanged lines kept either side of a change. Defaults to 3.",
      ],
      [
        "showLineNumbers",
        "boolean",
        "Shows the number gutters. Defaults to true.",
      ],
      [
        "onAccept, onReject",
        "() => void, () => void",
        "Adds the decision footer when either is given.",
      ],
      [
        "status",
        '"pending" | "accepted" | "rejected"',
        "Replaces the controls with the outcome.",
      ],
    ],
    accessibility:
      "The diff is a table with a caption naming the file and the added and removed counts, so it can be read without colour. Every line carries a + or - marker alongside its tint for the same reason. Line numbers are aria-hidden decoration. Once a decision is made the outcome is announced through a status region.",
  },
  {
    slug: "terminal-output",
    kind: "component",
    name: "Terminal Output",
    family: "Code",
    summary:
      "Streaming command output with stderr called out, an exit code, and scroll that follows without trapping you.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("terminal-output"),
    npmImport: packageImport("TerminalOutput", "terminal-output"),
    usage: `export function Install() {
  return (
    <TerminalOutput
      command="pnpm install"
      output={lines}
      running={pending}
      exitCode={code}
    />
  )
}`,
    sections: [
      {
        id: "streaming",
        title: "Streaming output",
        blocks: [
          {
            kind: "text",
            text: "Append to the array as lines arrive and the log grows. Keep running true until the command settles, then pass its exit code -- that is what turns the running indicator into a result.",
          },
          {
            kind: "code",
            code: `const [lines, setLines] = useState<TerminalLine[]>([])
const [exitCode, setExitCode] = useState<number>()

for await (const chunk of process.stdout) {
  setLines((current) => [...current, { text: chunk }])
}`,
          },
          {
            kind: "text",
            text: "Send stderr through with stream set, rather than merging both into one string, so failures stay distinguishable after the fact.",
          },
        ],
      },
      {
        id: "following",
        title: "Following, and when it stops",
        blocks: [
          {
            kind: "text",
            text: "The log sticks to the newest line while it is already at the bottom. The moment the reader scrolls up it stops following, and it resumes when they come back within a couple of dozen pixels of the end. Reading back through output is therefore never interrupted by more of it arriving.",
          },
          {
            kind: "text",
            text: "ANSI escape sequences are stripped rather than rendered, so colour codes from a shell do not appear as noise. Colour is not reconstructed: stderr is distinguished, and nothing else is.",
          },
        ],
      },
    ],
    types: [
      {
        name: "TerminalLine",
        rows: [
          [
            "text",
            "string",
            "One line, without its ending. ANSI escapes are stripped.",
          ],
          [
            "stream",
            '"stdout" | "stderr"',
            'Which stream it came from. Defaults to "stdout".',
          ],
        ],
      },
    ],
    props: [
      [
        "output",
        "string | (TerminalLine | string)[]",
        "A plain string is split on newlines as stdout.",
      ],
      [
        "command",
        "string",
        "The command that produced the output, shown above it.",
      ],
      [
        "cwd",
        "string",
        "Working directory, shown beside the command on wider screens.",
      ],
      [
        "running",
        "boolean",
        "Shows the running indicator and marks the log busy.",
      ],
      [
        "exitCode",
        "number",
        "Shown once settled. Anything other than zero reads as a failure.",
      ],
      [
        "maxHeight",
        "number | string",
        'Height before the log scrolls. Defaults to "18rem".',
      ],
      ["follow", "boolean", "Keeps the newest line in view. Defaults to true."],
    ],
    accessibility:
      "Output is a log region marked busy while the command runs, so assistive technology reads new lines without the page stealing focus. stderr is distinguished by a data attribute as well as colour. Following is abandoned the moment the reader scrolls up and resumes when they return to the bottom, so reading back is never interrupted. ANSI escape sequences are stripped rather than rendered.",
  },
  {
    slug: "response-actions",
    kind: "component",
    name: "Response Actions",
    family: "Agent UI",
    summary:
      "The row under an answer: copy it, ask again, and rate it. Drops into the actions slot on Message.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("response-actions"),
    npmImport: packageImport("ResponseActions", "response-actions"),
    usage: `export function Answer() {
  return (
    <Message
      role="assistant"
      actions={
        <ResponseActions
          copyText={answer}
          onRetry={regenerate}
          onFeedbackChange={record}
        />
      }
    >
      {answer}
    </Message>
  )
}`,
    props: [
      [
        "copyText",
        "string",
        "Copies this text. The copy control is absent without it.",
      ],
      ["onRetry", "() => void", "Adds the try-again control."],
      ["retryLabel", "string", 'Names that control. Defaults to "Try again".'],
      [
        "onFeedbackChange",
        "(feedback: ResponseFeedback) => void",
        "Turns the rating controls on.",
      ],
      [
        "feedback, defaultFeedback",
        '"up" | "down" | null',
        "Controlled and uncontrolled rating.",
      ],
      ["label", "string", "Names the group. Defaults to Response actions."],
    ],
    accessibility:
      "The row is a labelled group of named buttons, so each one reads on its own. Ratings are toggles carrying aria-pressed, and choosing the current rating again clears it. Copying announces itself through a polite live region. The controls are 32px, matching the other compact toolbars in this set rather than the 44px targets used for primary actions; pass a className to enlarge them where this row is the main way to act.",
  },
  {
    slug: "theme-toggle",
    kind: "component",
    name: "Theme Toggle",
    family: "Controls",
    summary:
      "A light and dark switch that survives a reload, follows the system when asked, and stays in step across tabs.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("theme-toggle"),
    npmImport: packageImport("ThemeToggle", "theme-toggle"),
    usage: `export function Header() {
  return <ThemeToggle modes={["light", "dark", "system"]} />
}`,
    sections: [
      {
        id: "flash",
        title: "Stopping the flash",
        blocks: [
          {
            kind: "text",
            text: "The toggle cannot prevent a flash of the wrong theme on the first paint, and no component can. The server has no way to know what the reader chose, so the page ships in one theme and corrects itself once React takes over -- which is late enough to see.",
          },
          {
            kind: "text",
            text: "Fixing it means setting the class before the page paints, with a small blocking script in the document head. This runs once, before anything is rendered, and matches what applyTheme does afterwards.",
          },
          {
            kind: "code",
            code: `// app/layout.tsx
const setTheme = \`(() => {
  try {
    const stored = localStorage.getItem("theme")
    const dark = stored
      ? stored === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches
    document.documentElement.classList.toggle("dark", dark)
    document.documentElement.style.colorScheme = dark ? "dark" : "light"
  } catch {}
})()\`

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: setTheme }} />
      </head>
      <body>{children}</body>
    </html>
  )
}`,
            caption:
              "Keep the storage key and class in step with the props you pass the toggle.",
          },
          {
            kind: "text",
            text: "suppressHydrationWarning belongs on the html element because the script has changed it before React compares. It applies to that element only, not to your tree.",
          },
        ],
      },
      {
        id: "modes",
        title: "Modes",
        blocks: [
          {
            kind: "text",
            text: "The default is a plain light and dark switch. Include system and the toggle gains a third state that clears the stored choice and hands the decision back to the operating system, tracking later changes to it while the page is open.",
          },
          {
            kind: "text",
            text: "With nothing stored, the toggle starts on system when system is one of its modes. The first click therefore moves to whatever follows system in your list, not to the first mode in it.",
          },
        ],
      },
    ],
    props: [
      [
        "modes",
        "ThemeMode[]",
        'Modes to cycle through. Defaults to ["light", "dark"].',
      ],
      [
        "storageKey",
        "string",
        'Where the choice is remembered. Defaults to "theme".',
      ],
      [
        "darkClass",
        "string",
        'Class placed on the root element. Defaults to "dark".',
      ],
      [
        "onThemeChange",
        "(mode: ThemeMode) => void",
        "Called after the mode is applied.",
      ],
      [
        "icons",
        "Partial<Record<ThemeMode, ReactNode>>",
        "Replaces the icon for any mode.",
      ],
      [
        "labels",
        "Partial<Record<ThemeMode, string>>",
        "Renames a mode in the accessible label.",
      ],
    ],
    accessibility:
      "The button is named for what it will do next rather than the current state, so it never reads as a checkbox that lies. Reading the mode goes through useSyncExternalStore, so the server renders the first mode and the client corrects it on hydration without a flash of the wrong icon. Storage events keep other tabs in step, and the system preference is watched while system is one of the modes. Refusing storage in private browsing is caught, and the choice still holds for the page.",
  },
  {
    slug: "accordion",
    kind: "component",
    name: "Accordion",
    family: "Controls",
    summary:
      "A list of disclosures built on native details elements, so find-in-page and the browser do the work.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("accordion"),
    npmImport: packageImport("Accordion", "accordion"),
    usage: `export function Faq() {
  return (
    <Accordion
      items={questions}
      defaultOpen={["licence"]}
    />
  )
}`,
    props: [
      ["items", "AccordionItem[]", "Each with an id, a title, and content."],
      [
        "exclusive",
        "boolean",
        "Keeps one panel open at a time. Defaults to true.",
      ],
      ["defaultOpen", "string[]", "Ids open on first render."],
      [
        "icon",
        "ReactNode",
        "Replaces the plus marker, which rotates when open.",
      ],
      [
        "onToggle",
        "(id: string, open: boolean) => void",
        "Called whenever a panel opens or closes.",
      ],
    ],
    accessibility:
      "Open and closed state, keyboard handling, and expansion during find-in-page all come from the native disclosure element rather than scripted state, so the panel content stays searchable while collapsed. Exclusivity uses the shared name attribute for the same reason. Summaries are 44px targets with a visible focus ring, and the marker is decoration the screen reader skips.",
  },
  {
    slug: "component-preview",
    kind: "component",
    name: "Component Preview",
    family: "Docs",
    summary:
      "A framed example with a tab for the source beside it, and the live one still running when you switch back.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("component-preview"),
    npmImport: packageImport("ComponentPreview", "component-preview"),
    usage: `export function Example() {
  return (
    <ComponentPreview code={source} title="Hold Button">
      <HoldButton onComplete={remove}>Delete</HoldButton>
    </ComponentPreview>
  )
}`,
    props: [
      ["children", "ReactNode", "The living example."],
      [
        "code",
        "string",
        "Source for the second tab. Without it there is only the preview.",
      ],
      ["title", "ReactNode", "Shown at the start of the toolbar."],
      [
        "defaultView",
        '"preview" | "code"',
        'Which tab opens first. Defaults to "preview".',
      ],
      ["previewLabel, codeLabel", "string, string", "Renames the two tabs."],
      [
        "actions",
        "ReactNode",
        "Extra toolbar controls, such as a restart button.",
      ],
      ["align", '"center" | "start"', "How the example sits in its frame."],
      ["frameClassName", "string", "Classes for the preview frame itself."],
    ],
    accessibility:
      "The two views are a real tablist: Left and Right Arrow move between tabs, only the selected tab is in the tab order, and each panel is labelled by its tab. The preview panel is hidden rather than unmounted while the source shows, so anything set up in the example is still there on the way back. Copying announces itself through a polite live region.",
  },
  {
    slug: "kbd",
    kind: "component",
    name: "Kbd",
    family: "Docs",
    summary:
      "A keyboard chord rendered with the right glyphs for the reader's platform, and spoken in words.",
    dependencies: [],
    install: registryInstallCommand("kbd"),
    npmImport: packageImport("Kbd", "kbd"),
    usage: `export function Hint() {
  return (
    <p>
      Press <Kbd keys="Mod+K" /> to search.
    </p>
  )
}`,
    props: [
      [
        "keys",
        "string | string[]",
        'A chord such as "Mod+K", or the keys already split apart.',
      ],
      [
        "platform",
        '"auto" | "mac" | "other"',
        "Overrides detection. Defaults to auto.",
      ],
      ["separator", "ReactNode", "Placed between keys. Omitted by default."],
    ],
    accessibility:
      'Glyphs are decoration: the chord is also written out for a screen reader, so it hears "Command plus K" rather than a symbol it cannot pronounce. Detection runs through useSyncExternalStore, so the server renders the portable names and the client swaps in the Mac glyphs on hydration. Mod resolves to Command on Apple platforms and Control everywhere else.',
  },
  {
    slug: "stop-generating",
    kind: "component",
    name: "Stop Generating",
    family: "Agent UI",
    summary:
      "The control that interrupts a running answer, with the time it has been going and Escape wired up.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("stop-generating"),
    npmImport: packageImport("StopGenerating", "stop-generating"),
    usage: `export function Composer() {
  return (
    <StopGenerating
      running={streaming}
      startedAt={startedAt}
      onStop={abort}
    />
  )
}`,
    props: [
      [
        "onStop",
        "() => void",
        "Called on click, and on Escape while the shortcut is on.",
      ],
      ["running", "boolean", "Renders nothing while false. Defaults to true."],
      [
        "startedAt",
        "number",
        "Epoch milliseconds. Drives the live elapsed reading.",
      ],
      [
        "showElapsed",
        "boolean",
        "Shows the elapsed seconds. Defaults to true.",
      ],
      ["shortcut", "boolean", "Binds Escape while running. Defaults to true."],
      ["label", "string", 'Names the control. Defaults to "Stop generating".'],
    ],
    accessibility:
      "The control disappears rather than dimming when there is nothing to stop, so it is never a button that does nothing. Escape is bound only while running and unbound as soon as it stops. The latest handler is read through a ref, so a changing callback never rebinds the key or leaves a stale one behind. The elapsed reading is decoration beside the name, not the name itself.",
  },
  {
    slug: "token-meter",
    kind: "component",
    name: "Token Meter",
    family: "Agent UI",
    summary:
      "How much of the context window is gone, split by what spent it, and a warning before it runs out.",
    dependencies: [],
    install: registryInstallCommand("token-meter"),
    npmImport: packageImport("TokenMeter", "token-meter"),
    usage: `export function Usage() {
  return (
    <TokenMeter
      limit={200_000}
      segments={[
        { label: "System", value: 4_200 },
        { label: "History", value: 96_000 },
      ]}
    />
  )
}`,
    props: [
      ["limit", "number", "The window. Values at or past it read as full."],
      ["used", "number", "Total consumed. Ignored when segments are given."],
      [
        "segments",
        "TokenSegment[]",
        "Named parts that sum to the total, each with its own colour.",
      ],
      [
        "warnAt",
        "number",
        "Fraction of the limit that reads as tight. Defaults to 0.8.",
      ],
      [
        "format",
        "(value: number) => string",
        "Formats both numbers. Defaults to a compact form.",
      ],
      ["label", "string", 'Names the meter. Defaults to "Context used".'],
      ["showLegend", "boolean", "Shows the segment key. Defaults to true."],
    ],
    accessibility:
      "The bar carries meter semantics with its real minimum, maximum, and current value, plus text saying the same thing in words and a percentage, so it is never read by colour alone. Segment colours are repeated in a written key. The bar animates its width and stops doing so under reduced motion.",
  },
  {
    slug: "model-picker",
    kind: "component",
    name: "Model Picker",
    family: "Agent UI",
    summary:
      "A model chooser that has room for what each one is good at, and full keyboard control.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("model-picker"),
    npmImport: packageImport("ModelPicker", "model-picker"),
    usage: `export function Chooser() {
  return (
    <ModelPicker
      models={models}
      defaultValue="opus"
      onValueChange={setModel}
    />
  )
}`,
    sections: [
      {
        id: "describing",
        title: "Describing the models",
        blocks: [
          {
            kind: "text",
            text: "The reason to use a listbox rather than a select element is the room it gives you: a sentence about what each model is for, and a few tags for what it can do. Write the description for someone deciding, not for someone who already knows -- speed, depth, and cost are what people are actually choosing between.",
          },
          {
            kind: "code",
            code: `const models = [
  {
    id: "opus",
    name: "Opus",
    description: "The deepest reasoning, for work worth the wait.",
    badges: ["reasoning", "vision"],
  },
  {
    id: "haiku",
    name: "Haiku",
    description: "Quick answers where latency matters more than depth.",
    badges: ["fast"],
  },
  { id: "legacy", name: "Legacy", disabled: true },
]`,
          },
          {
            kind: "text",
            text: "Keep a retired model in the list with disabled rather than removing it, so a stored preference still resolves to a name instead of falling back to the placeholder. Disabled models are skipped by the arrow keys, not merely dimmed.",
          },
        ],
      },
    ],
    types: [
      {
        name: "Model",
        rows: [
          ["id", "string", "What onValueChange reports and value matches."],
          ["name", "string", "Shown on the trigger and in the list."],
          ["description", "string", "A line beneath the name."],
          [
            "badges",
            "string[]",
            "Short capability tags, such as vision or fast.",
          ],
          [
            "disabled",
            "boolean",
            "Listed but unchoosable, and skipped by the keyboard.",
          ],
        ],
      },
    ],
    props: [
      [
        "models",
        "Model[]",
        "Each with an id, a name, and optional description, badges, and disabled.",
      ],
      [
        "value, defaultValue",
        "string, string",
        "Controlled and uncontrolled selection.",
      ],
      [
        "onValueChange",
        "(id: string) => void",
        "Called with the chosen model's id.",
      ],
      ["label", "string", 'Names the control. Defaults to "Model".'],
      ["placeholder", "string", "Shown until something is chosen."],
      ["disabled", "boolean", "Disables the trigger."],
    ],
    accessibility:
      "The trigger declares that it opens a listbox and whether it is open, and names the current model. The list takes focus and drives selection through aria-activedescendant, so the active option is announced without focus leaving the list. Arrow keys move, Home and End jump, Enter and Space choose, Escape closes, and focus returns to the trigger either way. Disabled models are skipped by the keyboard rather than merely dimmed. Pointer events outside close it.",
  },
  {
    slug: "source-card",
    kind: "component",
    name: "Source Card",
    family: "Agent UI",
    summary:
      "One retrieved passage: where it came from, what it said, and how well it matched.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("source-card"),
    npmImport: packageImport("SourceCard", "source-card"),
    usage: `export function Sources() {
  return results.map((result, index) => (
    <SourceCard
      key={result.id}
      index={index + 1}
      title={result.title}
      url={result.url}
      snippet={result.text}
      score={result.score}
    />
  ))
}`,
    props: [
      [
        "title",
        "ReactNode",
        "The heading. Becomes a link when a url is given.",
      ],
      ["url", "string", "Opens in a new tab, with the host shown underneath."],
      ["snippet", "ReactNode", "The retrieved passage."],
      [
        "source",
        "ReactNode",
        "Where it came from. Falls back to the host of the url.",
      ],
      ["index", "number", "Position in the result list, shown as a marker."],
      [
        "score",
        "number",
        "Relevance from 0 to 1, shown as a bar and a percentage.",
      ],
      [
        "icon, footer",
        "ReactNode, ReactNode",
        "A leading mark, and a row beneath the passage.",
      ],
    ],
    accessibility:
      "Each card is an article with a real heading, so a list of them can be navigated by heading. Links say they open in a new tab and carry rel=noreferrer noopener. The relevance bar is decoration with the percentage written beside it, so the score never depends on seeing the bar. A malformed url degrades to no host rather than throwing.",
  },
  {
    slug: "empty-state",
    kind: "block",
    name: "Empty State",
    family: "Blocks",
    summary:
      "What to show when there is nothing yet: what this place is for, and the way to fill it.",
    dependencies: [],
    install: registryInstallCommand("empty-state"),
    npmImport: packageImport("EmptyState", "empty-state"),
    usage: `export function NoFiles() {
  return (
    <EmptyState
      icon={<FileText size={18} />}
      title="No documents yet"
      description="Upload a PDF to get started."
      actions={<button type="button">Upload</button>}
    />
  )
}`,
    props: [
      ["title", "ReactNode", "The one line saying what is missing."],
      [
        "description",
        "ReactNode",
        "A sentence of context, held to a readable measure.",
      ],
      ["icon", "ReactNode", "Placed in a ring above the title."],
      [
        "actions",
        "ReactNode",
        "Controls beneath, such as the way to add the first item.",
      ],
      ["size", '"sm" | "md"', "Vertical room. Use sm inside a panel."],
    ],
    accessibility:
      "The icon is decoration the screen reader skips, so the title carries the meaning. The description is capped at a readable measure rather than stretching across a wide panel. Nothing here traps focus or announces itself; it is a static region, and the action inside it is your own control with your own semantics.",
  },
] as const

export const componentDocs = entries.map((entry, index) => ({
  ...entry,
  number: String(index + 1).padStart(2, "0"),
  featured: "featured" in entry && entry.featured === true,
  // Normalised here so every consumer reads the same shape, whether or not the
  // entry declared them.
  sections: ("sections" in entry
    ? entry.sections
    : []) as readonly DocSection[],
  types: ("types" in entry ? entry.types : []) as readonly DocTypeTable[],
}))

/** Shown with a live demo on the home page. The rest are listed compactly. */
export const featuredComponents = componentDocs.filter(
  (component) => component.featured
)

export type ComponentDoc = (typeof componentDocs)[number]

export type ComponentSlug = ComponentDoc["slug"]

export function getComponentDoc(slug: string) {
  return componentDocs.find((component) => component.slug === slug)
}
