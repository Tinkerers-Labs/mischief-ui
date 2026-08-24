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
    sections: [
      {
        id: "peers",
        title: "What it needs installed",
        blocks: [
          {
            kind: "text",
            text: "This is one of the seven components that reach for something beyond React. Base UI supplies the tab semantics -- roving focus, the tab and panel relationship, arrow key movement -- and Motion drives the indicator. Both are optional peers, so they are only installed if you ask for them.",
          },
          {
            kind: "code",
            code: `npm install mischief-ui @base-ui/react motion`,
            caption:
              "Import it from its own entry: mischief-ui/magnetic-tabs, not the package root.",
          },
          {
            kind: "text",
            text: "The root import deliberately does not carry it, because a barrel holding it would fail for everyone who had not installed those two. That is the trade: a subpath import here, and no unexpected dependencies anywhere else.",
          },
        ],
      },
      {
        id: "motion",
        title: "The magnetism, and doing without it",
        blocks: [
          {
            kind: "text",
            text: "The indicator is spring-driven and leans towards the pointer as it moves across a tab, then settles when the pointer leaves. It is a stiff, light spring, so it arrives quickly rather than wobbling -- the effect should read as responsive, not bouncy.",
          },
          {
            kind: "text",
            text: "When the reader has asked for reduced motion the lean is not applied at all and the indicator moves straight to the selected tab. Nothing about which tab is selected, or how it is reached from the keyboard, depends on any of this.",
          },
        ],
      },
    ],
    types: [
      {
        name: "MagneticTabItem",
        rows: [
          [
            "value",
            "string",
            "Identifies the tab. What value and onValueChange speak in.",
          ],
          ["label", "ReactNode", "The tab itself."],
          [
            "content",
            "ReactNode",
            "The panel shown while the tab is selected.",
          ],
          [
            "disabled",
            "boolean",
            "Listed but unselectable, and skipped by the arrow keys.",
          ],
        ],
      },
    ],
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
    sections: [
      {
        id: "committed",
        title: "While dragging, and after",
        blocks: [
          {
            kind: "text",
            text: "There are two callbacks because there are two moments, and confusing them is expensive. onValueChange fires continuously through a drag, which is what you want for a preview that has to keep up. onValueCommitted fires once, when the handle is released or a key is lifted.",
          },
          {
            kind: "text",
            text: "Anything with a cost belongs in the committed callback: a request, a write, an undo entry. Putting a save in onValueChange sends one for every frame of a single drag.",
          },
          {
            kind: "code",
            code: `<ElasticSlider
  label="Volume"
  defaultValue={68}
  onValueChange={setPreview}
  onValueCommitted={(value) => save({ volume: value })}
/>`,
          },
        ],
      },
      {
        id: "formatting",
        title: "Reading the value",
        blocks: [
          {
            kind: "text",
            text: "The number shown beside the label comes from formatValue, and so does the value announced to a screen reader. Use it to give the number its unit, because a bare 68 says nothing about what it measures.",
          },
          {
            kind: "code",
            code: `formatValue={(value) => \`\${value}%\`}
formatValue={(value) => \`\${(value / 100).toFixed(2)} s\`}`,
          },
          {
            kind: "text",
            text: "min, max, and step are passed to the underlying Base UI slider, so a step of 5 constrains the keyboard as well as the drag. Motion is used only for the stretch: with reduced motion the handle still tracks exactly, it simply stops deforming.",
          },
        ],
      },
    ],
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
    sections: [
      {
        id: "why",
        title: "Why hold instead of confirm",
        blocks: [
          {
            kind: "text",
            text: "A confirmation dialog asks a question the answer to which is almost always yes, and people learn to dismiss it without reading. A hold cannot be dismissed by reflex: it takes a second of deliberate, continuous pressure, and letting go early cancels it.",
          },
          {
            kind: "text",
            text: "That makes it a good fit for the destructive action that is common enough to be annoying behind a dialog but severe enough that an accident matters -- deleting a draft, clearing a queue, revoking a key. It is a poor fit for anything irreversible and rare, where a dialog that names what is about to happen is still the right answer.",
          },
        ],
      },
      {
        id: "duration",
        title: "How long the hold is",
        blocks: [
          {
            kind: "text",
            text: "The default is 900ms, which is long enough to feel like a decision and short enough not to feel broken. Shorter values are accepted but floored at 500ms, because below that the hold stops being deliberate and becomes a slow click -- exactly the reflex it exists to interrupt.",
          },
          {
            kind: "text",
            text: "onComplete runs once, at the end of a full hold. Releasing early, dragging off the button, or pressing Escape all cancel it, and nothing is reported.",
          },
        ],
      },
    ],
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
    sections: [
      {
        id: "shift",
        title: "The shift",
        blocks: [
          {
            kind: "text",
            text: "On hover the leading icon slides out to the left and fades, while the trailing icon slides in from the right to take its place. The grid keeps a fixed column for each, so the label never moves and the button never changes width -- the motion happens inside a stable shape.",
          },
          {
            kind: "text",
            text: "Under reduced motion the trailing icon is not shown at all and the leading icon stays exactly where it is. The button is then simply a button with an icon, which is the point: the shift is decoration, and nothing is communicated by it alone.",
          },
          {
            kind: "text",
            text: "Give trailingIcon only when it says something -- an arrow for navigation, a check for a completed action. Leaving it out is fine, and the leading icon then stays put for everyone.",
          },
        ],
      },
      {
        id: "peers",
        title: "What it needs installed",
        blocks: [
          {
            kind: "text",
            text: "Base UI supplies the button, which is why this component is imported from its own entry rather than the package root, and why @base-ui/react has to be installed alongside.",
          },
          {
            kind: "code",
            code: `npm install mischief-ui @base-ui/react`,
          },
        ],
      },
    ],
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
    sections: [
      {
        id: "not-a-checkbox",
        title: "Do not use this for anything that matters",
        blocks: [
          {
            kind: "text",
            text: "This is a joke. A paw reaches out and unchecks the box, and it keeps doing it until you have tried enough times. It is genuinely funny once, and it is genuinely infuriating if it stands between someone and something they need.",
          },
          {
            kind: "text",
            text: "So: never for consent, terms, permissions, a privacy choice, or anything a form submits. Anything a person must be able to set, they must be able to set on the first try. A 404 page, an easter egg, a demo, a settings toggle for something that does not exist -- those are where it belongs.",
          },
          {
            kind: "text",
            text: "revealAfter and angryAfter decide how long the bit runs before it gives up and lets the box stay checked. Keep them low if there is any chance someone actually wanted the checkbox.",
          },
        ],
      },
      {
        id: "attempts",
        title: "Following along",
        blocks: [
          {
            kind: "text",
            text: "onAttempt fires with a running count each time someone tries, which is what you would build the rest of the joke around -- a line of copy that escalates, a sound, a message that gives in before the paw does.",
          },
          {
            kind: "code",
            code: `<ImpossibleCheckbox
  angryAfter={3}
  revealAfter={5}
  onAttempt={(attempt) => setTaunt(taunts[attempt] ?? taunts.at(-1))}
/>`,
          },
          {
            kind: "text",
            text: "Motion is an optional peer and drives the whole performance. With reduced motion the animation collapses to nothing, so consider whether the joke still lands for that reader, and offer them the plain checkbox instead.",
          },
        ],
      },
    ],
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
    sections: [
      {
        id: "container",
        title: "Watching something other than the window",
        blocks: [
          {
            kind: "text",
            text: "By default the index tracks the page. When your sections scroll inside an element -- a panel, a modal, a split view -- pass that element and it observes the right scroller instead of quietly tracking a page that never moves.",
          },
          {
            kind: "code",
            code: `const panel = useRef<HTMLDivElement>(null)

<div ref={panel} className="overflow-y-auto">
  {sections.map((section) => (
    <section key={section.id} id={section.id}>…</section>
  ))}
</div>

<FloatingIndex items={items} containerRef={panel} />`,
            caption:
              "Pass container instead when you already hold the element rather than a ref.",
          },
          {
            kind: "text",
            text: "Every item's id must match the id of a real element, because that is what is being observed. An item pointing at nothing is simply never marked active.",
          },
        ],
      },
      {
        id: "progress",
        title: "The ring",
        blocks: [
          {
            kind: "text",
            text: "The ring around the index fills with how far through the scroller the reader is, which gives the sense of remaining length that a list of section names alone does not. It is decoration -- the active item is what carries the position, and it is marked as current for a screen reader.",
          },
          {
            kind: "text",
            text: "Motion is an optional peer here, so the component is imported from its own entry. With reduced motion the ring stops animating between values and simply reflects the current one.",
          },
        ],
      },
    ],
    types: [
      {
        name: "FloatingIndexItem",
        rows: [
          ["id", "string", "Must match the id of the element it points at."],
          ["label", "string", "The section name."],
          ["icon", "ReactNode", "Shown in place of the marker."],
        ],
      },
    ],
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
      {
        id: "ranking-of-your-own",
        title: "Ranking it yourself",
        blocks: [
          {
            kind: "text",
            text: "The built-in tiers suit labels and keywords. When they do not -- fuzzy matching, a field the component knows nothing about, a weighting that puts recent things first -- pass rank and score the items yourself. Lower is a better match, and false drops one.",
          },
          {
            kind: "code",
            code: `import { rankCommandItem } from "mischief-ui/command-palette"

<CommandPalette
  items={items}
  rank={(item, query) =>
    item.pinned ? -1 : rankCommandItem(item, query)
  }
/>`,
            caption:
              "The built-in ranker is exported, so yours can defer to it rather than reproduce it.",
          },
          {
            kind: "text",
            text: "The query arrives as it was typed rather than lowercased, so a ranker of your own can be case-sensitive. Turn filtering off entirely with filter={false} when the ordering is already someone else's decision.",
          },
        ],
      },
      {
        id: "remote",
        title: "Results from a server",
        blocks: [
          {
            kind: "text",
            text: "The palette filters and ranks whatever array it is given, which is right when the whole set is already in the browser. Once results come from a search endpoint, two things change: you need to know what was typed, and the palette must stop re-ranking what the server already ordered.",
          },
          {
            kind: "code",
            code: `const [query, setQuery] = useState("")
const [hits, setHits] = useState([])
const [loading, setLoading] = useState(false)

useEffect(() => {
  if (!query) return setHits([])
  const controller = new AbortController()

  setLoading(true)
  search(query, { signal: controller.signal })
    .then(setHits)
    .finally(() => setLoading(false))

  return () => controller.abort()
}, [query])

<CommandPalette
  items={hits}
  filter={false}
  loading={loading}
  onQueryChange={setQuery}
/>`,
            caption:
              "Debouncing and aborting stay yours: only you know what the endpoint costs.",
          },
          {
            kind: "text",
            text: "While loading, the palette says it is searching rather than reporting that nothing matched, because an empty list mid-flight is not an answer. The listbox is marked busy at the same time, so a screen reader is told to wait instead of hearing an empty set.",
          },
        ],
      },
      {
        id: "one-per-chord",
        title: "One palette per chord",
        blocks: [
          {
            kind: "text",
            text: "The shortcut is bound to the window, so every palette on the page hears it. Two of them on the same chord used to open two stacked dialogs from a single keypress, which is how this page found the bug: the site's own search already owns Mod+K.",
          },
          {
            kind: "text",
            text: "A palette now ignores a keypress something else has already claimed, so the first listener wins and nobody gets a stack of modals. That is a guard against a mistake rather than a licence to make it, because which palette wins depends on mount order. Give the second one its own chord.",
          },
          {
            kind: "code",
            code: `<CommandPalette items={pages} />
<CommandPalette items={actions} shortcut="j" />
<CommandPalette items={help} shortcut={false} />`,
            caption: "Mod+K, Mod+J, and one opened from your own code.",
          },
          {
            kind: "text",
            text: "The same holds for a chord your page handles itself: if your listener calls preventDefault, the palette leaves that keypress alone.",
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
        "onQueryChange",
        "(query: string) => void",
        "Called as the query changes, for fetching results yourself.",
      ],
      [
        "loading",
        "boolean",
        "Says results are on their way. Pair it with onQueryChange.",
      ],
      [
        "loadingMessage",
        "ReactNode",
        'Shown while waiting. Defaults to "Searching…".',
      ],
      [
        "filter",
        "boolean",
        "Rank and filter here. Turn off when the server already did.",
      ],
      [
        "rank",
        "(item, query) => number | false",
        "Score items yourself. Lower is better; false drops one.",
      ],
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
    sections: [
      {
        id: "own-scroller",
        title: "When the page has its own scroller",
        blocks: [
          {
            kind: "text",
            text: "Smooth-scroll libraries such as Lenis take the page's scrolling away from the browser, and a native scrollTo either fights them or does nothing. Claim the click and do it yourself: onClick runs first, and calling preventDefault stops the built-in scroll.",
          },
          {
            kind: "code",
            code: `<ScrollToTopButton
  showAfter={720}
  onClick={(event) => {
    event.preventDefault()
    lenis.scrollTo(0, { immediate: prefersReducedMotion })
  }}
/>`,
            caption:
              "The same hook works for a virtualised list, or any scroller you own.",
          },
        ],
      },
      {
        id: "appearing",
        title: "When it appears",
        blocks: [
          {
            kind: "text",
            text: "The button stays out of the way until the reader is showAfter pixels down, so a short page never grows a control for a journey nobody took. It fades in and out rather than appearing, and while hidden it is completely inert: not clickable, not focusable, and not announced.",
          },
          {
            kind: "text",
            text: "Like the floating index, it watches the window unless you hand it a container, which is what you want when the thing that scrolls is a panel rather than the page.",
          },
          {
            kind: "code",
            code: `<ScrollToTopButton
  containerRef={panel}
  showAfter={600}
  behavior="smooth"
/>`,
          },
        ],
      },
      {
        id: "behaviour",
        title: "Smooth, and when not to be",
        blocks: [
          {
            kind: "text",
            text: 'behavior is passed straight to the browser, so "smooth" animates and "auto" jumps. A long page smooth-scrolled from the bottom can take an unpleasantly long time to arrive; if your pages are long, "auto" is the kinder default.',
          },
          {
            kind: "text",
            text: "Browsers already honour a reduced-motion preference for smooth scrolling, so you do not need to switch the value yourself for that reason.",
          },
        ],
      },
    ],
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
      [
        "icon",
        "ReactNode",
        "Replaces the default arrow. Keeps the hover lift.",
      ],
      ["label", "string", "The accessible name and title."],
      ["className", "string", "Classes for placement and appearance."],
      ["...buttonProps", "ButtonHTMLAttributes", "Native button attributes."],
    ],
    accessibility:
      "The control is a named native button with a 48px target. While there is nothing to scroll back from it is hidden from assistive technology and taken out of the tab order, so it is never a stop on the way through the page. Scrolling is immediate when reduced motion is requested, and the fade stops with it.",
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
    sections: [
      {
        id: "verbs",
        title: "Running something, or adding it",
        blocks: [
          {
            kind: "text",
            text: "The two props are two different verbs, and a block can offer either or both. run is a one-off execution -- a generator, a registry command -- and add is a dependency going into package.json. Each manager has its own word for each, and picking a manager applies to whichever verb is showing.",
          },
          {
            kind: "table",
            headers: ["Manager", "run", "add"],
            rows: [
              ["npm", "npx", "npm install"],
              ["pnpm", "pnpm dlx", "pnpm add"],
              ["yarn", "yarn dlx", "yarn add"],
              ["bun", "bunx --bun", "bun add"],
            ],
          },
          {
            kind: "text",
            text: "Pass the arguments without the verb -- shadcn@latest add tabs, not npx shadcn@latest add tabs -- and the block builds the whole line. Choosing pnpm and then switching to the package option gives pnpm add rather than snapping back to the default.",
          },
        ],
      },
      {
        id: "own-tabs",
        title: "When it is not an install",
        blocks: [
          {
            kind: "text",
            text: "The package managers are the common case, not the only one. A block that offers a skill, a server config, and a curl call is the same thing -- a few labelled snippets and one copy button -- but none of them is npm install. Pass tabs and they replace the managers entirely.",
          },
          {
            kind: "code",
            code: `<InstallCommand
  tabs={[
    { id: "skill", label: "skill", value: skillCommand },
    { id: "mcp", label: "mcp", value: serverConfig, wrap: true },
    { id: "curl", label: "curl", value: curlCall },
  ]}
/>`,
            caption:
              "wrap suits anything that is not one line, such as a JSON block.",
          },
        ],
      },
      {
        id: "prompt",
        title: "The agent option",
        blocks: [
          {
            kind: "text",
            text: "prompt adds a third choice that is not a command at all: an instruction to paste into a coding agent. It sits beside the shell commands because that is now one of the ways people install things, and copying it uses the same control.",
          },
          {
            kind: "code",
            code: `<InstallCommand
  run="shadcn@latest add tabs"
  add="mischief-ui"
  prompt={\`Read \${docsUrl} and add this component to my project.\`}
/>`,
          },
          {
            kind: "text",
            text: "Only the options you supply are offered, so a block with just add shows no manager row at all and no empty tabs.",
          },
        ],
      },
    ],
    props: [
      [
        "tabs",
        "InstallTab[]",
        "Your own tabs, which replace the package managers entirely.",
      ],
      [
        "defaultTab",
        "string",
        "Which of those opens first. Defaults to the first.",
      ],
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
    types: [
      {
        name: "InstallTab",
        rows: [
          ["id", "string", "Unique within the set. What defaultTab names."],
          ["label", "string", "The tab as shown."],
          ["value", "string", "What is displayed and copied."],
          [
            "wrap",
            "boolean",
            "Wrap rather than scroll, for more than one line.",
          ],
        ],
      },
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
    sections: [
      {
        id: "markdown",
        title: "Copying the page, not the address",
        blocks: [
          {
            kind: "text",
            text: "The main control copies the markdown itself rather than a link to it. That is the difference between an agent having the page and an agent being told where the page is -- one of which works when the model cannot browse, is behind a login, or is reading a build that has not shipped yet.",
          },
          {
            kind: "text",
            text: "Generate that markdown from the same source your page renders from. Two hand-written copies of the same documentation disagree within a week.",
          },
        ],
      },
      {
        id: "destinations",
        title: "Sending it somewhere",
        blocks: [
          {
            kind: "text",
            text: "The menu's destinations each turn a prompt into a URL for a particular assistant. They are ordinary links, opened only when someone chooses one, and you can replace the set entirely to add your own or to remove any you would rather not point at.",
          },
          {
            kind: "code",
            code: `<CopyForAi
  markdown={markdown}
  markdownUrl={url}
  destinations={[
    ...defaultDestinations.filter((entry) => entry.id !== "grok"),
    { id: "internal", name: "Our assistant", href: (prompt) =>
      \`https://ai.example.com/new?q=\${encodeURIComponent(prompt)}\` },
  ]}
/>`,
          },
          {
            kind: "text",
            text: "Whatever the prompt contains ends up in a URL to a third party, and URLs are logged, kept in history, and sent as referrers. Never build one out of a customer's data, an internal document, or anything you would not paste into a public chat.",
          },
          {
            kind: "text",
            text: "The view-as-markdown entry is dropped when there is no markdownUrl, so the menu never offers a link to nothing.",
          },
        ],
      },
    ],
    types: [
      {
        name: "AiDestination",
        rows: [
          ["id", "string", "Unique within the set."],
          ["name", "string", 'Shown as "Open in {name}".'],
          [
            "href",
            "(prompt: string) => string",
            "Builds the URL. Encode the prompt yourself.",
          ],
          ["icon", "ReactNode", "Shown beside the name."],
        ],
      },
    ],
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
    sections: [
      {
        id: "active",
        title: "How the current section is chosen",
        blocks: [
          {
            kind: "text",
            text: "On every scroll the component reads where each heading is and marks the last one to have passed a line near the top of the viewport. That line is offset, which defaults to 96 pixels -- set it to roughly the height of whatever sits fixed above your content, or headings will highlight while still hidden behind it.",
          },
          {
            kind: "text",
            text: "This is deliberately position tracking rather than an intersection observer. An observer only reports as a heading crosses an edge, so a heading scrolled past between two callbacks leaves the wrong entry marked, and the index reads a section behind the page. Reading positions costs a little more and is never wrong.",
          },
          {
            kind: "code",
            code: `<TableOfContents
  sections={[
    { id: "install", label: "Install" },
    { id: "usage", label: "Usage" },
  ]}
  offset={72}
  onActiveChange={setCurrent}
/>`,
            caption:
              "Every id must belong to a real element; one that does not is simply never marked.",
          },
        ],
      },
      {
        id: "smooth",
        title: "If you use smooth scrolling",
        blocks: [
          {
            kind: "text",
            text: "With scroll-behavior set to smooth, a click on an entry animates to the heading, and the marked section changes several times on the way as each heading passes the line. That is correct, and it is also why measuring the active entry immediately after a click tells you where the page was, not where it is going.",
          },
        ],
      },
    ],
    types: [
      {
        name: "TocSection",
        rows: [
          ["id", "string", "The id of the element this entry points at."],
          ["label", "string", "How the section is named in the index."],
        ],
      },
    ],
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
    sections: [
      {
        id: "kind",
        title: "How it decides what a file is",
        blocks: [
          {
            kind: "text",
            text: "The badge is the extension taken from the name, upper-cased and cut to five characters. A file is treated as an image when its MIME type starts with image/, or when the extension is one of png, jpg, jpeg, gif, webp, svg, or avif.",
          },
          {
            kind: "text",
            text: "Both of those are guesses from a name, which is fine for choosing an icon and useless as a check. Nothing here validates anything: a script renamed to .png is still shown as an image.",
          },
        ],
      },
      {
        id: "previews",
        title: "Previews are yours to make",
        blocks: [
          {
            kind: "text",
            text: "No preview is generated. Pass previewImageUrl and it is shown; leave it out and the file gets its extension badge instead. That keeps the component free of any renderer, and lets the picture come from wherever it actually lives -- a stored thumbnail, a signed URL, an object URL you made in the browser.",
          },
          {
            kind: "code",
            code: `const url = useMemo(() => URL.createObjectURL(file), [file])
useEffect(() => () => URL.revokeObjectURL(url), [url])

<FileThumbnail file={file} previewImageUrl={url} />`,
            caption:
              "Revoke an object URL when you are done with it, or the file stays in memory.",
          },
          {
            kind: "text",
            text: "isLoading covers the wait while a thumbnail is being made, and hasError covers one that could not be. Passing null for previewImageUrl is the honest way to say there will not be one.",
          },
        ],
      },
    ],
    types: [
      {
        name: "FileThumbnailFile",
        rows: [
          ["name", "string", "Filename. The extension becomes the badge."],
          ["type", "string", "MIME type, used to spot an image. Optional."],
        ],
      },
    ],
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
    sections: [
      {
        id: "avatars",
        title: "Avatars",
        blocks: [
          {
            kind: "text",
            text: "The avatar slot takes whatever you give it and crops it into a 28 pixel circle. An image is scaled to fill and centred, so a portrait or a wide crop both work without letterboxing; initials or an icon work equally well, and are what to fall back to when someone has no picture.",
          },
          {
            kind: "code",
            code: `<Message role="user" name="Aman" avatar={<img src={photo} alt="" />}>
  {text}
</Message>

<Message role="assistant" name="Mischief" avatar="M">
  {answer}
</Message>`,
            caption:
              "Leave the image alt empty: the name beside it already says who this is.",
          },
          {
            kind: "text",
            text: "The whole slot is hidden from assistive technology, because a picture of someone next to their name adds nothing to hear. That is also why an avatar alone is not enough to identify a speaker -- always pass name as well, or accept the role's default wording.",
          },
        ],
      },
      {
        id: "roles",
        title: "Roles and waiting",
        blocks: [
          {
            kind: "text",
            text: "role sets the alignment, the tone, and the default name -- You, Assistant, or System. Override that with name whenever you have something better, which for an assistant is usually the product's own name rather than the word assistant.",
          },
          {
            kind: "text",
            text: "pending marks a message that has been sent but not yet answered, or one still being written. Use it for the turn that is waiting rather than for one that failed: a message that will never arrive should say so in its own content, not sit pending forever.",
          },
          {
            kind: "text",
            text: "actions is the row beneath the message, and is where Response Actions is designed to go.",
          },
        ],
      },
    ],
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
    sections: [
      {
        id: "label-prompt",
        title: "What is shown and what is sent",
        blocks: [
          {
            kind: "text",
            text: "A suggestion carries a label, which is what people read, and optionally a prompt, which is what you would actually send. They are separate because a good button is short and a good prompt is not: Summarise this reads well on a chip, and does far less than the three sentences you would rather the model receive.",
          },
          {
            kind: "text",
            text: "onSelect hands you the whole suggestion, so what you do with it is yours to decide -- send the prompt, or drop it into the composer for editing first.",
          },
          {
            kind: "code",
            code: `<Suggestions
  suggestions={[
    {
      id: "summarise",
      label: "Summarise this",
      prompt: "Summarise the document in five bullets, each one sentence, no preamble.",
    },
  ]}
  onSelect={(suggestion) => send(suggestion.prompt ?? String(suggestion.label))}
/>`,
            caption:
              "Nothing falls back for you: decide what an absent prompt means.",
          },
        ],
      },
      {
        id: "writing",
        title: "Choosing what to suggest",
        blocks: [
          {
            kind: "text",
            text: "Suggestions are most useful when someone does not yet know what this thing can do, which means they should show range rather than repeat one idea three ways. Three or four that each open a different door beat eight that all summarise something.",
          },
          {
            kind: "text",
            text: "Make them specific to what is actually on screen. Ask about this document earns its place; Ask a question does not, because it tells the reader nothing they had not worked out from the text box.",
          },
        ],
      },
    ],
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
    sections: [
      {
        id: "urls",
        title: "The prompt travels in a URL",
        blocks: [
          {
            kind: "text",
            text: "Each target is a link that carries the prompt as a query parameter. Nothing is sent until someone chooses one, and then it leaves your site entirely: it lands in that assistant's logs, the reader's browser history, and anywhere a URL is ordinarily kept.",
          },
          {
            kind: "text",
            text: "So build the prompt out of public things -- a page address, a product name, a question about documentation. Never interpolate a customer record, a file someone uploaded, an API key, or the contents of an internal page. If you would not paste it into a stranger's chat window, it does not belong in the prompt.",
          },
          {
            kind: "text",
            text: "There is also a length limit you do not control: browsers and servers both cut long URLs off, and a very long prompt can arrive truncated. Keep it to an instruction and a link, and let the assistant fetch the rest.",
          },
        ],
      },
      {
        id: "targets",
        title: "Choosing who to offer",
        blocks: [
          {
            kind: "text",
            text: "The default set covers the assistants people are most likely to have open. Replace it with targets to cut it down, reorder it, or point at something of your own -- an internal tool, a workspace with your documentation already loaded.",
          },
          {
            kind: "text",
            text: "The copy control is the one that always works, since it needs no third party at all. Keep it available even when you have trimmed the targets to nothing.",
          },
        ],
      },
    ],
    types: [
      {
        name: "AskAiTarget",
        rows: [
          ["id", "string", "Unique within the set."],
          ["name", "string", "The assistant's name, as shown."],
          [
            "href",
            "string",
            "The full URL, with the prompt already encoded into it.",
          ],
        ],
      },
    ],
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
    sections: [
      {
        id: "statuses",
        title: "The four states",
        blocks: [
          {
            kind: "text",
            text: "The component shows one of four things, and each is announced politely as it changes so a reader who is not watching still learns that the answer has started or finished.",
          },
          {
            kind: "table",
            headers: ["Status", "Shows"],
            rows: [
              [
                "idle",
                "Nothing is happening. Render it or do not, as you prefer.",
              ],
              [
                "thinking",
                "The working indicator, and a live duration if startedAt is set.",
              ],
              ["done", "doneLabel, and the final duration."],
              ["error", "errorLabel in place of the label."],
            ],
          },
          {
            kind: "text",
            text: "Pass startedAt and the duration counts up on its own; pass elapsedMs and that fixed figure is shown instead. The second is what you want when replaying a conversation, where a live counter would start again from zero on every render of an old message.",
          },
        ],
      },
      {
        id: "reasoning",
        title: "Showing the reasoning",
        blocks: [
          {
            kind: "text",
            text: "reasoning goes behind a disclosure that starts closed, because the point of this component is to say that work is happening without burying the answer underneath the working. Someone curious can open it; nobody has to scroll past it.",
          },
          {
            kind: "text",
            text: "Think about what you put in there. Intermediate reasoning is often less careful than the final answer, and once it is on screen it can be screenshotted and quoted as though it were the conclusion. A summary of the steps is usually more useful, and more defensible, than the raw trace.",
          },
        ],
      },
    ],
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
    sections: [
      {
        id: "statuses",
        title: "The five states",
        blocks: [
          {
            kind: "text",
            text: "Every item is in exactly one state, and the wording each maps to is what a screen reader hears alongside the label.",
          },
          {
            kind: "table",
            headers: ["Status", "Read as"],
            rows: [
              ["pending", "waiting"],
              ["active", "in progress"],
              ["done", "done"],
              ["error", "failed"],
              ["skipped", "skipped"],
            ],
          },
          {
            kind: "text",
            text: "skipped exists so a plan that changed does not have to lie. An agent that decided a step was unnecessary should mark it skipped rather than done, which is the difference between a truthful record and a tidy one.",
          },
        ],
      },
      {
        id: "announcing",
        title: "Announcing progress",
        blocks: [
          {
            kind: "text",
            text: "With announce on, each change is read out as it happens. That is genuinely helpful for a plan of five or six steps and unbearable for a plan of forty, so turn it off for long lists and let the progress count carry the story instead.",
          },
          {
            kind: "text",
            text: "Write labels as the thing being done, short enough to be heard in one breath: Reading the invoice, not Now attempting to read the uploaded invoice document. Detail is for detail.",
          },
          {
            kind: "code",
            code: `<AgentChecklist
  title="Extracting the invoice"
  items={[
    { id: "read", label: "Reading the file", status: "done" },
    { id: "fields", label: "Finding the fields", status: "active" },
    { id: "verify", label: "Checking the totals", status: "pending" },
  ]}
/>`,
          },
        ],
      },
    ],
    types: [
      {
        name: "AgentChecklistItem",
        rows: [
          ["id", "string", "Unique within the list."],
          ["label", "ReactNode", "The step, phrased as the thing being done."],
          [
            "status",
            "ChecklistItemStatus",
            "pending, active, done, error, or skipped.",
          ],
          [
            "detail",
            "ReactNode",
            "A second line, for what the step actually found.",
          ],
        ],
      },
    ],
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
    sections: [
      {
        id: "pages",
        title: "Numbering and thumbnails",
        blocks: [
          {
            kind: "text",
            text: "Pages carry their own number rather than being counted from their position, so a navigator over pages 40 to 60 of a long document says 40 to 60. Whatever you pass is what is shown and what onActivePageChange reports.",
          },
          {
            kind: "text",
            text: "src is optional. Without it the page still appears, as a numbered placeholder, which is what you want while thumbnails are still being rendered -- the strip keeps its full length instead of growing as images arrive and pushing the current page around.",
          },
          {
            kind: "code",
            code: `<PageNavigator
  pages={pages.map((page) => ({
    number: page.number,
    src: thumbnails[page.number],
    label: page.heading,
  }))}
  activePage={current}
  onActivePageChange={setCurrent}
/>`,
          },
        ],
      },
      {
        id: "orientation",
        title: "Which way it runs",
        blocks: [
          {
            kind: "text",
            text: "Vertical is the familiar side rail beside a document, and is the better choice for a long file because a tall strip holds more thumbnails at a readable size than a wide one does. Horizontal suits a short document, or a narrow screen where a side rail would take a third of the width.",
          },
          {
            kind: "text",
            text: "renderImage lets your own image component take over -- a framework's optimised image, a signed URL that needs refreshing, a canvas you are already painting pages onto.",
          },
        ],
      },
    ],
    types: [
      {
        name: "DocumentPage",
        rows: [
          [
            "number",
            "number",
            "Shown as the page number, and reported on change.",
          ],
          ["src", "string", "Thumbnail. Omit for a numbered placeholder."],
          ["label", "string", "Extra description, such as a section heading."],
        ],
      },
    ],
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
    sections: [
      {
        id: "model",
        title: "How a split is stored",
        blocks: [
          {
            kind: "text",
            text: "The state is not a list of documents. It is splitAfter: the page numbers that a break falls after. Everything else -- the segments, their order, how many there are -- is derived from that, which is why dragging a break never has to renumber anything.",
          },
          {
            kind: "code",
            code: `// Twelve pages, broken into 1-3, 4-9, and 10-12.
<DocumentSplits pages={pages} defaultSplitAfter={[3, 9]} />`,
          },
          {
            kind: "text",
            text: "A break after the final page is ignored, since it would produce an empty segment. Duplicates and unsorted values are fine; the list is sorted before use.",
          },
        ],
      },
      {
        id: "ranges",
        title: "Turning it into files",
        blocks: [
          {
            kind: "text",
            text: "What a server needs is ranges, and they fall straight out of the same array. Do the conversion where the split is submitted rather than storing both, so there is only ever one description of where the breaks are.",
          },
          {
            kind: "code",
            code: `function toRanges(pages, splitAfter) {
  const bounds = [...new Set(splitAfter)].sort((a, b) => a - b)
  const last = pages.at(-1).number
  const starts = [pages[0].number, ...bounds.map((page) => page + 1)]

  return starts
    .filter((start) => start <= last)
    .map((start, index) => ({ start, end: bounds[index] ?? last }))
}`,
            caption:
              "Gives [{ start: 1, end: 3 }, { start: 4, end: 9 }, { start: 10, end: 12 }].",
          },
        ],
      },
    ],
    types: [
      {
        name: "SplitPage",
        rows: [
          ["number", "number", "The page number. What splitAfter refers to."],
          ["src", "string", "Thumbnail. Omit for a numbered placeholder."],
          ["label", "string", "Extra description for the page."],
        ],
      },
      {
        name: "DocumentSegment",
        rows: [
          ["index", "number", "Position of the segment, from zero."],
          ["pages", "SplitPage[]", "The pages it contains, in order."],
        ],
      },
    ],
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
    slug: "json-viewer",
    kind: "component",
    name: "JSON Viewer",
    family: "Documents",
    summary:
      "A collapsible tree for a JSON payload, navigable from the keyboard, where every row can hand you its path.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("json-viewer"),
    npmImport: packageImport("JsonViewer", "json-viewer"),
    usage: `export function ToolResult({ payload }) {
  return (
    <JsonViewer
      value={payload}
      rootName="result"
      defaultExpandedDepth={2}
    />
  )
}`,
    sections: [
      {
        id: "paths",
        title: "The path is the point",
        blocks: [
          {
            kind: "text",
            text: "Reading a payload is half the job; the other half is saying where in it you were looking. Every row carries a copy control, and what it copies is the value, while the control names the path so the reader can see which one they are about to take.",
          },
          {
            kind: "text",
            text: "Paths are written the way they would be typed back into code, so a key that cannot survive dot notation is bracketed and quoted instead of being silently mangled.",
          },
          {
            kind: "code",
            code: `result.tools[0].input.query
result["content-type"]`,
            caption: "A plain key, and one that needs brackets.",
          },
        ],
      },
      {
        id: "depth",
        title: "How much is open to begin with",
        blocks: [
          {
            kind: "text",
            text: "A tree that arrives fully collapsed is one line, and one that arrives fully expanded is the wall of text the component exists to avoid. defaultExpandedDepth decides how far down the first view goes, and one level is usually enough to show the shape.",
          },
          {
            kind: "text",
            text: "A branch that is closed still says how much is inside it, so its size is legible without opening it. An empty object or array is a leaf: there is nothing to disclose, so it offers no control that would do nothing.",
          },
        ],
      },
      {
        id: "long-values",
        title: "Long strings",
        blocks: [
          {
            kind: "text",
            text: "One long string should not decide the width of the panel. Strings past maxStringLength are cut with an ellipsis inside the quotes, and the copy control still yields the whole thing rather than what is shown.",
          },
        ],
      },
    ],
    props: [
      ["value", "unknown", "The data. Anything JSON can hold."],
      [
        "rootName",
        "string",
        'What the top row is called, and the first segment of every path. Defaults to "root".',
      ],
      [
        "defaultExpandedDepth",
        "number",
        "How many levels are open on arrival. Defaults to 1.",
      ],
      [
        "maxStringLength",
        "number",
        "Where a string is cut for display. Defaults to 120.",
      ],
      [
        "copyable",
        "boolean",
        "Shows the per-row copy control. Defaults to true.",
      ],
      ["label", "string", 'The tree\'s accessible name. Defaults to "JSON".'],
    ],
    accessibility:
      "The rows are a real tree: role=tree on the container, role=treeitem with aria-level on each row, and aria-expanded on the ones that can open, so a screen reader announces depth and state rather than reading an indented list. Arrow keys move and fold the way a tree is expected to behave -- Right opens then descends, Left closes then climbs to the parent -- with Home and End for the ends and Enter or Space to toggle. Only one row is in the tab order, so the tree is a single stop rather than a hundred. A copy is confirmed through a live region, since the icon change alone is not announced.",
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
    sections: [
      {
        id: "blocks",
        title: "Why blocks rather than a document",
        blocks: [
          {
            kind: "text",
            text: "Document extraction does not return an essay, it returns pieces: a heading here, a table there, a paragraph that came from page four. Keeping them as separate blocks means each one can be pointed at, highlighted, corrected, or traced back to where it came from, which a single rendered string cannot do.",
          },
          {
            kind: "text",
            text: "kind is what the extractor thought a block was, and page is where it found it. Both are optional, and both are what make it possible to line this up with a page navigator or a set of bounding boxes over the original.",
          },
          {
            kind: "code",
            code: `<MarkdownBlocks
  blocks={[
    { id: "h1", kind: "heading", content: "## Payment terms", page: 2 },
    { id: "p1", kind: "paragraph", content: "Invoices are payable **net 30**.", page: 2 },
    { id: "t1", kind: "table", content: tableMarkdown, page: 3 },
  ]}
  activeId={selected}
  onActiveChange={setSelected}
/>`,
          },
        ],
      },
      {
        id: "markdown",
        title: "What the markdown may contain",
        blocks: [
          {
            kind: "text",
            text: "Blocks are rendered with react-markdown and GitHub Flavoured Markdown, so tables, strikethrough, task lists, and bare autolinks all work on top of the usual syntax. Raw HTML inside the content is not rendered as HTML -- there is no rehype-raw here, which is what keeps text extracted from someone else's document from bringing markup into your page.",
          },
          {
            kind: "text",
            text: "react-markdown and remark-gfm are optional peers, so this component is imported from its own entry and needs both installed alongside.",
          },
          {
            kind: "code",
            code: `npm install mischief-ui react-markdown remark-gfm`,
          },
        ],
      },
    ],
    types: [
      {
        name: "MarkdownBlock",
        rows: [
          ["id", "string", "Unique within the set. Drives selection."],
          [
            "kind",
            "MarkdownBlockKind",
            "heading, paragraph, table, list, figure, or footer.",
          ],
          ["content", "string", "The markdown for this block."],
          ["page", "number", "Where it came from in the original."],
          ["label", "string", "Overrides the wording of the kind badge."],
        ],
      },
    ],
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
      heading={<Logo />}
      description="Short links and file sharing with real-time analytics."
      columns={[
        { label: "Product", links: [{ label: "Pricing", href: "/pricing" }] },
        { label: "Company", links: [{ label: "Docs", href: docsUrl, external: true }] },
      ]}
      related={{
        label: "Other products",
        links: otherProducts,
      }}
      renderLink={({ href, label }) => <Link href={href}>{label}</Link>}
      brand={<span>© 2026 Northstar</span>}
      legal={<LegalLinks />}
      status={<SystemStatus />}
      wordmark="northstar"
    />
  )
}`,
    sections: [
      {
        id: "columns",
        title: "Links, and who renders them",
        blocks: [
          {
            kind: "text",
            text: "Pass columns and the footer lays out the labelled groups and styles the links itself, so a directory of thirty links is a data structure rather than thirty lines of markup. Pass navigation instead when the shape is unusual enough that you would rather build it.",
          },
          {
            kind: "text",
            text: "Links are plain anchors unless you say otherwise. renderLink hands each one back to you, which is how a framework's own link component gets used without the footer knowing anything about it.",
          },
          {
            kind: "code",
            code: `renderLink={({ href, label, external }) =>
  external ? (
    <a href={href} target="_blank" rel="noreferrer noopener">{label}</a>
  ) : (
    <Link href={href}>{label}</Link>
  )
}`,
            caption:
              "Styling comes back to you as well, so keep it consistent if you take this over.",
          },
          {
            kind: "text",
            text: "related is the same shape as a column but laid out as a wrapping row above the closing line, set off by a dashed rule. It is for the links that are not part of this product -- a sister site, the rest of a portfolio -- and its label is yours to name.",
          },
        ],
      },
      {
        id: "ground",
        title: "Dark or light",
        blocks: [
          {
            kind: "text",
            text: "The default is the page's foreground colour as a ground, which reads as a dark slab under a light site. Every shade inside is mixed from the footer's own text colour rather than a theme token, so setting a different background and text colour on the element is all it takes to move it to a light ground.",
          },
          {
            kind: "code",
            code: `<SignatureFooter
  className="bg-card text-card-foreground border-border border-t"
  ...
/>`,
            caption:
              "The rules, the muted copy, and the wordmark all follow the text colour.",
          },
        ],
      },
      {
        id: "wordmark",
        title: "The wordmark",
        blocks: [
          {
            kind: "text",
            text: "The oversized word across the bottom is drawn at a fraction of the footer's own colour and clipped by the edge of the page. It is hidden from assistive technology and unselectable, because it is a texture rather than a heading -- a screen reader announcing an enormous brand name at the end of every page is noise.",
          },
          {
            kind: "text",
            text: "Keep it to one short word. It scales with the viewport and is set to never wrap, so anything long is simply cut off rather than reflowed, and the name you actually want read belongs in brand or meta.",
          },
        ],
      },
      {
        id: "slots",
        title: "Filling it in",
        blocks: [
          {
            kind: "text",
            text: "Everything except the heading and the wordmark is optional, and each slot takes whatever you give it. There is no link list baked in, no newsletter form, and no social row -- pass your own navigation and it is laid out with the rest.",
          },
          {
            kind: "list",
            items: [
              "eyebrow and heading carry the line you want people to leave with.",
              "action is the single thing you want them to do next, not three things.",
              "navigation takes your own list markup, so the grouping is yours.",
              "brand and meta hold the small print along the bottom edge.",
            ],
          },
          {
            kind: "text",
            text: "This is a server component: it holds no state and no effects, so it can render on the server and ship no JavaScript. Import it from its own entry to keep it that way.",
          },
        ],
      },
    ],
    props: [
      [
        "wordmark",
        "string",
        "The oversized closing brand name. The only required prop.",
      ],
      [
        "columns",
        "FooterColumn[]",
        "Labelled link columns. Wins over navigation.",
      ],
      [
        "related",
        "FooterColumn",
        "A wrapping row of links set apart above the closing row.",
      ],
      [
        "renderLink",
        "(link: FooterLink) => ReactNode",
        "Renders every link, for your framework's link component.",
      ],
      ["heading", "ReactNode", "A line to lead with, or a logo. Optional."],
      ["eyebrow", "ReactNode", "A short label above the heading."],
      [
        "description",
        "ReactNode",
        "Supporting copy, held to about 36 characters a line.",
      ],
      ["social", "ReactNode", "A row of icon links under the description."],
      ["action", "ReactNode", "A primary link or button."],
      [
        "navigation",
        "ReactNode",
        "Your own markup, when the columns do not fit.",
      ],
      [
        "brand, meta",
        "ReactNode, ReactNode",
        "Open the closing row: ownership and small print.",
      ],
      [
        "legal, status",
        "ReactNode, ReactNode",
        "Close it: terms in the middle, a status on the right.",
      ],
      [
        "className",
        "string",
        "Classes for the footer element. Set the ground here.",
      ],
    ],
    accessibility:
      "A semantic footer element, and a real heading when you give it one rather than an empty one when you do not. A link marked external opens in a new tab, carries rel=noreferrer noopener, and says so in its accessible name -- led by a comma, because a leading space is dropped when that name is computed. Column labels are plain text rather than headings, so a long directory does not litter the page outline. The oversized wordmark is decoration and hidden from assistive technology.",
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
    sections: [
      {
        id: "layouts",
        title: "Grid or masonry",
        blocks: [
          {
            kind: "text",
            text: "The grid gives every image the same cell, which is the right choice when the pictures are alike and comparison matters. Masonry uses CSS columns and lets each image keep its own height, which suits a mixed set where cropping would be a loss.",
          },
          {
            kind: "text",
            text: "Masonry fills one column top to bottom before starting the next, so the visual order runs down rather than across. Where sequence carries meaning -- pages of a document, steps in order -- use the grid, because the reading order people expect and the order they are laid out in will not match.",
          },
        ],
      },
      {
        id: "sizing",
        title: "Dimensions and loading",
        blocks: [
          {
            kind: "text",
            text: "Give width and height wherever you know them. They reserve the right space before the image arrives, so the gallery does not reflow underneath the reader as pictures load -- and in masonry, so the columns do not rebalance twice.",
          },
          {
            kind: "text",
            text: 'Everything below the fold should stay lazy. Set loading to "eager" only for the first row or two, which are the ones the reader is waiting on.',
          },
          {
            kind: "text",
            text: "Base UI supplies the lightbox dialog, with its focus trap, scroll lock, Escape handling, and focus restoration, so this component is imported from its own entry and needs @base-ui/react installed.",
          },
        ],
      },
    ],
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
      "The code region is focusable so it can be scrolled from the keyboard. Copying announces itself through a polite live region, and the copy control renames itself once it succeeds. A clipboard that refuses -- denied permission, an insecure context, a sandboxed frame -- is caught and reported rather than leaving the control looking like it worked. Line numbers and the diff-style gutter are aria-hidden, so a screen reader reads the source rather than the decoration. There is no syntax highlighting and no highlighting dependency.",
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
    sections: [
      {
        id: "storing",
        title: "The rating is yours to keep",
        blocks: [
          {
            kind: "text",
            text: "The row reports a rating and remembers nothing. Left uncontrolled it holds the choice for as long as the component is mounted, which is enough for a page that will not outlive the conversation. Pass feedback and it holds nothing at all, and what is shown is whatever you say it is.",
          },
          {
            kind: "text",
            text: "Control it whenever the rating is stored, so a failed write does not leave a thumb lit for something that was never recorded.",
          },
          {
            kind: "code",
            code: `const [feedback, setFeedback] = useState<ResponseFeedback>(null)

<ResponseActions
  copyText={answer}
  feedback={feedback}
  onFeedbackChange={async (next) => {
    setFeedback(next)
    try {
      await rate(messageId, next)
    } catch {
      setFeedback(feedback)
    }
  }}
/>`,
          },
          {
            kind: "text",
            text: "Choosing the current rating again clears it, and reports null. Treat that as a real answer -- someone withdrawing an opinion -- rather than as no answer.",
          },
        ],
      },
      {
        id: "placement",
        title: "Where it goes",
        blocks: [
          {
            kind: "text",
            text: "Message already has an actions slot beneath its content, and this is built to sit in it. Keeping it there means the controls line up down the conversation instead of drifting with the length of each answer.",
          },
          {
            kind: "text",
            text: "Only the controls you configure appear, so an answer that cannot usefully be retried simply has no retry button rather than a dead one. Anything else you need -- a share, a report, an overflow menu -- goes in as children and lands at the end of the row.",
          },
        ],
      },
    ],
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
      "The row is a labelled group of named buttons, so each one reads on its own. Ratings are toggles carrying aria-pressed, and choosing the current rating again clears it. Copying announces itself through a polite live region, and a refused clipboard is reported rather than silently doing nothing. The controls are 32px, matching the other compact toolbars in this set rather than the 44px targets used for primary actions; pass a className to enlarge them where this row is the main way to act.",
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
    sections: [
      {
        id: "native",
        title: "Why native disclosures",
        blocks: [
          {
            kind: "text",
            text: "Each row is a details element with a summary, rather than a button and a div wired together with state. That is not nostalgia: it means the open and closed state, the keyboard handling, and the accessible relationship between the two halves come from the browser, and none of it can drift as the component changes.",
          },
          {
            kind: "text",
            text: "It also means collapsed answers are still in the page and still findable. Pressing find-in-page on a word inside a closed panel scrolls to it and opens the panel, which no scripted accordion does for free.",
          },
        ],
      },
      {
        id: "exclusive",
        title: "One at a time",
        blocks: [
          {
            kind: "text",
            text: "Exclusivity comes from giving every details element the same name attribute, which the browser then enforces -- opening one closes the others, with no state of ours involved. Pass exclusive={false} and the name is dropped, so any number can be open at once.",
          },
          {
            kind: "text",
            text: "In a browser too old to know the name attribute, nothing breaks: the panels simply all stay open, which is the right thing to degrade to. Set defaultOpen to the ids that should start open, and leave it out for a set that starts closed.",
          },
          {
            kind: "code",
            code: `<Accordion
  items={questions}
  defaultOpen={["licence"]}
  onToggle={(id, open) => open && track("faq_opened", { id })}
/>`,
          },
        ],
      },
    ],
    types: [
      {
        name: "AccordionItem",
        rows: [
          [
            "id",
            "string",
            "Unique within the set. What defaultOpen and onToggle name.",
          ],
          ["title", "ReactNode", "The summary line."],
          [
            "content",
            "ReactNode",
            "The panel, which stays in the page while closed.",
          ],
        ],
      },
    ],
    props: [
      ["items", "AccordionItem[]", "Each with an id, a title, and content."],
      [
        "exclusive",
        "boolean",
        "Keeps one panel open at a time. Defaults to true.",
      ],
      [
        "classNames",
        "{ item, trigger, marker, content }",
        "Classes added to the parts inside, for a list that is not a card.",
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
      "The default look is a bordered card, and classNames reaches the parts inside so a page that wants a typographic list can have one without rebuilding the disclosure. Open and closed state, keyboard handling, and expansion during find-in-page all come from the native disclosure element rather than scripted state, so the panel content stays searchable while collapsed. Exclusivity uses the shared name attribute for the same reason. Summaries are 44px targets with a visible focus ring, and the marker is decoration the screen reader skips.",
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
    sections: [
      {
        id: "state",
        title: "The example keeps running",
        blocks: [
          {
            kind: "text",
            text: "Switching to the source hides the preview rather than unmounting it. Anything the reader had set up -- a slider moved, a tab chosen, a form half filled -- is still there when they come back, which is the whole reason to put the source behind a tab instead of below the example.",
          },
          {
            kind: "text",
            text: "It also means the example is still alive while hidden. A preview that streams, animates, or polls goes on doing so behind the source tab, so give it a way to stop if that would be wasteful.",
          },
        ],
      },
      {
        id: "source",
        title: "Where the source comes from",
        blocks: [
          {
            kind: "text",
            text: "The code you pass is a string, and nothing extracts it from the example for you. Two copies of the same snippet drift, so read the file at build time rather than retyping it beside the component.",
          },
          {
            kind: "code",
            code: `// A server component can simply read the file it is showing.
const code = await readFile("components/examples/volume.tsx", "utf8")

return (
  <ComponentPreview code={code} title="Volume">
    <VolumeExample />
  </ComponentPreview>
)`,
          },
          {
            kind: "text",
            text: "Omit code entirely and the tabs disappear, leaving a framed example. That is the right shape for something that has no source worth showing.",
          },
        ],
      },
    ],
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
      "The two views are a real tablist: Left and Right Arrow move between tabs, only the selected tab is in the tab order, and each panel is labelled by its tab. The preview panel is hidden rather than unmounted while the source shows, so anything set up in the example is still there on the way back. Copying announces itself through a polite live region, and a refused clipboard is reported rather than silently doing nothing.",
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
    sections: [
      {
        id: "tokens",
        title: "What each token becomes",
        blocks: [
          {
            kind: "text",
            text: "Write the chord the way you think about it and let the platform decide how it is spelled. Mod is the one that matters: it is Command on Apple platforms and Control everywhere else, which is exactly the distinction most shortcut hints get wrong by hard-coding one of them.",
          },
          {
            kind: "table",
            headers: ["Token", "Apple", "Elsewhere"],
            rows: [
              ["Mod", "⌘", "Ctrl"],
              ["Alt or Option", "⌥", "Alt"],
              ["Shift", "⇧", "Shift"],
              ["Ctrl", "⌃", "Ctrl"],
              ["Enter", "↵", "Enter"],
              ["Escape", "Esc", "Esc"],
            ],
          },
          {
            kind: "text",
            text: "Anything unrecognised is passed through, with a single letter upper-cased, so Mod+K and Mod+Shift+P both read correctly without a special case.",
          },
        ],
      },
      {
        id: "binding",
        title: "It only says the shortcut",
        blocks: [
          {
            kind: "text",
            text: "Nothing is bound. This renders a hint and no more, so the keys shown and the keys that work are kept in step by you. Where a component already owns the shortcut -- the command palette and its Mod+K, say -- name the same chord here rather than inventing a second source of truth.",
          },
          {
            kind: "code",
            code: `<p>
  Press <Kbd keys="Mod+K" /> to search, or <Kbd keys={["Escape"]} /> to close.
</p>`,
          },
        ],
      },
    ],
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
    slug: "voice-input",
    kind: "component",
    name: "Voice Input",
    family: "Agent UI",
    summary:
      "A microphone that draws what it is hearing, so a live one is told apart from a dead one at a glance.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("voice-input"),
    npmImport: packageImport("VoiceInput", "voice-input"),
    usage: `export function Composer() {
  return (
    <VoiceInput
      maxDuration={60}
      onResult={(recording) => transcribe(recording)}
    />
  )
}`,
    sections: [
      {
        id: "no-transcription",
        title: "It records; it does not transcribe",
        blocks: [
          {
            kind: "text",
            text: "Turning speech into text is a service, not a component. Putting one inside something you copy into your own project would decide your vendor, your billing and your privacy posture on your behalf, so this stops at the recording and hands it to you.",
          },
          {
            kind: "code",
            code: `<VoiceInput
  onResult={async (recording) => {
    const body = new FormData()
    body.append("audio", recording, "speech.webm")
    setText(await (await fetch("/api/transcribe", { method: "POST", body })).text())
  }}
/>`,
            caption:
              "The recording is a Blob, so it posts like any other file.",
          },
        ],
      },
      {
        id: "trust",
        title: "Why it draws",
        blocks: [
          {
            kind: "text",
            text: "A microphone button that only changes colour asks to be trusted. There is no way to tell a working microphone from a muted one, a wrong input device, or a permission that was granted to the page and then revoked by the operating system, until the recording comes back empty.",
          },
          {
            kind: "text",
            text: "Drawing the incoming samples settles it in the first half second: if the trace moves when you speak, the microphone the browser handed over is the one you are talking into.",
          },
          {
            kind: "text",
            text: "The trace is drawn on the shared render surface, so it takes its colour from your theme, stops when it is scrolled out of view, and survives a lost GPU context like every other surface here.",
          },
        ],
      },
      {
        id: "states",
        title: "The states it can be in",
        blocks: [
          {
            kind: "text",
            text: "A refusal, a missing device and a browser that cannot record are three different problems with three different remedies, so they are three different messages rather than one failure.",
          },
          {
            kind: "table",
            headers: ["Status", "What happened"],
            rows: [
              [
                "unsupported",
                "No MediaRecorder, so the control is disabled rather than dead",
              ],
              ["idle", "Ready, nothing held"],
              ["requesting", "Waiting on the permission prompt"],
              ["listening", "Recording, and drawing what it hears"],
              ["denied", "Permission refused"],
              ["error", "The device could not be started"],
            ],
          },
          {
            kind: "text",
            text: "The status is also on the element as data-status, so a composer can style around it without lifting the state.",
          },
        ],
      },
      {
        id: "letting-go",
        title: "Letting go of the microphone",
        blocks: [
          {
            kind: "text",
            text: "The recording indicator staying lit after a component thinks it has stopped is the usual bug here, and it is a privacy one. Every track is stopped and the audio context is closed when recording ends, when the component unmounts, and when a start fails partway through.",
          },
        ],
      },
    ],
    props: [
      [
        "onResult",
        "(recording: Blob) => void",
        "The audio, once recording stops.",
      ],
      ["onStart, onStop", "() => void", "Either end of a recording."],
      [
        "onStatusChange",
        "(status: VoiceInputStatus) => void",
        "Every state change, if you are mirroring it elsewhere.",
      ],
      [
        "maxDuration",
        "number",
        "Seconds after which it stops on its own. Off by default.",
      ],
      [
        "color",
        "string",
        'A theme token for the trace. Defaults to "--primary".',
      ],
      [
        "mimeType",
        "string",
        "Preferred container. Ignored when the browser cannot honour it.",
      ],
      ["label", "string", "The button's accessible name when idle."],
      [
        "disabled",
        "boolean",
        "Turns the control off without changing its state.",
      ],
    ],
    accessibility:
      "The button carries aria-pressed, so the difference between recording and not is in the accessibility tree rather than only in the icon. Every state change is announced through a polite live region, and the visible message is marked aria-hidden because it is the same sentence: it is said once, not once on screen and once aloud. The trace is decoration and never carries meaning the words do not, which matters because under prefers-reduced-motion it is not drawn at all -- a single painted frame would sit frozen while the microphone was open, so the words and the elapsed time take over instead.",
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
    sections: [
      {
        id: "placement",
        title: "Where it belongs",
        blocks: [
          {
            kind: "text",
            text: "Put it where the send control was. Someone who has just started an answer is still looking at that spot, and a stop button somewhere else costs them a search at exactly the moment they want it to be over. Prompt Input does this for you by swapping its own control while streaming.",
          },
          {
            kind: "text",
            text: "It renders nothing when there is nothing to stop, rather than dimming. A disabled stop button is a small lie: it suggests the option exists and is unavailable, when in fact there is simply no work in flight.",
          },
        ],
      },
      {
        id: "escape",
        title: "Escape, and the promise it makes",
        blocks: [
          {
            kind: "text",
            text: "Escape is bound while running and unbound the moment it stops, so the key never quietly does something on a page where nothing is happening. Turn it off with shortcut={false} where Escape already belongs to something else -- a dialog holding the composer, for instance, which should close rather than interrupt.",
          },
          {
            kind: "text",
            text: "Whatever onStop does, it should genuinely stop: abort the request, not just hide the text. A stop that only stops the display leaves the model running, the bill accruing, and the answer arriving anyway if the component remounts.",
          },
          {
            kind: "code",
            code: `const controller = useRef<AbortController>(null)

<StopGenerating
  running={streaming}
  startedAt={startedAt}
  onStop={() => controller.current?.abort()}
/>`,
          },
        ],
      },
    ],
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
    sections: [
      {
        id: "segments",
        title: "Showing where it went",
        blocks: [
          {
            kind: "text",
            text: "A single number tells someone they are running out; segments tell them what to do about it. Splitting the bar by what spent the budget -- the system prompt, the history, attached files -- turns a warning into a decision, because the largest band is the thing worth dropping.",
          },
          {
            kind: "code",
            code: `<TokenMeter
  limit={200_000}
  segments={[
    { label: "System", value: 4_200 },
    { label: "History", value: 71_000 },
    { label: "Files", value: 18_400 },
  ]}
/>`,
            caption:
              "Segments are drawn in the order given, and their sum becomes the total.",
          },
          {
            kind: "text",
            text: "Order them by how permanent they are, most fixed first, so the part someone can actually reduce ends up at the changing edge of the bar rather than in the middle.",
          },
        ],
      },
      {
        id: "thresholds",
        title: "Running out",
        blocks: [
          {
            kind: "text",
            text: "Past warnAt -- four fifths of the limit by default -- the reading turns and the component marks itself tight, which you can style against. Lower it when hitting the limit is expensive to recover from, so the warning arrives while there is still room to act on it.",
          },
          {
            kind: "text",
            text: "format decides how both numbers read. The default abbreviates, which is right for a window of two hundred thousand; pass your own where exactness matters, or where the budget is money rather than tokens.",
          },
        ],
      },
    ],
    types: [
      {
        name: "TokenSegment",
        rows: [
          ["label", "string", "Named in the key beneath the bar."],
          ["value", "number", "Counted towards the total."],
          [
            "color",
            "string",
            "Any CSS colour. A theme shade is used when omitted.",
          ],
        ],
      },
    ],
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
    sections: [
      {
        id: "scores",
        title: "About that percentage",
        blocks: [
          {
            kind: "text",
            text: "score is a fraction from 0 to 1, clamped, and shown as a percentage. What it means is entirely your retriever's business: a cosine similarity, a reranker's output, and a BM25 score are three different quantities, and none of them is a probability that the answer is correct.",
          },
          {
            kind: "text",
            text: "So show it only where the reader can act on it. A number that always reads between 80 and 90 percent teaches nobody anything, and a confident-looking percentage attached to a bad passage is worse than no number at all. Leave score out and the bar disappears.",
          },
        ],
      },
      {
        id: "snippets",
        title: "Making a source checkable",
        blocks: [
          {
            kind: "text",
            text: "The snippet should be the passage the claim actually rests on, not the opening of the document. The whole value of showing sources is that someone can check the claim in a second, and a first paragraph that happens to sit above the relevant text does not let them.",
          },
          {
            kind: "text",
            text: "Where there is no url -- an internal document, a chunk from your own store -- the card still works and simply stops being a link. Give it a source in that case, since the host it would otherwise fall back to does not exist.",
          },
          {
            kind: "code",
            code: `<SourceCard
  index={1}
  title="Refund policy, section 4"
  source="Support handbook"
  snippet="Refunds are issued to the original payment method within ten working days."
/>`,
          },
        ],
      },
    ],
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
    kind: "component",
    name: "Empty State",
    family: "Feedback",
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
    sections: [
      {
        id: "writing",
        title: "Writing one worth reading",
        blocks: [
          {
            kind: "text",
            text: "An empty state is the first thing many people see, and it is usually written last. The default -- No data -- tells someone what they can already see and nothing about what to do, which turns a starting point into a dead end.",
          },
          {
            kind: "list",
            items: [
              "Say what is missing in the words of the thing itself: No documents yet, not No results.",
              "Say why the space is empty, when the reason is not obvious: nothing uploaded yet reads very differently from a filter that matched nothing.",
              "Offer the one action that fills it, and only one. A choice of three is a menu, not a way forward.",
            ],
          },
          {
            kind: "text",
            text: "Distinguish the two kinds. Nothing has ever been here is an invitation, and should show someone how to begin. Nothing matched what you asked for is a result, and should offer a way back -- clearing the filter, widening the search -- rather than the same create button.",
          },
        ],
      },
      {
        id: "fitting",
        title: "Fitting the space",
        blocks: [
          {
            kind: "text",
            text: 'The default has room to breathe, for a page or a large panel that is otherwise blank. Use size="sm" inside a card, a sidebar, or a column where a tall empty box would push the rest of the layout around.',
          },
          {
            kind: "text",
            text: "The description is held to a readable measure rather than stretching the full width of whatever contains it, so it stays legible in a wide panel without any work on your part.",
          },
        ],
      },
    ],
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
  {
    slug: "footer-columns",
    kind: "component",
    name: "Footer Columns",
    family: "Blocks",
    summary:
      "Labelled columns of links, with the column count and the link rendering left to you.",
    dependencies: [],
    install: registryInstallCommand("footer-columns"),
    npmImport: packageImport("FooterColumns", "footer-columns"),
    usage: `export function Links() {
  return (
    <FooterColumns
      columnCount={4}
      columns={groups}
      renderLink={({ href, label }) => <Link href={href}>{label}</Link>}
    />
  )
}`,
    props: [
      [
        "columns",
        "FooterColumn[]",
        "The groups, each with an optional label and its links.",
      ],
      ["columnCount", "number", "Columns at the widest size. Defaults to 3."],
      [
        "renderLink",
        "(link: FooterLink) => ReactNode",
        "Renders every link, for your framework's link component.",
      ],
    ],
    sections: [
      {
        id: "count",
        title: "How many columns",
        blocks: [
          {
            kind: "text",
            text: "One column below the small breakpoint, two above it, and columnCount at the widest. Six groups in a three-column grid is a different footer from six groups in a row, and only you know which one you meant.",
          },
          {
            kind: "text",
            text: "The count travels as a custom property rather than a class, because a class assembled from a variable is never generated: Tailwind reads class names as literal text.",
          },
          {
            kind: "code",
            code: `<FooterColumns columnCount={6} columns={groups} />`,
          },
        ],
      },
      {
        id: "links",
        title: "Who renders the links",
        blocks: [
          {
            kind: "text",
            text: "Links are plain anchors unless you say otherwise, and one marked external opens in a new tab, carries rel=noreferrer noopener, and says so in its accessible name. renderLink hands each one back instead, which is how a framework's link gets used without this component knowing about it -- along with the styling, which then becomes yours to keep consistent.",
          },
        ],
      },
    ],
    types: [
      {
        name: "FooterColumn",
        rows: [
          [
            "label",
            "ReactNode",
            "The small uppercase heading. Omit for an unlabelled group.",
          ],
          ["links", "FooterLink[]", "The links in the column, in order."],
        ],
      },
      {
        name: "FooterLink",
        rows: [
          ["label", "ReactNode", "The link text."],
          ["href", "string", "Where it goes."],
          [
            "external",
            "boolean",
            "Opens in a new tab, and says so to a screen reader.",
          ],
        ],
      },
    ],
    accessibility:
      "Each group is a list, so a screen reader announces how many links it holds before reading them. Labels are plain text rather than headings, so a long directory does not litter the page outline. An external link says where it goes in its accessible name, led by a comma because a leading space is dropped when that name is computed.",
  },
  {
    slug: "footer-row",
    kind: "component",
    name: "Footer Row",
    family: "Blocks",
    summary:
      "A wrapping row of links under its own label, set apart by a dashed rule.",
    dependencies: [],
    install: registryInstallCommand("footer-row"),
    npmImport: packageImport("FooterRow", "footer-row"),
    usage: `export function OtherProducts() {
  return <FooterRow label="Other products" links={products} />
}`,
    props: [
      ["links", "FooterLink[]", "The links, laid out as a wrapping row."],
      ["label", "ReactNode", "The small uppercase heading. Optional."],
      [
        "renderLink",
        "(link: FooterLink) => ReactNode",
        "Renders every link, as in Footer Columns.",
      ],
      ["rule", "boolean", "The dashed rule above. Defaults to true."],
    ],
    sections: [
      {
        id: "when",
        title: "A row rather than a column",
        blocks: [
          {
            kind: "text",
            text: "Some footer links are a list rather than a category: sister products, a legal strip, an A to Z index. A column would give each of them a heading they do not need and a height they do not fill.",
          },
          {
            kind: "text",
            text: "Nothing is rendered when there are no links, so a row driven by data that happens to be empty leaves no stray rule behind.",
          },
          {
            kind: "code",
            code: `<FooterRow label="Other products" links={products} />
<FooterRow links={legal} rule={false} />`,
            caption: "Turn the rule off where the row already sits under one.",
          },
        ],
      },
    ],
    accessibility:
      "Nothing else has to be installed for it: the link shapes it takes are the same ones Footer Columns takes, written out here rather than imported, so the two interchange without either depending on the other. The row is a list, so its length is announced before its contents. The label is plain text rather than a heading, and the rule above it is a border rather than a separator element, so neither adds noise to the page outline.",
  },
  {
    slug: "footer-wordmark",
    kind: "component",
    name: "Footer Wordmark",
    family: "Blocks",
    summary:
      "The oversized brand word that closes a page, drawn as texture rather than content.",
    dependencies: [],
    install: registryInstallCommand("footer-wordmark"),
    npmImport: packageImport("FooterWordmark", "footer-wordmark"),
    usage: `export function Close() {
  return <FooterWordmark>northstar</FooterWordmark>
}`,
    props: [
      ["children", "string", "One short word. It is set never to wrap."],
      [
        "className",
        "string",
        "Classes for the element, to change its size or tint.",
      ],
    ],
    sections: [
      {
        id: "texture",
        title: "Texture, not a heading",
        blocks: [
          {
            kind: "text",
            text: "It is drawn at seven percent of the surrounding text colour and clipped by the edge of the page, which is why it is hidden from assistive technology and unselectable: a screen reader announcing an enormous brand name at the end of every page is noise, and a word that is half off-screen is not something anyone should be selecting.",
          },
          {
            kind: "text",
            text: "Keep it to one short word. It scales with the viewport and never wraps, so anything long is cut off rather than reflowed, and the name you want read belongs in the text above it.",
          },
        ],
      },
    ],
    accessibility:
      "Hidden from assistive technology and taken out of the selection, because it is a texture rather than a name. The tint is mixed from the surrounding text colour, so it stays faint on a light ground and on a dark one without being restyled.",
  },
  {
    slug: "empty-row",
    kind: "component",
    name: "Empty Row",
    family: "Feedback",
    summary:
      "One line saying a list came back empty, for a table, a list, or a popover.",
    dependencies: [],
    install: registryInstallCommand("empty-row"),
    npmImport: packageImport("EmptyRow", "empty-row"),
    usage: `export function Results({ rows }) {
  if (rows.length === 0) {
    return <EmptyRow>No funds match these filters.</EmptyRow>
  }

  return <FundsTable rows={rows} />
}`,
    props: [
      ["children", "ReactNode", 'The line itself. Defaults to "No matches."'],
      ["colSpan", "number", "Renders a table row spanning this many columns."],
      ["className", "string", "Classes for the element."],
    ],
    sections: [
      {
        id: "scale",
        title: "The smallest of three",
        blocks: [
          {
            kind: "text",
            text: "Empty Row is a line inside something. Empty State fills a panel with a title, a sentence, and a way forward. Not Found fills a page. They are separate components rather than sizes of one, because a filtered table wants a line and a blank page wants a heading, and a component that tries to be both is wrong at one end.",
          },
          {
            kind: "text",
            text: "Reach for this one where the surrounding thing already explains itself: a table under its own heading, a search popover, a filter pane. There is nothing to introduce, only a result to report.",
          },
        ],
      },
      {
        id: "tables",
        title: "Inside a table",
        blocks: [
          {
            kind: "text",
            text: "A paragraph is not valid inside a table body, and a row that does not span the columns leaves the message wedged under the first one. Pass colSpan and the component renders the row and the cell for you.",
          },
          {
            kind: "code",
            code: `<tbody>
  {rows.length === 0 ? (
    <EmptyRow colSpan={columns.length}>Nothing filed yet.</EmptyRow>
  ) : (
    rows.map((row) => <Row key={row.id} {...row} />)
  )}
</tbody>`,
          },
        ],
      },
    ],
    accessibility:
      "A row inside a table is a real table row spanning every column, so the table's shape stays intact and a screen reader reads the message once rather than as a stray cell. Elsewhere it is a paragraph, announced by whatever region already holds the list. It is not a live region: put it in one only if the list can empty while someone is reading it.",
  },
  {
    slug: "not-found",
    kind: "component",
    name: "Not Found",
    family: "Feedback",
    summary:
      "The page-scale empty state: a status, a heading you can read across a room, and somewhere to go.",
    dependencies: [],
    install: registryInstallCommand("not-found"),
    npmImport: packageImport("NotFound", "not-found"),
    usage: `export default function NotFoundPage() {
  return (
    <NotFound
      code="404"
      title="That page moved, or never existed."
      description="If you followed a link, the page may have been renamed."
      actions={<Link href="/docs">Browse the docs</Link>}
    >
      <PopularPages />
    </NotFound>
  )
}`,
    props: [
      [
        "title",
        "ReactNode",
        "The line that carries it. The only required prop.",
      ],
      ["code", "ReactNode", 'The status above the title, such as "404".'],
      [
        "description",
        "ReactNode",
        "What likely happened, held to a readable measure.",
      ],
      ["actions", "ReactNode", "Where to go instead."],
      [
        "children",
        "ReactNode",
        "Anything more: a search, a list of likely destinations.",
      ],
    ],
    sections: [
      {
        id: "writing",
        title: "Saying what happened",
        blocks: [
          {
            kind: "text",
            text: "A 404 is the one page nobody chose to visit, so it should spend its words on what to do rather than on apology. Say what probably happened -- a renamed page, a stale link -- and offer the one or two places most people actually wanted.",
          },
          {
            kind: "list",
            items: [
              "Name the likely cause; a bare Not Found tells someone only what they already know.",
              "Offer a way onward that does not require guessing a URL.",
              "Keep the status as a code above the title rather than as the title itself, so the sentence is the thing read first.",
            ],
          },
          {
            kind: "text",
            text: "The same shape suits any dead end with a page to itself: a deleted record, an expired invitation, a region you cannot serve. The heading changes, the structure does not.",
          },
        ],
      },
    ],
    accessibility:
      "The title is the page's h1, because on a page whose only content is this, it is the heading. The status code sits above it as plain text rather than as part of the heading, so the sentence is what a screen reader announces first. Nothing here traps focus or announces itself; the controls inside are your own, with your own semantics.",
  },
  {
    slug: "image-grid",
    kind: "component",
    name: "Image Grid",
    family: "Blocks",
    summary:
      "Thumbnails in even cells or masonry columns, with nothing but React behind them.",
    dependencies: [],
    install: registryInstallCommand("image-grid"),
    npmImport: packageImport("ImageGrid", "image-grid"),
    usage: `export function Shots() {
  return (
    <ImageGrid
      images={shots}
      layout="masonry"
      onSelect={(image) => open(image.id)}
    />
  )
}`,
    props: [
      ["images", "GalleryImage[]", "The thumbnails, in order."],
      [
        "layout",
        '"grid" | "masonry"',
        'Even cells, or each image at its own height. Defaults to "grid".',
      ],
      [
        "onSelect",
        "(image, event) => void",
        "Makes every tile a button. Without it the grid is not interactive.",
      ],
      [
        "renderImage",
        "(image: GalleryImage) => ReactNode",
        "Replaces the img, for a framework's image component.",
      ],
      [
        "emptyState",
        "ReactNode",
        "Shown in place of the grid when there is nothing.",
      ],
    ],
    sections: [
      {
        id: "interactive",
        title: "A grid, or a set of buttons",
        blocks: [
          {
            kind: "text",
            text: "Without onSelect the tiles are plain elements: a grid of pictures is not a set of controls, and making it one puts a stop on every image for anyone moving through the page by keyboard. Give it onSelect and each tile becomes a named button, which is what you want when choosing one opens something.",
          },
          {
            kind: "text",
            text: "onSelect hands back the event as well as the image, so you can keep the element that was clicked and return focus to it when whatever you opened closes.",
          },
          {
            kind: "code",
            code: `const trigger = useRef<HTMLButtonElement>(null)

<ImageGrid
  images={images}
  onSelect={(image, event) => {
    trigger.current = event.currentTarget
    setOpenId(image.id)
  }}
/>
<Lightbox images={images} openId={openId} finalFocus={trigger} onOpenIdChange={setOpenId} />`,
          },
        ],
      },
      {
        id: "layouts",
        title: "Grid or masonry",
        blocks: [
          {
            kind: "text",
            text: "The grid gives every image the same cell, which suits a set that should be compared. Masonry uses CSS columns and lets each keep its own height, which suits a mixed set where cropping would lose something.",
          },
          {
            kind: "text",
            text: "Masonry fills one column top to bottom before starting the next, so the reading order runs down rather than across. Where the order carries meaning, use the grid.",
          },
        ],
      },
    ],
    types: [
      {
        name: "GalleryImage",
        rows: [
          ["id", "string", "Unique within the set."],
          ["src", "string", "The image."],
          ["alt", "string", "What it shows. Empty only if it is decorative."],
          [
            "width, height",
            "number",
            "Intrinsic size, to reserve space before it loads.",
          ],
          ["caption", "ReactNode", "Shown over the foot of the tile."],
          ["description", "ReactNode", "Longer text, used by Lightbox."],
          ["downloadUrl", "string", "Offers the original, used by Lightbox."],
          [
            "loading",
            '"eager" | "lazy"',
            "Defaults to lazy. Eager for the first row.",
          ],
        ],
      },
    ],
    accessibility:
      "Tiles are only buttons when choosing one does something, so a decorative grid does not fill the tab order. Each button is named for the image it opens. Captions are rendered as text over the image rather than as its accessible name, so alt still describes the picture. Width and height reserve space before the image arrives, which keeps the grid from reflowing under the reader.",
  },
  {
    slug: "lightbox",
    kind: "component",
    name: "Lightbox",
    family: "Blocks",
    summary:
      "One image at a time, full bleed, with the rest of the set a key away.",
    dependencies: ["@base-ui/react", "lucide-react"],
    install: registryInstallCommand("lightbox"),
    npmImport: packageImport("Lightbox", "lightbox"),
    usage: `export function Viewer() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <Lightbox images={images} openId={openId} onOpenIdChange={setOpenId} />
  )
}`,
    props: [
      [
        "images",
        "GalleryImage[]",
        "The whole set, so it can move through them.",
      ],
      ["openId", "string | null", "The image being shown. Null closes it."],
      [
        "onOpenIdChange",
        "(id: string | null) => void",
        "Called to move, and with null to close.",
      ],
      [
        "renderImage",
        "(image: GalleryImage) => ReactNode",
        "Replaces the img.",
      ],
      [
        "finalFocus",
        "RefObject<HTMLElement>",
        "Where focus lands on close, usually the tile that opened it.",
      ],
      ["closeLabel", "string", 'Names the close control. Defaults to "Close".'],
    ],
    sections: [
      {
        id: "state",
        title: "It holds nothing",
        blocks: [
          {
            kind: "text",
            text: "Which image is showing is yours: openId in, onOpenIdChange out, including the null that closes it. That is what lets the same lightbox be opened from a grid, from a table row, or from a link somewhere else on the page, and what lets the open image live in the URL if you want it to.",
          },
          {
            kind: "text",
            text: "Moving through the set is the component's job. Left and Right Arrow wrap around the ends, and the controls are hidden entirely when there is only one image, rather than shown doing nothing.",
          },
        ],
      },
      {
        id: "dialog",
        title: "What Base UI is doing here",
        blocks: [
          {
            kind: "text",
            text: "The focus trap, the scroll lock, Escape, the backdrop, and returning focus on close all come from Base UI's dialog rather than from anything written here, which is why this is the only part of a gallery that needs it. Image Grid needs nothing but React.",
          },
          {
            kind: "text",
            text: "Pass finalFocus so focus returns to the tile that opened the image rather than to the top of the page.",
          },
        ],
      },
    ],
    accessibility:
      "It takes the same image shape Image Grid takes, written out here rather than imported, so neither has to be installed for the other. A real dialog: focus is trapped while it is open, the page behind it does not scroll, Escape closes it, and focus returns to finalFocus afterwards. The image's alt is the dialog's accessible name, and its position in the set is the description, so a screen reader hears which of how many it is. Arrow keys move; the previous and next controls are absent rather than disabled when there is nowhere to go.",
  },
  {
    slug: "spinner",
    kind: "component",
    name: "Spinner",
    family: "Feedback",
    summary:
      "The smallest way to say something is happening, for a control that is working.",
    dependencies: [],
    install: registryInstallCommand("spinner"),
    npmImport: packageImport("Spinner", "spinner"),
    usage: `export function Save({ saving }) {
  return (
    <button disabled={saving}>
      {saving ? <Spinner size={14} /> : null}
      {saving ? "Saving" : "Save"}
    </button>
  )
}`,
    props: [
      ["size", "number", "Width and height in pixels. Defaults to 16."],
      [
        "label",
        "string",
        "Announced while it turns. Without one it is decoration.",
      ],
      [
        "className",
        "string",
        "Classes for the element. Colour comes from currentColor.",
      ],
    ],
    sections: [
      {
        id: "which",
        title: "Spinner or skeleton",
        blocks: [
          {
            kind: "text",
            text: "A spinner says work is under way. A skeleton says content has not arrived and holds its place. Reach for the spinner when something you pressed is working, and for the skeleton when a region is filling in -- a spinner in the middle of an empty page tells someone to wait without telling them what for.",
          },
          {
            kind: "text",
            text: "Give it a label only when nothing beside it already says what is happening. Two announcements of the same wait is one too many.",
          },
        ],
      },
    ],
    accessibility:
      "With a label it is a status region and announces itself once; without one it is hidden from assistive technology, which is right when the text beside it already says what is happening. It draws in currentColor, so it inherits whatever it sits in. Reduced motion stops the turn and leaves the ring, so a control still reads as busy rather than as an unexplained circle.",
  },
  {
    slug: "skeleton",
    kind: "component",
    name: "Skeleton",
    family: "Feedback",
    summary:
      "A placeholder the shape of what is coming, so the page does not jump when it arrives.",
    dependencies: [],
    install: registryInstallCommand("skeleton"),
    npmImport: packageImport("Skeleton", "skeleton"),
    usage: `export function Card({ article }) {
  if (!article) {
    return (
      <div aria-busy="true" className="grid gap-3">
        <Skeleton className="h-40" />
        <Skeleton lines={3} />
      </div>
    )
  }

  return <Article {...article} />
}`,
    props: [
      [
        "lines",
        "number",
        "Render this many bars, the last one short, as text would be.",
      ],
      ["className", "string", "The shape: a height, a width, a radius."],
    ],
    sections: [
      {
        id: "shape",
        title: "Shaped like the thing it stands in for",
        blocks: [
          {
            kind: "text",
            text: "A skeleton earns its place by taking the room the content will take. One that is the wrong size moves the page twice: once when it appears and again when it is replaced, which is worse than an empty space that fills in.",
          },
          {
            kind: "text",
            text: "So give it the height you know: the avatar is a circle of a fixed size, the card is as tall as a card. Where the length is genuinely unknown, lines renders a block of bars with a short last one, which is what a paragraph looks like from across the room.",
          },
          {
            kind: "code",
            code: `<Skeleton className="size-10 rounded-full" />
<Skeleton className="h-40" />
<Skeleton lines={3} />`,
          },
        ],
      },
      {
        id: "busy",
        title: "Saying it out loud",
        blocks: [
          {
            kind: "text",
            text: "The bars are hidden from assistive technology, because a screen reader has nothing to gain from a description of grey rectangles. That means the waiting is invisible unless you say so: mark the region aria-busy while it loads, and the reader is told to wait rather than hearing an empty container.",
          },
        ],
      },
    ],
    accessibility:
      "Hidden from assistive technology, because a shape standing in for content is not content. Put aria-busy on the region that is filling, so the wait is announced once by the thing that knows about it rather than by every bar. The pulse stops under reduced motion.",
  },
  {
    slug: "status-pill",
    kind: "component",
    name: "Status Pill",
    family: "Feedback",
    summary: "A dot and a few words: operational, degraded, closed.",
    dependencies: [],
    install: registryInstallCommand("status-pill"),
    npmImport: packageImport("StatusPill", "status-pill"),
    usage: `export function Health({ status }) {
  return (
    <StatusPill href="/status" tone={status.tone}>
      {status.label}
    </StatusPill>
  )
}`,
    props: [
      [
        "children",
        "ReactNode",
        "The words. They carry the state, not the dot.",
      ],
      [
        "tone",
        '"ok" | "warn" | "down" | "idle"',
        'The dot colour. Defaults to "ok".',
      ],
      [
        "href",
        "string",
        "Makes it a link, for a status page or a health check.",
      ],
      ["plain", "boolean", "A quiet line rather than a bordered pill."],
    ],
    sections: [
      {
        id: "words",
        title: "The words do the work",
        blocks: [
          {
            kind: "text",
            text: "The dot is decoration and the label is the state. That is not only for colour blindness: a green dot alone says nothing about whether the thing is up, degraded, or simply not open yet, and the reader has to know your palette to guess.",
          },
          {
            kind: "text",
            text: "Write the label as the state rather than as a category. All systems operational reads better than Status: OK, and Market closed says more than Idle.",
          },
          {
            kind: "code",
            code: `<StatusPill>All systems operational</StatusPill>
<StatusPill tone="warn">Degraded: search is slow</StatusPill>
<StatusPill tone="idle" plain>Market closed</StatusPill>`,
          },
        ],
      },
    ],
    accessibility:
      "The dot is hidden from assistive technology and the label is read as ordinary text, so the state never depends on seeing a colour. With an href it becomes a link and inherits link semantics; without one it is a plain span rather than a control, because a status is something to read, not something to press. The tone is exposed as a data attribute for styling and for tests.",
  },
  {
    slug: "copy-button",
    kind: "component",
    name: "Copy Button",
    family: "Controls",
    summary:
      "Copies a value and says whether it worked, including when the clipboard refuses.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("copy-button"),
    npmImport: packageImport("CopyButton", "copy-button"),
    usage: `export function Key({ apiKey }) {
  return (
    <CopyButton value={apiKey} onCopied={() => track("key_copied")}>
      Copy key
    </CopyButton>
  )
}`,
    props: [
      ["value", "string", "What lands on the clipboard."],
      ["children", "ReactNode", "Shown beside the icon. Omit for icon only."],
      [
        "label, copiedLabel, errorLabel",
        "string",
        "The three things it can say.",
      ],
      [
        "onCopied",
        "(value: string) => void",
        "Called after a copy that worked.",
      ],
      [
        "onCopyError",
        "(error: unknown) => void",
        "Called when the clipboard refused.",
      ],
    ],
    sections: [
      {
        id: "refusal",
        title: "When the clipboard refuses",
        blocks: [
          {
            kind: "text",
            text: "navigator.clipboard.writeText rejects more often than it looks: a page served over http, a sandboxed frame, a browser that wants a user gesture it did not see, a permission that was denied. Left unhandled the button does nothing, says nothing, and leaves an unhandled rejection behind.",
          },
          {
            kind: "text",
            text: "This one catches it, says so, and tells you through onCopyError. Reach for that when there is somewhere better to put the failure -- a toast, or a field the reader can select from by hand.",
          },
        ],
      },
    ],
    accessibility:
      "The outcome is announced through a polite live region whether or not the label is visible, so an icon-only button is not silent. With no visible text it takes the current wording as its accessible name, which changes to say what happened. Copying is one press, and nothing about it depends on hovering.",
  },
  {
    slug: "secret-field",
    kind: "component",
    name: "Secret Field",
    family: "Controls",
    summary:
      "An API key or token: hidden until asked for, copied whole either way.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("secret-field"),
    npmImport: packageImport("SecretField", "secret-field"),
    usage: `export function Key({ apiKey }) {
  return (
    <SecretField
      label="API key"
      value={apiKey}
      visiblePrefix={7}
      onCopied={() => track("key_copied")}
    />
  )
}`,
    props: [
      [
        "value",
        "string",
        "The secret. Copied in full whether or not it is showing.",
      ],
      [
        "visiblePrefix, visibleSuffix",
        "number, number",
        "Characters left readable at each end. Default 0 and 4.",
      ],
      [
        "masked, defaultMasked",
        "boolean, boolean",
        "Controlled and uncontrolled hiding.",
      ],
      [
        "onMaskedChange",
        "(masked: boolean) => void",
        "Called when it is shown or hidden.",
      ],
      [
        "revealable",
        "boolean",
        "Drop the reveal control for a value that must never be shown.",
      ],
      ["copyable", "boolean", "Show the copy control. Defaults to true."],
      [
        "onCopied",
        "(value: string) => void",
        "Called after a copy that worked.",
      ],
      [
        "label",
        "string",
        'Names the thing, in every control. Defaults to "Secret".',
      ],
    ],
    sections: [
      {
        id: "masking",
        title: "What stays readable",
        blocks: [
          {
            kind: "text",
            text: "A fully masked key is hard to tell apart from another fully masked key, which matters the moment someone has more than one. Leaving the prefix and the last few characters visible makes them distinguishable at a glance without giving the secret away -- sk_live_••••1a2b is recognisably not sk_test_••••9f3c.",
          },
          {
            kind: "code",
            code: `<SecretField value={key} visiblePrefix={8} visibleSuffix={4} />`,
            caption:
              "The run of dots is capped, so a long token does not stretch the row.",
          },
          {
            kind: "text",
            text: "Copying takes the whole value either way. Someone reaching for the copy button has decided already, and making them reveal it first only puts the secret on screen.",
          },
        ],
      },
      {
        id: "care",
        title: "The part this cannot do",
        blocks: [
          {
            kind: "text",
            text: "Masking is a courtesy to whoever is stood behind the reader. The value is in the page either way, so it is in the DOM, in the memory of the tab, and in anything that screenshots or records it. This component keeps a secret off the screen; it does not keep it out of the browser.",
          },
          {
            kind: "list",
            items: [
              "Send the secret only to someone entitled to it; masking is not authorisation.",
              "Show a key in full once, at creation, and store only a prefix and a hash.",
              "Where it must never be shown again, pass revealable={false} and leave copy as the only way to use it.",
            ],
          },
        ],
      },
    ],
    accessibility:
      "While hidden, the run of dots is taken out of the accessibility tree and replaced with a spoken state, because a screen reader announcing forty bullets is worse than useless. The reveal control carries aria-pressed, so its state is known without seeing the icon. Copying announces its outcome through a polite live region, and a clipboard that refuses is reported rather than passing as success.",
  },
  {
    slug: "pagination",
    kind: "component",
    name: "Pagination",
    family: "Wayfinding",
    summary:
      "Page numbers with gaps where the run is broken, as buttons or as your own links.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("pagination"),
    npmImport: packageImport("Pagination", "pagination"),
    usage: `export function Results({ page, pageCount }) {
  return (
    <Pagination
      page={page}
      pageCount={pageCount}
      onPageChange={setPage}
    />
  )
}`,
    props: [
      ["page", "number", "The current page, counting from one."],
      [
        "pageCount",
        "number",
        "How many there are. One or fewer renders nothing.",
      ],
      [
        "onPageChange",
        "(page: number) => void",
        "Called with the page that was chosen.",
      ],
      [
        "siblingCount",
        "number",
        "Pages either side of the current one. Defaults to 1.",
      ],
      ["boundaryCount", "number", "Pages kept at each end. Defaults to 1."],
      [
        "renderLink",
        "(link: PaginationLink) => ReactNode",
        "Renders every page as your own link.",
      ],
      ["label", "string", 'Names the navigation. Defaults to "Pagination".'],
    ],
    sections: [
      {
        id: "links",
        title: "Buttons, or addresses",
        blocks: [
          {
            kind: "text",
            text: "Buttons suit a list whose page lives in component state. Where the page belongs in the URL -- and on a page anyone might share, bookmark, or let a search engine index, it does -- render real links instead. renderLink hands you the page number and the classes, and you decide what an anchor to it looks like.",
          },
          {
            kind: "code",
            code: `<Pagination
  page={page}
  pageCount={pageCount}
  renderLink={({ page, children, className, ...rest }) => (
    <Link href={\`?page=\${page}\`} className={className} {...rest}>
      {children}
    </Link>
  )}
/>`,
            caption:
              "Spread the rest: it carries the label and, on the current page, aria-current.",
          },
        ],
      },
      {
        id: "range",
        title: "Where the gaps fall",
        blocks: [
          {
            kind: "text",
            text: "Ends are always shown, the current page keeps siblingCount neighbours, and everything between collapses to an ellipsis. A gap costs a slot of its own, so a run short enough to draw whole is drawn whole rather than replaced by something no shorter.",
          },
          {
            kind: "text",
            text: "paginationRange is exported, so the same numbers can be worked out without rendering anything -- for a summary line, or for a test.",
          },
          {
            kind: "code",
            code: `paginationRange({ page: 7, pageCount: 20 })
// [1, "gap", 6, 7, 8, "gap", 20]`,
          },
        ],
      },
    ],
    accessibility:
      "A navigation landmark with a name, so it can be jumped to and told apart from other navigation on the page. Every page is named in full rather than by its digit alone, and the current one carries aria-current so it is announced as where you are rather than as somewhere to go. The ellipsis is decoration and hidden. Previous and next are absent at the ends rather than present and disabled.",
  },
  {
    slug: "side-panel",
    kind: "component",
    name: "Side Panel",
    family: "Wayfinding",
    summary:
      "A pane that comes in from the side: an inspector, a filter set, a row's detail.",
    dependencies: ["@base-ui/react", "lucide-react"],
    install: registryInstallCommand("side-panel"),
    npmImport: packageImport("SidePanel", "side-panel"),
    usage: `export function Inspector({ row, onClose }) {
  return (
    <SidePanel
      open={row !== null}
      onOpenChange={(open) => !open && onClose()}
      title={row?.name}
      description="Everything we hold about this record."
      footer={<button onClick={onClose}>Done</button>}
    >
      <RecordDetail row={row} />
    </SidePanel>
  )
}`,
    props: [
      ["open", "boolean", "Whether it is showing. The state is yours."],
      [
        "onOpenChange",
        "(open: boolean) => void",
        "Called on Escape, on the backdrop, and by the close control.",
      ],
      [
        "side",
        '"left" | "right"',
        'Which edge it comes from. Defaults to "right".',
      ],
      ["title", "ReactNode", "Names the panel, and the dialog."],
      [
        "description",
        "ReactNode",
        "A line under the title, and the dialog's description.",
      ],
      [
        "toolbar",
        "ReactNode",
        "Pinned above the body: filters, a search, tabs.",
      ],
      [
        "footer",
        "ReactNode",
        "Pinned below it: the actions that apply or close.",
      ],
      [
        "modal",
        'boolean | "trap-focus"',
        "trap-focus keeps the page usable behind it.",
      ],
      [
        "dismissible",
        "boolean",
        "Close when the backdrop is pressed. Defaults to true.",
      ],
      [
        "closeOnEscape",
        "boolean",
        "Close on Escape. Turn off where there is unsaved work.",
      ],
      ["hideBackdrop", "boolean", "Leave the scrim out."],
      [
        "stackOffset",
        "string",
        "How far a panel opened inside another sits from the edge.",
      ],
      ["duration", "number", "Milliseconds the slide takes. Defaults to 250."],
      [
        "width",
        "string",
        'Width from the medium breakpoint up. Defaults to "28rem".',
      ],
    ],
    sections: [
      {
        id: "layout",
        title: "What moves and what stays",
        blocks: [
          {
            kind: "text",
            text: "The header, the toolbar, and the footer are pinned; only the body scrolls. That is the difference between a panel and a long page pushed sideways: the thing you opened it to do stays reachable however far down you read.",
          },
          {
            kind: "text",
            text: "Below the medium breakpoint it takes the full width, because a 28rem pane on a phone is a modal with a stripe of unusable backdrop beside it.",
          },
        ],
      },
      {
        id: "modal",
        title: "Taking over, or sitting beside",
        blocks: [
          {
            kind: "text",
            text: "By default it is a modal: focus is trapped, the page behind does not scroll, Escape closes it, and focus returns to whatever opened it. That suits a panel you finish with before carrying on.",
          },
          {
            kind: "text",
            text: 'For an inspector you work beside -- a list you keep clicking while the panel stays open -- pass modal="trap-focus". The page behind stays scrollable and clickable, and focus is still kept inside the panel so tabbing does not wander off into it. Pair it with hideBackdrop, since a scrim over a page you can still use is a lie.',
          },
          {
            kind: "code",
            code: `<SidePanel
  modal="trap-focus"
  hideBackdrop
  open={open}
  title="Inspector"
  onOpenChange={setOpen}
/>`,
          },
        ],
      },
      {
        id: "stacking",
        title: "A panel from a panel",
        blocks: [
          {
            kind: "text",
            text: "Render a Side Panel inside another and it sets itself in from the edge by stackOffset, so the one behind stays visible as a strip rather than disappearing under it. Depth is counted for you: nothing has to be passed down, and a panel three levels in knows where it is.",
          },
          {
            kind: "code",
            code: `<SidePanel open={open} title="Customer" onOpenChange={setOpen}>
  <button onClick={() => setInvoice(true)}>Open the invoice</button>

  <SidePanel open={invoice} title="Invoice" onOpenChange={setInvoice}>
    ...
  </SidePanel>
</SidePanel>`,
            caption:
              "Each level is a dialog of its own, so Escape closes the top one first.",
          },
        ],
      },
      {
        id: "dismissal",
        title: "Refusing to close",
        blocks: [
          {
            kind: "text",
            text: "A panel holding a half-finished form should not vanish because someone pressed Escape or clicked past it. closeOnEscape={false} and dismissible={false} take those away, leaving the close control and whatever you put in the footer as the ways out.",
          },
          {
            kind: "text",
            text: "Take them away only when there is something to lose. A panel that cannot be dismissed and has no obvious way out is a trap, so keep the close control visible whenever you do.",
          },
        ],
      },
    ],
    accessibility:
      "A real dialog: the title names it, the description is read after that name, focus is trapped and restored, and Escape closes it unless you have said otherwise. The panel slides from its edge and stops sliding under reduced motion, arriving in place instead. The close control is named and is the first thing reached after the heading, so leaving never means hunting.",
  },
  {
    slug: "render-surface",
    kind: "component",
    name: "Render Surface",
    family: "Scenes",
    summary:
      "The canvas the other scenes are drawn on. It stays the size of its box, sleeps when nobody is looking at it, and holds still when motion is reduced.",
    dependencies: [],
    install: registryInstallCommand("render-surface"),
    npmImport: packageImport("RenderSurface", "render-surface"),
    usage: `export function Dots() {
  return (
    <RenderSurface
      setup={({ size }) => makeDots(size)}
      draw={({ context, size, state, delta }) => {
        context.setTransform(size.dpr, 0, 0, size.dpr, 0, 0)
        context.clearRect(0, 0, size.width, size.height)
        for (const dot of state) step(context, dot, delta)
      }}
    />
  )
}`,
    props: [
      [
        "setup",
        "(args) => TState",
        "Builds whatever the drawing needs. Runs again after a resize, and after a lost GPU context comes back.",
      ],
      [
        "draw",
        "(args) => void",
        "Called once per frame with the state, the size, the seconds elapsed, and the seconds since the last frame.",
      ],
      ["teardown", "(state) => void", "Releases anything setup acquired."],
      [
        "contextType",
        '"2d" | "webgl" | "none"',
        'Which context to ask the canvas for. "none" hands you the bare canvas for a library that wants to attach its own renderer.',
      ],
      [
        "maxDpr",
        "number",
        "Highest backing store scale. Defaults to 2, because above that the cost climbs faster than the result improves.",
      ],
      [
        "rebuildOnResize",
        "boolean",
        "Whether a resize runs setup again. Defaults to true.",
      ],
      [
        "revision",
        "string | number",
        "Change it to ask for one more frame. Needed by anything whose content arrives late.",
      ],
      ["paused", "boolean", "Stops the loop without unmounting the canvas."],
      [
        "label",
        "string",
        "Announces the canvas as an image with this description. Without one it is hidden from assistive technology as decoration.",
      ],
    ],
    sections: [
      {
        id: "sleeping",
        title: "What it refuses to do",
        blocks: [
          {
            kind: "text",
            text: "A canvas that animates forever is a battery that empties forever. This one stops on its own in three situations, and none of them need anything from the component drawing on it.",
          },
          {
            kind: "list",
            items: [
              "Scrolled out of view. An IntersectionObserver with a 128 pixel margin stops the loop just after the surface leaves the screen and starts it again just before it returns.",
              "Tab hidden. The loop stops on visibilitychange rather than relying on the browser to throttle it.",
              "Reduced motion. One frame is painted and no loop is started at all.",
            ],
          },
          {
            kind: "text",
            text: "That last one is the important one. A reduced motion setting is not a request for a blank rectangle, so the surface still draws -- it draws the scene at rest and leaves it there.",
          },
          {
            kind: "text",
            text: "One frame is enough for a scene that has everything it needs at the moment it mounts, and not enough for one waiting on a picture that has not arrived. That is what revision is for: change it when the late thing turns up and the surface paints once more. Sleeping and waking never rebuild the canvas, because resizing a backing store clears it, and a surface that had painted once would be wiped by the act of stopping.",
          },
        ],
      },
      {
        id: "time",
        title: "Time that does not jump",
        blocks: [
          {
            kind: "text",
            text: "draw receives both time and delta in seconds. Time counts only the frames that were actually drawn, so a scene that was paused for a minute resumes where it stopped rather than skipping a minute forward.",
          },
          {
            kind: "text",
            text: "delta is clamped to a fifteenth of a second. Physics integrated against an unclamped delta after a long stall will throw every particle out of the box in a single step, and clamping is cheaper than discovering that on a slow machine.",
          },
        ],
      },
      {
        id: "resize",
        title: "When a resize should not rebuild",
        blocks: [
          {
            kind: "text",
            text: "By default a resize runs setup again, which is what a particle field wants: the count depends on the area. A setup that acquires something scarce should not do this. A browser allows only a handful of WebGL contexts at once, so a renderer rebuilt on every resize will exhaust them during a single drag of the window edge.",
          },
          {
            kind: "code",
            code: `<RenderSurface
  contextType="none"
  rebuildOnResize={false}
  setup={({ canvas, size }) => makeRenderer(canvas, size)}
  draw={({ size, state }) => {
    if (size.width !== state.width) resizeRenderer(state, size)
    state.renderer.render(state.scene, state.camera)
  }}
/>`,
            caption:
              "With rebuildOnResize off, the canvas is still resized for you. Only setup is skipped.",
          },
        ],
      },
      {
        id: "colors",
        title: "Reading the theme",
        blocks: [
          {
            kind: "text",
            text: "useThemeColors reads custom properties off a mounted element and returns them as plain channels between zero and one, which is the form a shader uniform or a canvas fill wants. It re-reads when the theme changes, so a scene recolours itself when someone switches to dark.",
          },
          {
            kind: "code",
            code: `const ref = React.useRef(null)
const colors = useThemeColors(ref, ["--primary", "--background"])

// colors["--primary"] is [r, g, b], each 0 to 1`,
          },
          {
            kind: "text",
            text: "The conversion is done by painting one pixel and reading it back, rather than by parsing the value. shadcn themes are written in oklch and often in color-mix, and letting the browser resolve them is the only approach that stays correct as CSS gains more colour spaces.",
          },
        ],
      },
    ],
    accessibility:
      "The canvas is hidden from assistive technology unless you pass a label, because most scenes are decoration and announcing them is noise. With a label it becomes an image with that description. Reduced motion is honoured by the surface itself, so no component drawing on it can forget to.",
  },
  {
    slug: "aurora-field",
    kind: "component",
    name: "Aurora Field",
    family: "Scenes",
    summary:
      "A drifting gradient backdrop for a hero or an empty state, built from the colours already in your theme rather than from a palette it brought with it.",
    dependencies: [],
    install: registryInstallCommand("aurora-field"),
    npmImport: packageImport("AuroraField", "aurora-field"),
    usage: `export function Hero() {
  return (
    <AuroraField className="rounded-xl">
      <div className="px-8 py-16 text-center">
        <h1>Ship the interface you sketched</h1>
      </div>
    </AuroraField>
  )
}`,
    props: [
      [
        "colors",
        "string[]",
        'Theme custom properties or CSS colours. Defaults to ["--primary"].',
      ],
      ["blobs", "number", "How many drifting shapes to draw. Defaults to 5."],
      ["speed", "number", "Multiplies the drift. Defaults to 1."],
      [
        "spread",
        "number",
        "How much of the box each shape covers, as a fraction of the longest edge. Defaults to 0.55.",
      ],
      ["opacity", "number", "Strength of each shape. Defaults to 0.85."],
      ["paused", "boolean", "Holds the field still."],
      [
        "children",
        "ReactNode",
        "Rendered above the field. The field itself sits behind on its own layer and ignores the pointer.",
      ],
    ],
    sections: [
      {
        id: "one-color",
        title: "Why one colour is the default",
        blocks: [
          {
            kind: "text",
            text: "Most gradient backdrops ship with a palette, which means they look like the library they came from rather than like your application. This one takes --primary and derives the rest by rotating its hue, so a blue product gets a blue aurora and an orange one gets an orange aurora without being configured.",
          },
          {
            kind: "text",
            text: "Pass more colours when you want them. Any entry that is not a custom property is used as a plain CSS colour, and if there are fewer colours than shapes the remainder are derived from the ones you gave.",
          },
          {
            kind: "code",
            code: `<AuroraField colors={["--primary", "--ring"]} blobs={6} />`,
          },
        ],
      },
      {
        id: "cost",
        title: "What it costs to run",
        blocks: [
          {
            kind: "text",
            text: "The field is drawn at a single device pixel per CSS pixel and then blurred by CSS. Blurring in the compositor is far cheaper than blurring in the canvas, and since the result is soft in every direction there is nothing for the extra resolution to show.",
          },
          {
            kind: "text",
            text: "It also stops drawing as soon as it scrolls off screen, so a field behind a hero costs nothing once the reader has moved past it.",
          },
        ],
      },
    ],
    accessibility:
      "The field is decoration and is hidden from assistive technology. Children are ordinary markup above it, so a heading inside one is read exactly as it would be anywhere else. Under reduced motion the shapes are painted once and stop, which keeps the colour without the drift.",
  },
  {
    slug: "grain-overlay",
    kind: "component",
    name: "Grain Overlay",
    family: "Scenes",
    summary:
      "Film grain for any positioned box, which incidentally fixes the banding a wide gradient shows on a good monitor.",
    dependencies: [],
    install: registryInstallCommand("grain-overlay"),
    npmImport: packageImport("GrainOverlay", "grain-overlay"),
    usage: `export function Panel() {
  return (
    <div className="relative isolate overflow-hidden">
      <div className="bg-gradient-to-br from-primary to-background p-12">
        <h2>Reel one, take four</h2>
      </div>
      <GrainOverlay />
    </div>
  )
}`,
    props: [
      [
        "frequency",
        "number",
        "Higher is finer. Around 0.65 reads as film and 0.2 as coarse paper. Defaults to 0.65.",
      ],
      ["opacity", "number", "Strength of the grain. Defaults to 0.22."],
      [
        "blend",
        '"overlay" | "soft-light" | "multiply" | "screen" | "normal"',
        'How the grain mixes with what is underneath. Defaults to "overlay".',
      ],
      [
        "animated",
        "boolean",
        "Shifts between four grains about eight times a second, the way projected film does. Off by default.",
      ],
    ],
    sections: [
      {
        id: "banding",
        title: "The practical reason to use it",
        blocks: [
          {
            kind: "text",
            text: "A gradient across a wide screen has fewer available steps than it has pixels, so it arrives in visible bands. Adding noise breaks the boundary between one step and the next, and the eye stops finding the edges. This is the same trick print has used for a century, and it is the reason to reach for grain even when you do not want the texture.",
          },
          {
            kind: "text",
            text: "It sits above the content and ignores the pointer, so it can be dropped into a card or a hero without changing anything underneath it. The parent needs a positioning context and, usually, overflow hidden.",
          },
        ],
      },
      {
        id: "static",
        title: "Still by default",
        blocks: [
          {
            kind: "text",
            text: "Animated grain is a full repaint several times a second for an effect most readers will not consciously notice, so it is off unless you ask. When it is on it stops entirely under reduced motion, because a texture that crawls is exactly the kind of movement that setting exists to remove.",
          },
        ],
      },
    ],
    accessibility:
      "Hidden from assistive technology and transparent to the pointer. The animated variant does nothing at all when reduced motion is set.",
  },
  {
    slug: "spotlight-card",
    kind: "component",
    name: "Spotlight Card",
    family: "Scenes",
    summary:
      "A card that catches a light following the pointer, and can light every card in its grid from the same pointer at once.",
    dependencies: [],
    install: registryInstallCommand("spotlight-card"),
    npmImport: packageImport("SpotlightCard", "spotlight-card"),
    usage: `export function Plans({ plans }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {plans.map((plan) => (
        <SpotlightCard key={plan.name} followGroup className="p-5">
          <p>{plan.name}</p>
        </SpotlightCard>
      ))}
    </div>
  )
}`,
    props: [
      [
        "color",
        "string",
        'A theme custom property or a CSS colour for the light. Defaults to "--primary".',
      ],
      ["size", "number", "Radius of the light in pixels. Defaults to 320."],
      [
        "followGroup",
        "boolean",
        "Lights every sibling spotlight card from the same pointer, so a grid reads as one surface under one lamp.",
      ],
    ],
    sections: [
      {
        id: "no-state",
        title: "Nothing re-renders",
        blocks: [
          {
            kind: "text",
            text: "The pointer position is written to custom properties on the element itself, not to React state. Moving across a grid of twelve of these updates twelve style properties and renders nothing, which is the difference between a smooth grid and a grid that stutters on a laptop.",
          },
          {
            kind: "text",
            text: "It also means the card is an ordinary element. Wrap it in a link, put a form in it, or give it your own background, and none of that interferes with the light.",
          },
        ],
      },
      {
        id: "group",
        title: "One lamp over a grid",
        blocks: [
          {
            kind: "text",
            text: "With followGroup on, a card that receives the pointer writes the position to every sibling spotlight card as well. Each one converts the same page coordinate against its own rectangle, so the light lands where it would if a single lamp were held above the whole grid rather than one lamp per card.",
          },
          {
            kind: "text",
            text: "The effect is quiet and worth the trouble: cards near the pointer glow slightly even though the pointer is not on them, which is what a real light does.",
          },
        ],
      },
    ],
    accessibility:
      "The light is decoration drawn behind the content and never carries meaning, so nothing is announced. It fades rather than jumps, and that fade is removed under reduced motion. Because the effect is driven by the pointer rather than by a timer, there is nothing moving for a reader who is not moving.",
  },
  {
    slug: "constellation-field",
    kind: "component",
    name: "Constellation Field",
    family: "Scenes",
    summary:
      "Drifting points joined by lines when they come close, brightening and swelling around the pointer.",
    dependencies: [],
    install: registryInstallCommand("constellation-field"),
    npmImport: packageImport("ConstellationField", "constellation-field"),
    usage: `export function Backdrop() {
  return (
    <ConstellationField className="rounded-xl border">
      <div className="px-8 py-16 text-center">
        <h2>Move your pointer across it</h2>
      </div>
    </ConstellationField>
  )
}`,
    props: [
      [
        "density",
        "number",
        "Points per ten thousand square pixels, so the field looks the same after a resize. Defaults to 5.",
      ],
      ["speed", "number", "Multiplies the drift. Defaults to 1."],
      [
        "linkDistance",
        "number",
        "Points closer together than this are joined. Defaults to 120.",
      ],
      [
        "pointerRadius",
        "number",
        "How far the pointer reaches, in pixels. Zero turns the reaction off. Defaults to 160.",
      ],
      [
        "color",
        "string",
        'A theme custom property or a CSS colour for the points and lines. Defaults to "--foreground".',
      ],
      ["paused", "boolean", "Holds the field still."],
    ],
    sections: [
      {
        id: "density",
        title: "Density, not count",
        blocks: [
          {
            kind: "text",
            text: "A fixed number of points looks crowded in a narrow column and empty across a wide hero. Density is given per unit of area instead, so the field is rebuilt with the right number of points whenever the box changes and looks the same at every width.",
          },
        ],
      },
      {
        id: "cost",
        title: "Where the time goes",
        blocks: [
          {
            kind: "text",
            text: "Linking compares every pair of points, so the work grows with the square of the count. At the default density a panel of ordinary size holds a few dozen points and the comparison is not worth optimising. A full page backdrop at high density is a different matter, and the honest fix there is to lower the density rather than to make the loop cleverer.",
          },
          {
            kind: "text",
            text: "The pointer is followed on the window rather than on this element, so the field still answers to it while sitting behind a headline that is taking every event itself. Setting pointerRadius to zero removes the reaction altogether.",
          },
        ],
      },
    ],
    accessibility:
      "Decoration, hidden from assistive technology, and behind its children on its own layer. Under reduced motion the points are painted once where they started and the drift never begins, so the pattern remains without any movement.",
  },
  {
    slug: "burst",
    kind: "component",
    name: "Burst",
    family: "Scenes",
    summary:
      "A short burst of pieces for the moment something finally completes. It draws nothing until it is fired and stops as soon as the last piece falls out of the box.",
    dependencies: [],
    install: registryInstallCommand("burst"),
    npmImport: packageImport("Burst", "burst"),
    usage: `export function Invoice() {
  const burst = React.useRef(null)

  return (
    <div className="relative isolate overflow-hidden">
      <Burst ref={burst} announce="Invoice paid" />
      <button onClick={() => burst.current?.fire()}>Mark as paid</button>
    </div>
  )
}`,
    props: [
      [
        "colors",
        "string[]",
        'Theme custom properties or CSS colours. Defaults to ["--primary", "--foreground"].',
      ],
      ["count", "number", "Pieces per burst. Defaults to 60."],
      [
        "velocity",
        "number",
        "Pixels per second the pieces leave at. Defaults to 420.",
      ],
      ["gravity", "number", "Pixels per second squared. Defaults to 900."],
      [
        "announce",
        "string",
        "Announced once when a burst is fired. Leave it out when the burst is decorating something already announced elsewhere.",
      ],
    ],
    types: [
      {
        name: "BurstHandle",
        description: "What the ref gives you.",
        rows: [
          [
            "fire",
            "(options?: BurstOptions) => void",
            "Starts a burst. Without options it comes from the centre of the box.",
          ],
        ],
      },
      {
        name: "BurstOptions",
        rows: [
          ["x", "number", "Pixels from the left of the box."],
          ["y", "number", "Pixels from the top of the box."],
          ["count", "number", "Overrides the piece count for this burst."],
        ],
      },
    ],
    sections: [
      {
        id: "idle",
        title: "It costs nothing while it waits",
        blocks: [
          {
            kind: "text",
            text: "Most celebration components animate a canvas continuously and simply draw nothing most of the time. This one keeps its loop paused until fire is called and pauses it again on the first frame where no piece is left alive, so a page holding one of these is running no animation at all until the moment it matters.",
          },
        ],
      },
      {
        id: "reduced",
        title: "What happens under reduced motion",
        blocks: [
          {
            kind: "text",
            text: "fire draws nothing. A burst is pure movement, and a still frame of one is a pile of rectangles that means nothing to anybody.",
          },
          {
            kind: "text",
            text: "The announcement still happens. That is the point of the announce prop: the information a burst carries -- this worked -- reaches a reader who is not going to see it, whether they turned motion off or are using a screen reader.",
          },
        ],
      },
      {
        id: "placement",
        title: "Where to put it",
        blocks: [
          {
            kind: "text",
            text: "It covers its nearest positioned ancestor and ignores the pointer, so it belongs inside the region you want the pieces to fall through rather than at the root of the page. Give that ancestor a positioning context, and overflow hidden if you would rather the pieces did not spill.",
          },
          {
            kind: "code",
            code: `<Burst ref={burst} announce="Plan upgraded" count={90} velocity={520} />`,
          },
        ],
      },
    ],
    accessibility:
      "The canvas is decoration and is hidden. The announce prop puts the meaning of the burst into a polite live region, which is what a reader using a screen reader or a reader with motion turned off actually receives. Nothing about the burst is required to operate anything.",
  },
  {
    slug: "shader-surface",
    kind: "component",
    name: "Shader Surface",
    family: "Scenes",
    summary:
      "Four shader backdrops -- caustics, metal, plasma and ripple -- each taking its two colours from your theme, so the same surface arrives dark in a dark application and light in a light one.",
    dependencies: [],
    install: registryInstallCommand("shader-surface"),
    npmImport: packageImport("ShaderSurface", "shader-surface"),
    usage: `export function Hero() {
  return (
    <ShaderSurface variant="caustics" className="rounded-xl">
      <div className="px-8 py-16 text-center">
        <h1>Caustics</h1>
      </div>
    </ShaderSurface>
  )
}`,
    props: [
      [
        "variant",
        '"caustics" | "metal" | "plasma" | "ripple"',
        'Which shader to run. Defaults to "plasma", the quietest of the four.',
      ],
      [
        "base",
        "string",
        'The colour the surface settles to. Defaults to "--background".',
      ],
      [
        "tint",
        "string",
        'The colour the light in it takes. Defaults to "--primary".',
      ],
      ["speed", "number", "Multiplies time. Defaults to 1."],
      [
        "scale",
        "number",
        "Size of the pattern. Larger is busier. Defaults to 3.",
      ],
      ["paused", "boolean", "Holds the surface still."],
    ],
    sections: [
      {
        id: "two-colors",
        title: "Two colours is the whole palette",
        blocks: [
          {
            kind: "text",
            text: "Every variant mixes between exactly two colours, both read from the theme. That constraint is what lets one component cover four quite different looks without any of them fighting the application they were installed into. The default pair is --background and --primary, which means the surface already matches the page before it is configured.",
          },
          {
            kind: "text",
            text: "Because the colours are read rather than compiled in, switching the application to dark mode recolours the shader on the next frame. There is no second set of values to keep in step.",
          },
          {
            kind: "code",
            code: `<ShaderSurface variant="metal" base="--card" tint="--ring" scale={5} />`,
          },
        ],
      },
      {
        id: "variants",
        title: "Choosing between them",
        blocks: [
          {
            kind: "list",
            items: [
              "caustics: light through moving water. Busy, and best behind very little text.",
              "metal: slow bands with a sharp highlight. Reads as a material rather than as weather.",
              "plasma: soft blended cloud. The quietest of the four, the safest behind a paragraph, and the default for that reason.",
              "ripple: rings leaving the centre. Directional, so it wants something at the middle to have come from.",
            ],
          },
        ],
      },
      {
        id: "webgl",
        title: "When WebGL is not available",
        blocks: [
          {
            kind: "text",
            text: "If the context or the program cannot be created, the surface draws nothing and the box keeps its ordinary background and children. A shader that will not compile should cost a reader a plain panel, not a broken one.",
          },
        ],
      },
    ],
    accessibility:
      "The canvas is decoration and is hidden from assistive technology. Children sit above it as ordinary markup. Under reduced motion a single frame is drawn and time never advances, so the pattern is there and nothing in it moves.",
  },
  {
    slug: "displacement-image",
    kind: "component",
    name: "Displacement Image",
    family: "Scenes",
    summary:
      "Two images crossing by pushing their pixels through the same noise in opposite directions, with the first image also present as ordinary markup for anything that cannot run it.",
    dependencies: [],
    install: registryInstallCommand("displacement-image"),
    npmImport: packageImport("DisplacementImage", "displacement-image"),
    usage: `export function Card() {
  return (
    <DisplacementImage
      from="/covers/before.jpg"
      to="/covers/after.jpg"
      alt="The studio before and after the rebuild"
      className="aspect-[4/3] rounded-xl"
    />
  )
}`,
    props: [
      ["from", "string", "The image shown at rest."],
      ["to", "string", "The image crossed to."],
      [
        "alt",
        "string",
        "Describes the pair. Required, and used for both the fallback image and the canvas.",
      ],
      [
        "intensity",
        "number",
        "How far the pixels are pushed during the crossing, as a fraction of the box. Defaults to 0.35.",
      ],
      ["duration", "number", "Seconds the crossing takes. Defaults to 0.7."],
      [
        "active",
        "boolean",
        "Drives the crossing yourself. Without it the crossing follows the pointer and focus.",
      ],
      [
        "children",
        "ReactNode",
        "Rendered above the image, for a caption or the link that covers it.",
      ],
    ],
    sections: [
      {
        id: "fallback",
        title: "There is always a picture",
        blocks: [
          {
            kind: "text",
            text: "The first image is rendered as an ordinary img element underneath the canvas. If WebGL is unavailable, if the shader will not compile, or if the second image never loads, the reader sees a normal photograph rather than an empty grey box.",
          },
          {
            kind: "text",
            text: "This is also what the reader sees before the textures have finished uploading, which removes the flash of nothing that these effects usually open with.",
          },
        ],
      },
      {
        id: "aspect",
        title: "Two images, one box",
        blocks: [
          {
            kind: "text",
            text: "Each image is fitted to the box the way object-fit cover would fit it, using its own aspect ratio measured after it loads. A portrait and a landscape photograph can therefore be crossed against each other without either being stretched.",
          },
          {
            kind: "text",
            text: "Images from another origin need to permit it. The textures are requested anonymously, so a host that does not send the right header will refuse to be read and only the fallback will show.",
          },
        ],
      },
      {
        id: "focus",
        title: "Not only the pointer",
        blocks: [
          {
            kind: "text",
            text: "The crossing follows focus as well as the pointer, so putting a link or a button inside one means a keyboard reader gets the same behaviour. When you would rather drive it from something else -- a scroll position, a carousel index -- pass active and the internal handling steps aside.",
          },
        ],
      },
    ],
    accessibility:
      "The alt text describes the pair and is carried by both the fallback image and the canvas, so the picture is announced once whichever one is showing. The crossing responds to focus as well as hover. It is a transition between two images rather than a loop, so there is nothing running for a reader who is not interacting with it.",
  },
  {
    slug: "scene-hero",
    kind: "component",
    name: "Scene Hero",
    family: "Scenes",
    summary:
      "A lit three-dimensional object behind a headline, steered by the pointer and coloured by the theme. The one component here that asks for three.",
    dependencies: ["three"],
    install: registryInstallCommand("scene-hero"),
    npmImport: packageImport("SceneHero", "scene-hero"),
    usage: `export function Hero() {
  return (
    <SceneHero shape="torus-knot" className="rounded-xl">
      <div className="px-8 py-20 text-center">
        <h1>Built in the open</h1>
      </div>
    </SceneHero>
  )
}`,
    props: [
      [
        "shape",
        '"torus-knot" | "icosahedron" | "capsule" | "box" | "torus"',
        'Which object to light. Defaults to "torus-knot".',
      ],
      ["color", "string", 'Colour of the object. Defaults to "--primary".'],
      [
        "rim",
        "string",
        'Colour of the light that rims it. Defaults to "--foreground".',
      ],
      ["metalness", "number", "Zero to one. Defaults to 0.55."],
      ["roughness", "number", "Zero to one. Defaults to 0.25."],
      ["speed", "number", "Turns per second at rest. Defaults to 0.12."],
      [
        "sway",
        "number",
        "How far it leans toward the pointer, in radians. Defaults to 0.35.",
      ],
      ["paused", "boolean", "Holds the object still."],
    ],
    sections: [
      {
        id: "peers",
        title: "What it needs installed",
        blocks: [
          {
            kind: "text",
            text: "This is the only component in the collection that reaches for three, and it is an optional peer like every other heavy dependency here. Nothing else in Mischief pulls it in, and the package root does not export this component, because a barrel holding it would fail to resolve for everyone who had not installed three.",
          },
          {
            kind: "code",
            code: `npm install mischief-ui three`,
            caption:
              "Import it from its own entry: mischief-ui/scene-hero, not the package root.",
          },
          {
            kind: "text",
            text: "That is the trade. Around a hundred and fifty kilobytes for anyone who wants a lit object, and nothing at all for everyone else.",
          },
        ],
      },
      {
        id: "earns",
        title: "Why this one is allowed to be heavy",
        blocks: [
          {
            kind: "text",
            text: "Everything else in this family is drawn with CSS, a two dimensional canvas, or a single shader, because those were enough. Real geometry, a metal surface that responds to two lights, and depth that survives being rotated are not things a gradient can imitate, and that is the bar a component has to clear before it may ask for a renderer.",
          },
          {
            kind: "text",
            text: "The renderer is built once and survives a resize rather than being rebuilt, since a browser will only hand out a few GPU contexts and dragging a window edge should not spend them all.",
          },
        ],
      },
      {
        id: "colors",
        title: "Coloured by the page it is on",
        blocks: [
          {
            kind: "text",
            text: "The material takes --primary and the fill light takes --foreground, both read from the mounted element and both updated on the next frame when the theme changes. The background stays transparent, so whatever the section behind it is painted with shows through and the object appears to be standing in the page rather than in a window cut into it.",
          },
          {
            kind: "code",
            code: `<SceneHero shape="icosahedron" color="--ring" metalness={0.9} roughness={0.1} />`,
          },
        ],
      },
    ],
    accessibility:
      "The object is decoration and the canvas is hidden from assistive technology, so a headline placed inside is read exactly as a headline. The lean follows the pointer and returns to centre when it leaves. Under reduced motion one frame is drawn and the object neither turns nor leans.",
  },
  {
    slug: "scroll-scene",
    kind: "component",
    name: "Scroll Scene",
    family: "Scenes",
    summary:
      "Turns the scrolling of a tall element into a number between nought and one, published to a custom property and to a callback, without rendering the page to do it.",
    dependencies: [],
    install: registryInstallCommand("scroll-scene"),
    npmImport: packageImport("ScrollScene", "scroll-scene"),
    usage: `export function Scrubbed() {
  const box = React.useRef(null)

  return (
    <ScrollScene className="h-[200vh]" sticky onProgress={(p) => {
      if (box.current) box.current.style.opacity = String(p)
    }}>
      <div ref={box}>Held while the scene goes past</div>
    </ScrollScene>
  )
}`,
    props: [
      [
        "range",
        '"cover" | "contain" | "enter" | "exit"',
        'Which span of scrolling maps to nought through one. Defaults to "cover".',
      ],
      [
        "onProgress",
        "(progress: number) => void",
        "Called on every frame the element is on screen.",
      ],
      [
        "sticky",
        "boolean",
        "Pins the children to the viewport while the scene scrolls past them.",
      ],
    ],
    sections: [
      {
        id: "no-render",
        title: "Why this is not a piece of state",
        blocks: [
          {
            kind: "text",
            text: "The obvious shape for this component would be a hook returning a number. That number changes on every frame, so every frame would render the tree under it, and a scroll-linked effect built that way stutters on any machine that is also doing something else.",
          },
          {
            kind: "text",
            text: "So progress is published twice, and neither way renders anything. It is written to the element as the --scroll-progress custom property, which CSS can use directly, and it is handed to onProgress, which a canvas or a ref can use directly.",
          },
          {
            kind: "code",
            code: `.parallax {
  translate: 0 calc(var(--scroll-progress) * -80px);
  opacity: var(--scroll-progress);
}`,
            caption:
              "No JavaScript at all on this side. The property is on the scene element, so anything inside it can read it.",
          },
        ],
      },
      {
        id: "ranges",
        title: "Choosing a range",
        blocks: [
          {
            kind: "list",
            items: [
              "cover: nought when the element first appears at the bottom, one when it has completely gone past the top. The longest span, and the usual choice for a backdrop.",
              "contain: the span during which the element is fully inside the viewport. Right for something that should finish while it is still being looked at.",
              "enter: nought to one across the arrival alone.",
              "exit: nought to one across the departure alone.",
            ],
          },
          {
            kind: "text",
            text: "The loop runs only while the element is on screen, and takes one final reading on the way out so a scene left behind holds an end value rather than whatever it happened to have.",
          },
        ],
      },
      {
        id: "reduced",
        title: "Motion that is not the page's idea",
        blocks: [
          {
            kind: "text",
            text: "This keeps working when someone has asked for reduced motion, and that is deliberate. The movement here is the reader's own: it happens because they are scrolling, it stops when they stop, and it reverses when they go back. That is direct manipulation rather than something the page decided to do at them.",
          },
          {
            kind: "text",
            text: "What you drive with it is a different matter. If the progress is running an animation that would be uncomfortable, check the preference where you use it rather than expecting this component to guess.",
          },
        ],
      },
    ],
    accessibility:
      "The scene is an ordinary element and adds nothing to the accessibility tree. Content inside it is normal markup and is reached in normal order, including when sticky is on. Nothing here is required to read the page, so a reader who never scrolls it past has lost nothing.",
  },
  {
    slug: "reveal",
    kind: "component",
    name: "Reveal",
    family: "Motion",
    summary:
      "Moves its children in when they arrive on screen. It changes how something arrives and never whether it is there.",
    dependencies: [],
    install: registryInstallCommand("reveal"),
    npmImport: packageImport("Reveal", "reveal"),
    usage: `export function Features({ items }) {
  return items.map((item, index) => (
    <Reveal key={item.id} delay={index * 90}>
      <Card {...item} />
    </Reveal>
  ))
}`,
    props: [
      [
        "from",
        '"up" | "down" | "left" | "right" | "none"',
        'Which way the content travels in from. Defaults to "up".',
      ],
      ["distance", "number", "Pixels travelled. Defaults to 16."],
      [
        "delay",
        "number",
        "Milliseconds before it starts. An index times a step staggers a list.",
      ],
      ["duration", "number", "Milliseconds. Defaults to 600."],
      [
        "threshold",
        "number",
        "How much has to be on screen before it starts. Defaults to 0.15.",
      ],
      [
        "repeat",
        "boolean",
        "Plays again whenever it comes back. Off by default.",
      ],
    ],
    sections: [
      {
        id: "present",
        title: "The content is never withheld",
        blocks: [
          {
            kind: "text",
            text: "Scroll entrances are usually built by rendering nothing until an observer fires. That breaks the page for anyone whose browser did not run the observer, hides the text from anything reading the markup, and leaves a blank column if a script fails.",
          },
          {
            kind: "text",
            text: "Here the children are always rendered and always in the document. Only opacity and a small translation are animated, and both are removed outright under reduced motion, where the content is simply there from the first paint.",
          },
        ],
      },
      {
        id: "stagger",
        title: "Staggering without another component",
        blocks: [
          {
            kind: "text",
            text: "There is no group wrapper, because a group wrapper would only be multiplying an index by a number. Do that where you have the index.",
          },
          {
            kind: "code",
            code: `{rows.map((row, index) => (
  <Reveal key={row.id} delay={index * 90}>{row.label}</Reveal>
))}`,
            caption:
              "Around 60 to 120 milliseconds per step reads as a sequence. Much more and the last one feels late.",
          },
        ],
      },
    ],
    accessibility:
      "Content is in the document and in normal order from the first paint, so nothing depends on the animation having run. Reduced motion removes the movement and the fade entirely rather than shortening them. Once played it stays played, unless repeat is on.",
  },
  {
    slug: "split-text",
    kind: "component",
    name: "Split Text",
    family: "Motion",
    featured: true,
    summary:
      "A heading animated one character, word, or line at a time, and still announced as one sentence rather than as a pile of single letters.",
    dependencies: [],
    install: registryInstallCommand("split-text"),
    npmImport: packageImport("SplitText", "split-text"),
    usage: `export function Headline() {
  return (
    <h1 className="text-5xl font-semibold">
      <SplitText by="character" animation="rise">
        Good interfaces deserve a little mischief
      </SplitText>
    </h1>
  )
}`,
    props: [
      ["children", "string", "The text. A string, because it has to be split."],
      [
        "by",
        '"character" | "word" | "line"',
        'What each piece is. Defaults to "character".',
      ],
      [
        "animation",
        '"rise" | "fade" | "blur" | "scale"',
        'How a piece arrives. Defaults to "rise".',
      ],
      [
        "stagger",
        "number",
        "Milliseconds between one piece and the next. Defaults to 28.",
      ],
      ["delay", "number", "Milliseconds before the first piece."],
      ["duration", "number", "Milliseconds for one piece. Defaults to 620."],
      [
        "trigger",
        '"mount" | "view"',
        'Whether it plays on arrival or once on screen. Defaults to "view".',
      ],
      [
        "as",
        '"span" | "h1" | "h2" | "h3" | "p"',
        'The element rendered. Defaults to "span".',
      ],
    ],
    sections: [
      {
        id: "announced",
        title: "Announced as a sentence",
        blocks: [
          {
            kind: "text",
            text: "Splitting a heading into one element per letter is what makes this effect possible and is also what usually ruins it. A screen reader handed forty single-letter elements may read forty letters.",
          },
          {
            kind: "text",
            text: "So the whole string is set as the label on the element, and every piece inside is hidden from assistive technology. What is announced is the sentence you wrote. What is animated is the letters. Neither knows about the other.",
          },
        ],
      },
      {
        id: "choosing",
        title: "Which split to use",
        blocks: [
          {
            kind: "text",
            text: "Character is the showiest and the most expensive: a forty character heading is forty elements each with its own transition. It suits one large heading and does not suit a paragraph.",
          },
          {
            kind: "text",
            text: "Word is the one to reach for at body size. Line is for something already broken into lines, and splits on the newlines in the string rather than trying to work out where the browser wrapped it.",
          },
          {
            kind: "text",
            text: "Whitespace is never animated, whichever split you choose, so a gap between two words does not fade in and change the measure while the rest arrives.",
          },
        ],
      },
      {
        id: "stagger",
        title: "Getting the timing right",
        blocks: [
          {
            kind: "text",
            text: "The total is the stagger times the number of pieces plus the duration of one piece. At the default stagger a forty character heading takes a little over a second and a half, which is about as long as an entrance can be before it stops feeling like an entrance.",
          },
          {
            kind: "code",
            code: `<SplitText by="word" stagger={60} animation="blur">
  Long enough to read while it arrives
</SplitText>`,
          },
        ],
      },
    ],
    accessibility:
      "The full string is the element's label and every piece is hidden, so the text is announced once, as written. Under reduced motion every piece is at rest from the first paint and nothing moves, fades, or blurs. The text is in the document whether or not the animation ever runs.",
  },
  {
    slug: "marquee",
    kind: "component",
    name: "Marquee",
    family: "Motion",
    summary:
      "A row that runs on its own, seamlessly, and turns back into an ordinary scrolling row for anyone who asked for less motion.",
    dependencies: [],
    install: registryInstallCommand("marquee"),
    npmImport: packageImport("Marquee", "marquee"),
    usage: `export function Logos() {
  return (
    <Marquee duration={24} pauseOnHover fade>
      {logos.map((logo) => (
        <img key={logo.name} src={logo.src} alt={logo.name} />
      ))}
    </Marquee>
  )
}`,
    sections: [
      {
        id: "seam",
        title: "Why the children repeat",
        blocks: [
          {
            kind: "text",
            text: "A loop that travels the width of its content leaves a gap behind it before it wraps. The children are rendered more than once and the track travels exactly one copy's worth, so the moment it resets is the moment the second copy is where the first one was, and there is nothing to see.",
          },
          {
            kind: "text",
            text: "Every copy carries its own trailing gap rather than the track spacing them, which is what keeps each copy the same length and the travel exact. Two copies is the least that works; more only helps when the content is much narrower than the box holding it.",
          },
          {
            kind: "text",
            text: "The repeats are decoration. Only the first is content, and the rest are hidden from assistive technology, so a screen reader hears the list once rather than as many times as it happens to be drawn.",
          },
        ],
      },
      {
        id: "reduced-motion",
        title: "What happens with reduced motion",
        blocks: [
          {
            kind: "text",
            text: "Stopping the animation is not enough on its own: whatever had not arrived yet would simply never arrive, and the content past the edge would be unreachable. So the repeats are dropped, the animation is dropped, and the container becomes a scrolling one.",
          },
          {
            kind: "text",
            text: "What is left is an ordinary row that happens to be wider than its box, which is a thing people already know how to use.",
          },
        ],
      },
      {
        id: "speed",
        title: "Setting the pace",
        blocks: [
          {
            kind: "text",
            text: "duration is the seconds one full pass takes, so the same number reads as faster with less content and slower with more. Set it against the content you actually have rather than looking for one value that suits every row.",
          },
          {
            kind: "code",
            code: `<Marquee direction="up" duration={30} gap={24}>
  {quotes.map((quote) => (
    <Quote key={quote.id} {...quote} />
  ))}
</Marquee>`,
            caption: "Vertical, slower, with more air between the items.",
          },
        ],
      },
    ],
    props: [
      [
        "direction",
        '"left" | "right" | "up" | "down"',
        'Which way the content travels. Defaults to "left".',
      ],
      ["duration", "number", "Seconds for one full pass. Defaults to 20."],
      [
        "gap",
        "number",
        "Pixels between the items, and between one repeat and the next. Defaults to 16.",
      ],
      [
        "pauseOnHover",
        "boolean",
        "Holds still while the pointer is over it. Off by default.",
      ],
      [
        "copies",
        "number",
        "How many times the children repeat. Defaults to 2, and never goes below it.",
      ],
      [
        "fade",
        "boolean",
        "Softens both ends so items arrive and leave. Off by default.",
      ],
    ],
    accessibility:
      "Only the first copy of the children is content; the repeats carry aria-hidden, so the list is announced once rather than once per copy. Under prefers-reduced-motion the component stops being a marquee altogether: the repeats are removed, the animation is removed, and the container scrolls instead, so nothing is placed out of reach of somebody who turned motion off. pauseOnHover stops the travel for a pointer, and because the reduced-motion path is a scrolling region rather than a moving one, keyboard users reach the content by scrolling it like any other overflow.",
  },
  {
    slug: "number-ticker",
    kind: "component",
    name: "Number Ticker",
    family: "Motion",
    summary:
      "Counts to a number rather than replacing it, in whatever currency or format you asked for.",
    dependencies: [],
    install: registryInstallCommand("number-ticker"),
    npmImport: packageImport("NumberTicker", "number-ticker"),
    usage: `export function Stat({ revenue }) {
  return (
    <NumberTicker
      value={revenue}
      format={{ style: "currency", currency: "USD" }}
    />
  )
}`,
    props: [
      ["value", "number", "Where it is counting to."],
      ["from", "number", "Where it counts from the first time. Defaults to 0."],
      ["duration", "number", "Milliseconds. Defaults to 1400."],
      [
        "format",
        "Intl.NumberFormatOptions",
        "Passed straight through, so currency, percent, and compact all work.",
      ],
      ["locale", "string", "Passed to Intl.NumberFormat."],
      [
        "startOnView",
        "boolean",
        "Waits until it is on screen before counting. On by default.",
      ],
    ],
    sections: [
      {
        id: "announced",
        title: "What gets read out",
        blocks: [
          {
            kind: "text",
            text: "The element is labelled with the final value the whole time, and the counting digits are hidden. A reader using a screen reader is told the number, once, rather than being read a blur of intermediate values or catching whatever it happened to be passing through.",
          },
          {
            kind: "text",
            text: "It also means the number is correct before the animation starts and correct if it never starts, which is what happens under reduced motion: the value is set straight away.",
          },
        ],
      },
      {
        id: "changing",
        title: "Counting from wherever it was",
        blocks: [
          {
            kind: "text",
            text: "When the value changes again the count starts from what was on screen, not from the original starting point. A figure that updates while someone is looking at it moves from the old number to the new one, which is the only reading of it that means anything.",
          },
          {
            kind: "text",
            text: "The digits are tabular, so the width does not jump about while it counts.",
          },
        ],
      },
    ],
    accessibility:
      "The final value is the element's label from the first paint, and the animating digits are hidden. Reduced motion sets the number immediately. Nothing here is a live region, so a page of these does not interrupt anybody.",
  },
  {
    slug: "tilt-card",
    kind: "component",
    name: "Tilt Card",
    family: "Scenes",
    summary:
      "A card that leans toward the pointer as though it were a physical object lying on the page.",
    dependencies: [],
    install: registryInstallCommand("tilt-card"),
    npmImport: packageImport("TiltCard", "tilt-card"),
    usage: `export function Pass() {
  return (
    <TiltCard glare className="p-6">
      <p>Reykjavik</p>
      <p>Seat 4A</p>
    </TiltCard>
  )
}`,
    props: [
      ["maxTilt", "number", "Furthest it leans, in degrees. Defaults to 9."],
      [
        "lift",
        "number",
        "How far it comes toward the pointer, in pixels. Defaults to 6.",
      ],
      ["glare", "boolean", "Adds a sheen that moves against the lean."],
      [
        "perspective",
        "number",
        "Pixels. Lower is a stronger effect. Defaults to 900.",
      ],
    ],
    sections: [
      {
        id: "restraint",
        title: "Nine degrees, not thirty",
        blocks: [
          {
            kind: "text",
            text: "The default lean is small on purpose. A card that swings twenty or thirty degrees stops reading as a card catching the light and starts reading as a card being thrown around, and text on it becomes genuinely harder to read at the far corner.",
          },
          {
            kind: "text",
            text: "The lean is written to custom properties on the element rather than to state, so a grid of these renders nothing while the pointer crosses it.",
          },
        ],
      },
      {
        id: "pairs",
        title: "With a spotlight",
        blocks: [
          {
            kind: "text",
            text: "Tilt moves the card and a spotlight moves the light on it. Together they are the usual bento card, and each is still useful without the other.",
          },
          {
            kind: "code",
            code: `<TiltCard>
  <SpotlightCard followGroup className="p-5">
    <p>Studio</p>
  </SpotlightCard>
</TiltCard>`,
          },
        ],
      },
    ],
    accessibility:
      "The lean is decoration and nothing is announced. Under reduced motion the card does not lean at all, rather than leaning more slowly. Because the effect is driven entirely by the pointer, nothing moves for a reader who is not moving one, and a keyboard reader gets an ordinary card.",
  },
  {
    slug: "connection-beam",
    kind: "component",
    name: "Connection Beam",
    family: "Scenes",
    summary:
      "A line between two elements with something travelling along it, measured from the elements rather than given as coordinates.",
    dependencies: [],
    install: registryInstallCommand("connection-beam"),
    npmImport: packageImport("ConnectionBeam", "connection-beam"),
    usage: `export function Architecture() {
  const container = useRef(null)
  const retriever = useRef(null)
  const model = useRef(null)

  return (
    <div ref={container} className="relative">
      <Node ref={retriever} />
      <Node ref={model} />
      <ConnectionBeam
        containerRef={container}
        fromRef={retriever}
        toRef={model}
      />
    </div>
  )
}`,
    sections: [
      {
        id: "measured",
        title: "It reads the elements, not a list of points",
        blocks: [
          {
            kind: "text",
            text: "A diagram drawn from coordinates is right once, on the screen it was drawn for. Give this the two elements instead and the geometry comes from where they actually are, so the beam survives a reflow: resize the window, wrap the boxes onto another line, put the whole thing in a panel that opens, and the line follows.",
          },
          {
            kind: "text",
            text: "Both endpoints and the box around them are watched, which covers layout changes that no resize event would report.",
          },
          {
            kind: "text",
            text: "The container has to be a positioned element, since the beam is laid over it. Everything else is measured relative to that box, so page scrolling never enters into it.",
          },
        ],
      },
      {
        id: "edges",
        title: "Where it attaches",
        blocks: [
          {
            kind: "text",
            text: "Beams are drawn between the facing edges rather than the centres, so the line meets a box instead of disappearing under it. Which pair of edges depends on how the two are arranged: side by side, it leaves the right and arrives at the left, and stacked, it leaves the bottom and arrives at the top. anchor overrides that when the automatic choice is not the one you meant.",
          },
          {
            kind: "text",
            text: "The bow is square to the run, so two elements connected either way round curve the same amount rather than one of them bending the wrong way. A curvature of nought is a straight line, and a negative one bends the other way, which is what separates several beams landing on the same element.",
          },
        ],
      },
      {
        id: "travel",
        title: "The part that moves",
        blocks: [
          {
            kind: "text",
            text: "The line and the travelling part are the same path drawn twice. The moving one is a dash, and the dashes are measured against a normalised path length, so extent is a share of the line rather than a number of pixels that would mean something different on every screen.",
          },
          {
            kind: "text",
            text: "Stagger several beams with delay rather than giving them different durations. Different durations drift apart and eventually all arrive at once, which reads as a coincidence rather than a sequence.",
          },
          {
            kind: "code",
            code: `{sources.map((source, index) => (
  <ConnectionBeam
    key={source.id}
    containerRef={container}
    fromRef={source.ref}
    toRef={model}
    curvature={(index - 1) * 24}
    delay={index * 0.6}
  />
))}`,
            caption: "Three sources into one model, fanned and staggered.",
          },
        ],
      },
    ],
    props: [
      [
        "containerRef",
        "RefObject<HTMLElement>",
        "The positioned box both endpoints live inside.",
      ],
      [
        "fromRef, toRef",
        "RefObject<HTMLElement>",
        "The two elements. Nothing is drawn until both exist.",
      ],
      [
        "curvature",
        "number",
        "Pixels the path bows away from the straight line. Negative bends the other way. Defaults to 60.",
      ],
      [
        "anchor",
        '"auto" | "horizontal" | "vertical"',
        "Which edges to use. Auto picks by the longer axis.",
      ],
      ["inset", "number", "Clearance left at each end. Defaults to 4."],
      [
        "pathColor, beamColor",
        "string",
        "A theme token, or any CSS colour. Default to --border and --primary.",
      ],
      ["width", "number", "Stroke width. Defaults to 2."],
      ["duration", "number", "Seconds for one trip. Defaults to 3."],
      ["delay", "number", "Seconds before the first trip. Defaults to 0."],
      ["reverse", "boolean", "Sends it the other way along the same path."],
      [
        "extent",
        "number",
        "How much of the path the travelling part covers, from nought to one. Defaults to 0.18.",
      ],
    ],
    accessibility:
      "The beam is decoration and carries aria-hidden: it illustrates a relationship that the elements it joins should already state, so nothing is lost when it is not rendered. Under prefers-reduced-motion the travelling part is not drawn at all rather than parked mid-path, where it would read as a stray dash nobody put there, and the line it runs along stays exactly as it was. Because the geometry is measured rather than fixed, a page zoomed or reflowed to a narrow width redraws correctly instead of leaving the line pointing somewhere the boxes no longer are.",
  },
  {
    slug: "cursor-trail",
    kind: "component",
    name: "Cursor Trail",
    family: "Scenes",
    summary:
      "A fading mark behind the pointer, drawn only inside its own box and only while the pointer is in it.",
    dependencies: [],
    install: registryInstallCommand("cursor-trail"),
    npmImport: packageImport("CursorTrail", "cursor-trail"),
    usage: `export function Panel() {
  return (
    <CursorTrail className="rounded-xl border p-12">
      <p>Move the pointer through here</p>
    </CursorTrail>
  )
}`,
    props: [
      [
        "color",
        "string",
        'A theme property or CSS colour. Defaults to "--primary".',
      ],
      ["size", "number", "Widest the trail gets, in pixels. Defaults to 26."],
      ["life", "number", "Seconds a mark takes to fade. Defaults to 0.7."],
    ],
    sections: [
      {
        id: "scoped",
        title: "Inside its box, not on the page",
        blocks: [
          {
            kind: "text",
            text: "A trail attached to the whole window follows people into forms, over text they are trying to read, and across every other part of the interface. This one covers the element you put it on and nothing else, which makes it something you can use in one place without it becoming the personality of the entire site.",
          },
          {
            kind: "text",
            text: "It also stops. The loop runs while the pointer is over the box and for as long afterwards as it takes the last mark to fade, then pauses. A page holding one of these is running no animation until somebody points at it.",
          },
        ],
      },
      {
        id: "reduced",
        title: "Under reduced motion",
        blocks: [
          {
            kind: "text",
            text: "No marks are made at all. A trail is nothing but movement, and a frozen one is a row of dots that means nothing.",
          },
        ],
      },
    ],
    accessibility:
      "The canvas is decoration, hidden from assistive technology, and transparent to the pointer, so anything underneath stays clickable. Nothing is drawn under reduced motion. Nothing here carries meaning, so there is nothing to miss.",
  },
  {
    slug: "metaballs",
    kind: "component",
    name: "Metaballs",
    family: "Scenes",
    summary:
      "Blobs that swell into one another as they meet, taking their two colours from your theme.",
    dependencies: [],
    install: registryInstallCommand("metaballs"),
    npmImport: packageImport("Metaballs", "metaballs"),
    usage: `export function Hero() {
  return (
    <Metaballs count={7} className="rounded-xl">
      <div className="px-8 py-20 text-center">
        <h1>Gooey</h1>
      </div>
    </Metaballs>
  )
}`,
    props: [
      ["count", "number", "How many blobs. Up to twelve. Defaults to 7."],
      ["base", "string", 'The background. Defaults to "--background".'],
      ["tint", "string", 'The blobs. Defaults to "--primary".'],
      ["speed", "number", "Multiplies the drift. Defaults to 1."],
      [
        "radius",
        "number",
        "Size of each blob, as a fraction of the shorter edge. Defaults to 0.16.",
      ],
      [
        "edge",
        "number",
        "How sharply a blob ends. Lower is gooier. Defaults to 0.35.",
      ],
      [
        "pointer",
        "boolean",
        "Makes the pointer one of the blobs, so it merges with the rest as it passes through them.",
      ],
    ],
    sections: [
      {
        id: "field",
        title: "How they merge",
        blocks: [
          {
            kind: "text",
            text: "Each blob contributes a value to every pixel that falls away with the square of the distance to it. The colour changes where the total crosses a threshold. Nothing decides that two blobs are touching: they merge because their contributions add up, the same way two drops of water do.",
          },
          {
            kind: "text",
            text: "The count is capped at twelve because every blob is another term evaluated at every pixel, and past a dozen the shape stops being readable long before the frame rate does.",
          },
          {
            kind: "text",
            text: "The blobs also spread themselves to the shape of the box. Placed the same distance apart whatever the box looks like, they bunch into the middle third of a wide one and merge into a single mass, which reads as a glow rather than as a field of blobs.",
          },
        ],
      },
      {
        id: "pointer",
        title: "Making the pointer one of them",
        blocks: [
          {
            kind: "text",
            text: "With pointer on, wherever the reader is becomes another blob, merging with the others exactly as they merge with each other. It eases toward the pointer rather than being pinned to it, and fades in on arrival, so nothing pops into existence at the edge of the box.",
          },
          {
            kind: "text",
            text: "The pointer is followed on the window rather than on this element, which is what lets the field sit behind other content and still answer to a pointer that never touches it. A backdrop that only reacts when nothing is on top of it is a backdrop that never reacts.",
          },
        ],
      },
    ],
    accessibility:
      "Decoration, hidden from assistive technology, behind its children on its own layer. Under reduced motion one frame is drawn and the blobs never move. If WebGL is unavailable the box keeps its ordinary background and its children.",
  },
  {
    slug: "dither-image",
    kind: "component",
    name: "Dither Image",
    family: "Scenes",
    summary:
      "A photograph reduced to two theme colours through an ordered dither, the way a newspaper reduced one to ink and paper.",
    dependencies: [],
    install: registryInstallCommand("dither-image"),
    npmImport: packageImport("DitherImage", "dither-image"),
    usage: `export function Portrait() {
  return (
    <DitherImage
      src="/team/ada.jpg"
      alt="Ada at her desk"
      cell={4}
      className="aspect-[3/2] rounded-xl"
    />
  )
}`,
    props: [
      ["src", "string", "The picture."],
      [
        "alt",
        "string",
        "Describes it. Required, and used by both the fallback and the canvas.",
      ],
      [
        "cell",
        "number",
        "Size of one dot in pixels. Larger is coarser. Defaults to 4.",
      ],
      [
        "levels",
        "number",
        "How many tones survive. Two is a pure halftone. Defaults to 2.",
      ],
      ["base", "string", 'The paper. Defaults to "--background".'],
      ["tint", "string", 'The ink. Defaults to "--foreground".'],
      ["contrast", "number", "Applied before the dither. Defaults to 1.15."],
    ],
    sections: [
      {
        id: "ordered",
        title: "Ordered, not random",
        blocks: [
          {
            kind: "text",
            text: "The threshold each pixel is measured against comes from a repeating four by four matrix rather than from a random number. That is what gives the result its woven, printed look instead of the sandy look of noise, and it is also why the picture is stable: the same pixel gets the same threshold on every frame, so nothing crawls.",
          },
          {
            kind: "text",
            text: "Because both colours come from the theme, the same photograph arrives as dark ink on pale paper in a light application and the other way round in a dark one.",
          },
        ],
      },
      {
        id: "fallback",
        title: "There is always a picture",
        blocks: [
          {
            kind: "text",
            text: "The original is rendered as an ordinary image underneath. If WebGL is missing, if the shader will not compile, or if the picture comes from a host that refuses to let it be read, the reader gets the photograph rather than an empty box.",
          },
        ],
      },
    ],
    accessibility:
      "The alt text is carried by both the fallback image and the canvas, so the picture is described once whichever is showing. Nothing moves, so there is nothing for reduced motion to remove.",
  },
  {
    slug: "ascii-image",
    kind: "component",
    name: "ASCII Image",
    family: "Scenes",
    summary:
      "A photograph redrawn as characters. The grid is worked out once and kept, so each frame is a single copy rather than thousands of letters measured again.",
    dependencies: [],
    install: registryInstallCommand("ascii-image"),
    npmImport: packageImport("AsciiImage", "ascii-image"),
    usage: `export function Portrait() {
  return (
    <AsciiImage
      src="/team/ada.jpg"
      alt="Ada at her desk"
      cell={7}
      className="aspect-square"
    />
  )
}`,
    props: [
      ["src", "string", "The picture."],
      ["alt", "string", "Describes it. Required."],
      [
        "cell",
        "number",
        "Width of one character cell in pixels. Defaults to 8.",
      ],
      [
        "ramp",
        "string",
        'The characters, darkest first. Defaults to "@%#*+=-:. ".',
      ],
      ["color", "string", 'The characters. Defaults to "--foreground".'],
      ["background", "string", 'Behind them. Defaults to "--background".'],
      ["contrast", "number", "Applied before the ramp. Defaults to 1.2."],
    ],
    sections: [
      {
        id: "still",
        title: "Worked out once",
        blocks: [
          {
            kind: "text",
            text: "A grid of this size is several thousand characters, each of which has to be measured and drawn. Doing that every frame to produce an identical result would be the most expensive component here by a wide margin.",
          },
          {
            kind: "text",
            text: "So the grid is drawn once into a canvas kept aside, and every frame after that is a single copy of it. It is worked out again only when something it is made of changes: the picture arrived, the box was resized, the theme was switched, a prop moved. Everything else costs one copy.",
          },
          {
            kind: "text",
            text: "The surface underneath still sleeps whenever it is off screen or its tab is hidden, so a page holding one of these is doing nothing at all while it is out of sight.",
          },
        ],
      },
      {
        id: "ramp",
        title: "Choosing the characters",
        blocks: [
          {
            kind: "text",
            text: "The ramp runs from the character used for the darkest part of the picture to the one used for the lightest, and the last entry is usually a space. Shorter ramps are more graphic and longer ones hold more detail.",
          },
          {
            kind: "code",
            code: `<AsciiImage src="/team/ada.jpg" alt="Ada" ramp="#+-. " cell={10} />`,
            caption:
              "Cells are drawn a little taller than they are wide, because that is the shape of a character.",
          },
        ],
      },
    ],
    accessibility:
      "The canvas is announced as an image with your alt text, so the picture is described exactly as an ordinary one would be. Nothing animates at any setting.",
  },
  {
    slug: "wireframe-globe",
    featured: true,
    kind: "component",
    name: "Wireframe Globe",
    family: "Scenes",
    summary:
      "A wireframe world with places marked on it, arcs between them, and the same places written out underneath as text.",
    dependencies: ["three"],
    install: registryInstallCommand("wireframe-globe"),
    npmImport: packageImport("WireframeGlobe", "wireframe-globe"),
    usage: `export function Regions() {
  return (
    <WireframeGlobe
      markers={[
        { id: "lhr", lat: 51.47, lng: -0.45, label: "London" },
        { id: "sin", lat: 1.36, lng: 103.99, label: "Singapore" },
      ]}
      className="aspect-square"
    />
  )
}`,
    props: [
      ["markers", "GlobeMarker[]", "Places to mark."],
      ["arcs", "GlobeArc[]", "Lines drawn between two places."],
      ["color", "string", 'The sphere. Defaults to "--border".'],
      ["accent", "string", 'The markers and arcs. Defaults to "--primary".'],
      ["speed", "number", "Turns per second. Defaults to 0.06."],
      ["interactive", "boolean", "Lets the pointer spin it. On by default."],
    ],
    types: [
      {
        name: "GlobeMarker",
        rows: [
          ["lat", "number", "Degrees north."],
          ["lng", "number", "Degrees east."],
          [
            "label",
            "string",
            "What the place is called. Required, and used in the text list.",
          ],
          ["id", "string", "Optional key."],
        ],
      },
      {
        name: "GlobeArc",
        rows: [
          ["from", "{ lat, lng }", "Where the line starts."],
          ["to", "{ lat, lng }", "Where it ends."],
        ],
      },
    ],
    sections: [
      {
        id: "text",
        title: "The list is not optional",
        blocks: [
          {
            kind: "text",
            text: "A globe is usually showing something real: where the regions are, where the customers are, where the incident is. That information cannot live only in a canvas, so the markers are also rendered as a plain list for anything that does not read one.",
          },
          {
            kind: "text",
            text: "This is why label is required rather than optional. A marker without a name is a dot on a sphere and there is nothing to say about it.",
          },
        ],
      },
      {
        id: "peers",
        title: "What it needs installed",
        blocks: [
          {
            kind: "text",
            text: "Along with the scene hero, this is one of the two components that ask for three, and it is an optional peer. The package root does not export it, because a barrel holding it would fail to resolve for everyone who had not installed three.",
          },
          {
            kind: "code",
            code: `npm install mischief-ui three`,
            caption:
              "Import it from its own entry: mischief-ui/wireframe-globe, not the package root.",
          },
        ],
      },
      {
        id: "spin",
        title: "Turning it",
        blocks: [
          {
            kind: "text",
            text: "It turns slowly on its own and can be dragged, and a drag carries a little momentum before the steady turn takes over again. Set interactive to false when the globe sits behind something else that should be receiving the pointer.",
          },
        ],
      },
    ],
    accessibility:
      "The canvas is decoration and the markers are a real list, so the places are read out in order whether or not anything renders. Under reduced motion one frame is drawn and the globe neither turns nor drifts, though it can still be dragged, because that movement is the reader's own.",
  },
  {
    slug: "presence-field",
    kind: "component",
    name: "Presence Field",
    family: "Agent UI",
    featured: true,
    summary:
      "An ambient backdrop that carries what the assistant is doing. It changes colour and pace with the state, and settles into each one rather than snapping to it.",
    dependencies: [],
    install: registryInstallCommand("presence-field"),
    npmImport: packageImport("PresenceField", "presence-field"),
    usage: `export function Thread({ status }) {
  return (
    <PresenceField state={status} className="rounded-xl">
      <Conversation>{/* messages */}</Conversation>
      <ThinkingState status={status} />
    </PresenceField>
  )
}`,
    props: [
      [
        "state",
        '"idle" | "thinking" | "streaming" | "done" | "error"',
        'What the assistant is doing. Defaults to "idle".',
      ],
      [
        "base",
        "string",
        'The colour it settles to. Defaults to "--background".',
      ],
      ["active", "string", 'While it is working. Defaults to "--primary".'],
      [
        "fault",
        "string",
        'When something went wrong. Defaults to "--destructive".',
      ],
      [
        "quiet",
        "string",
        'While it is idle. Defaults to "--muted-foreground".',
      ],
      [
        "activity",
        "number",
        "Nought to one, for how much is arriving. Only read while streaming.",
      ],
    ],
    sections: [
      {
        id: "second-channel",
        title: "A second channel, never the only one",
        blocks: [
          {
            kind: "text",
            text: "This is the one rule that matters here. A colour behind a thread is not a status: it cannot be read out, it is invisible to anyone who cannot distinguish the two colours you chose, and it says nothing at all to a reader who has motion turned off.",
          },
          {
            kind: "text",
            text: "Put it behind a thread whose state is already written down. The thinking state component says what is happening in words; this says the same thing in the room around it. Take the words away and you have a page that changes colour for no stated reason.",
          },
          {
            kind: "code",
            code: `<PresenceField state={status}>
  <Conversation>{messages}</Conversation>
  <ThinkingState status={status} />
</PresenceField>`,
            caption: "The field decorates the state. It does not report it.",
          },
        ],
      },
      {
        id: "settles",
        title: "It settles rather than switches",
        blocks: [
          {
            kind: "text",
            text: "Both the colour and the pace are eased toward whatever the current state calls for, on every frame, rather than being set when the state changes. A thread that finishes drifts down to rest over about a second instead of cutting to a new colour.",
          },
          {
            kind: "text",
            text: "That easing is why the states are not simply four different shaders. There is one field, and the state moves it.",
          },
          {
            kind: "table",
            headers: ["State", "Pace", "Colour"],
            rows: [
              ["idle", "Very slow", "The quiet colour"],
              ["thinking", "Steady", "The active colour"],
              [
                "streaming",
                "Quickest, and quicker again with activity",
                "The active colour",
              ],
              ["done", "Almost still", "The active colour, faint"],
              ["error", "Unsettled", "The fault colour"],
            ],
          },
        ],
      },
      {
        id: "readable",
        title: "Keeping the middle quiet",
        blocks: [
          {
            kind: "text",
            text: "The field is brightest at the edges and weakest in the middle, because the middle is where the thread is. Text stays on an almost plain background while the movement happens around it.",
          },
        ],
      },
    ],
    accessibility:
      "The canvas is decoration and is hidden from assistive technology, deliberately: the state belongs to the component that states it in words. Under reduced motion one frame is drawn and the field never moves, which is exactly why it must not be the only signal. Children are ordinary markup above it.",
  },
  {
    slug: "stream-glow",
    kind: "component",
    name: "Stream Glow",
    family: "Agent UI",
    summary:
      "An edge that breathes along a region while tokens land in it, and stops the moment they do.",
    dependencies: [],
    install: registryInstallCommand("stream-glow"),
    npmImport: packageImport("StreamGlow", "stream-glow"),
    usage: `export function Answer({ streaming, tokensPerSecond }) {
  return (
    <StreamGlow active={streaming} rate={tokensPerSecond / 60} className="rounded-xl border p-6">
      <Message>{/* the answer so far */}</Message>
    </StreamGlow>
  )
}`,
    props: [
      ["active", "boolean", "Whether anything is arriving. Off by default."],
      [
        "rate",
        "number",
        "Nought to one. Faster arrival breathes faster and reaches further. Defaults to 0.5.",
      ],
      [
        "color",
        "string",
        'A theme property or CSS colour. Defaults to "--primary".',
      ],
      ["spread", "number", "Thickness of the glow in pixels. Defaults to 22."],
    ],
    sections: [
      {
        id: "says",
        title: "What it is allowed to mean",
        blocks: [
          {
            kind: "text",
            text: "Only that something is arriving. It cannot say what, or how far through, or whether it went wrong, so it belongs next to a stop control and a written status rather than standing in for either.",
          },
          {
            kind: "text",
            text: "It is CSS, not a canvas. There is nothing to draw here that a shadow and an opacity cannot do, and staying in CSS means it costs nothing and inherits the border radius of whatever you put it on.",
          },
        ],
      },
      {
        id: "rate",
        title: "Tying it to the throughput",
        blocks: [
          {
            kind: "text",
            text: "Rate changes both how quickly the edge breathes and how far it reaches, so a fast answer looks fast. Normalise your tokens per second into nought through one before passing it, and keep the value smoothed: a glow driven by a raw per-frame figure flickers.",
          },
        ],
      },
    ],
    accessibility:
      "The glow is a hidden decorative layer and announces nothing. Under reduced motion the breathing stops and a steady edge remains, so the region is still marked. As with any ambient signal, the words next to it are what actually reports the state.",
  },
  {
    slug: "otp-input",
    kind: "component",
    name: "OTP Input",
    family: "Controls",
    summary:
      "A one time code, one box per character, where pasting the whole code into any box fills the rest.",
    dependencies: [],
    install: registryInstallCommand("otp-input"),
    npmImport: packageImport("OtpInput", "otp-input"),
    usage: `export function Verify() {
  const [code, setCode] = React.useState("")

  return (
    <OtpInput value={code} onChange={setCode} onComplete={submit} />
  )
}`,
    props: [
      ["length", "number", "How many boxes. Defaults to 6."],
      ["value", "string", "Controlled value."],
      ["defaultValue", "string", "Uncontrolled starting value."],
      ["onChange", "(value: string) => void", "The code so far."],
      [
        "onComplete",
        "(value: string) => void",
        "Called once the last box is filled.",
      ],
      [
        "pattern",
        "RegExp",
        "Which characters are allowed, tested one at a time. Digits by default.",
      ],
      [
        "label",
        "string",
        'Names the group and each box. Defaults to "One time code".',
      ],
    ],
    sections: [
      {
        id: "paste",
        title: "Pasting is the normal case",
        blocks: [
          {
            kind: "text",
            text: "People do not type these codes. They copy the whole thing from a message and paste it, and they paste it into whichever box happens to have focus. So a paste is caught wherever it lands, filtered to the characters the pattern allows, spread across the boxes from that point, and focus is left on the first box still empty.",
          },
          {
            kind: "text",
            text: "The first box also carries the one time code autocomplete hint, which is what lets a phone offer the code straight from the message without anyone touching the clipboard at all.",
          },
        ],
      },
      {
        id: "keys",
        title: "The keys people actually press",
        blocks: [
          {
            kind: "list",
            items: [
              "Backspace on a filled box clears it and stays. On an empty box it clears the one before and moves back, which is what people expect after overshooting.",
              "Left and right arrows move between boxes without changing anything.",
              "Typing into a filled box replaces its character rather than being ignored.",
            ],
          },
          {
            kind: "text",
            text: "Every box is named as a character and its position, so moving between them announces where you are rather than repeating the same label six times.",
          },
        ],
      },
    ],
    accessibility:
      "The boxes are a named group and each is labelled with its position in it. The numeric keyboard is requested when the pattern is digits, and the first box carries the one time code hint so a phone can offer it. The filled state is shown with a border and a small change of scale rather than colour alone, and that scale change is removed under reduced motion.",
  },
  {
    slug: "tag-input",
    kind: "component",
    name: "Tag Input",
    family: "Controls",
    summary:
      "An input that turns what you typed into a removable tag, and gives the last one back when you press backspace on an empty field.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("tag-input"),
    npmImport: packageImport("TagInput", "tag-input"),
    usage: `export function Topics() {
  const [tags, setTags] = React.useState(["design"])

  return <TagInput value={tags} onChange={setTags} max={6} label="Topics" />
}`,
    props: [
      ["value", "string[]", "Controlled tags."],
      ["defaultValue", "string[]", "Uncontrolled starting tags."],
      ["onChange", "(tags: string[]) => void", "The tags after a change."],
      ["placeholder", "string", "Shown in the empty field."],
      [
        "separators",
        "string[]",
        'Keys that end a tag, besides Enter. Defaults to [",", "Enter"].',
      ],
      ["max", "number", "Most tags allowed. The field closes once reached."],
      [
        "allowDuplicates",
        "boolean",
        "Whether the same tag may be added twice. Off by default.",
      ],
      ["label", "string", 'Names the field. Defaults to "Tags".'],
    ],
    sections: [
      {
        id: "announced",
        title: "Every change is said",
        blocks: [
          {
            kind: "text",
            text: "Adding a tag, removing one, and being refused a duplicate are all announced in a polite live region. Without that, a reader using a screen reader presses Enter and hears nothing, which is indistinguishable from the field being broken.",
          },
          {
            kind: "text",
            text: "Each remove control is named with the tag it removes rather than being six identical buttons called Remove.",
          },
        ],
      },
      {
        id: "habits",
        title: "The habits it expects",
        blocks: [
          {
            kind: "list",
            items: [
              "Enter or a comma ends a tag. Whitespace around it is trimmed.",
              "Backspace on an empty field takes the last tag back, so overshooting is recoverable without reaching for the pointer.",
              "Leaving the field commits whatever was half typed, rather than throwing it away.",
              "A duplicate clears the field and says so, instead of silently doing nothing.",
            ],
          },
        ],
      },
    ],
    accessibility:
      "The field is labelled, described by its status region, and every change is announced politely. Remove controls name their own tag. Clicking the surrounding box focuses the field, and the whole control shows a focus ring when anything inside it has focus.",
  },
  {
    slug: "sortable-list",
    kind: "component",
    name: "Sortable List",
    family: "Controls",
    summary:
      "A list reordered by dragging a handle, or from the keyboard without one, where every move is announced.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("sortable-list"),
    npmImport: packageImport("SortableList", "sortable-list"),
    usage: `export function Tasks() {
  const [tasks, setTasks] = React.useState(initial)

  return (
    <SortableList
      items={tasks}
      getKey={(task) => task.id}
      getLabel={(task) => task.name}
      onReorder={setTasks}
      renderItem={(task) => <p>{task.name}</p>}
    />
  )
}`,
    props: [
      ["items", "TItem[]", "The list, in its current order."],
      ["getKey", "(item) => string", "A stable key for each item."],
      ["onReorder", "(items) => void", "The list in its new order."],
      ["renderItem", "(item, index) => ReactNode", "What each row shows."],
      [
        "getLabel",
        "(item) => string",
        "Names the item on its handle and in announcements. Worth passing.",
      ],
      ["label", "string", 'Names the list. Defaults to "Sortable list".'],
    ],
    sections: [
      {
        id: "keyboard",
        title: "Reordering without a pointer",
        blocks: [
          {
            kind: "text",
            text: "Drag and drop is the version of this everyone builds and the version a keyboard cannot use. So the handle is a real button that can be focused, and the whole operation works from there.",
          },
          {
            kind: "list",
            items: [
              "Space or Enter lifts the item, and says so along with what to do next.",
              "Up and down arrows move it while it is lifted, announcing its new position each time.",
              "Space or Enter drops it.",
              "Escape puts the list back the way it was before the lift.",
            ],
          },
          {
            kind: "text",
            text: "A lifted item is marked as pressed and ringed, so its state is visible as well as announced.",
          },
        ],
      },
      {
        id: "announcing",
        title: "Saying where things went",
        blocks: [
          {
            kind: "text",
            text: "Every move reports the item and its new position out of the total. A list that rearranges itself in silence is unusable to anyone not watching it, and that includes anyone who dragged something and looked away.",
          },
          {
            kind: "code",
            code: `getLabel={(task) => task.name}`,
            caption:
              "Without this the announcements can only say Item 3, which is true and useless.",
          },
        ],
      },
      {
        id: "controlled",
        title: "It owns no order of its own",
        blocks: [
          {
            kind: "text",
            text: "The list is whatever you passed and every change comes back through onReorder, including the ones made while a drag is still in progress. There is no internal copy to fall out of step with yours, and persisting the order is a matter of saving what you were handed.",
          },
        ],
      },
    ],
    accessibility:
      "An ordered list whose handles are named buttons carrying the item's name. The full operation is available from the keyboard, with lifted state exposed as pressed, and every move and cancellation announced politely. Escape restores the order from before the lift.",
  },
  {
    slug: "resizable-panels",
    kind: "component",
    name: "Resizable Panels",
    family: "Blocks",
    summary:
      "Two panels and something to drag between them, where the divider is a real separator that also works from the keyboard.",
    dependencies: [],
    install: registryInstallCommand("resizable-panels"),
    npmImport: packageImport("ResizablePanels", "resizable-panels"),
    usage: `export function Workspace() {
  return (
    <ResizablePanels
      defaultSize={38}
      first={<FileTree />}
      second={<Editor />}
      className="h-96 rounded-xl border"
    />
  )
}`,
    props: [
      ["first", "ReactNode", "The panel the size applies to."],
      ["second", "ReactNode", "The panel that takes the rest."],
      [
        "direction",
        '"horizontal" | "vertical"',
        'Which way they sit. Defaults to "horizontal".',
      ],
      ["size", "number", "Controlled percentage for the first panel."],
      [
        "defaultSize",
        "number",
        "Uncontrolled starting percentage. Defaults to 50.",
      ],
      ["onSizeChange", "(size: number) => void", "The new percentage."],
      ["min", "number", "Smallest percentage. Defaults to 15."],
      ["max", "number", "Largest percentage. Defaults to 85."],
      [
        "step",
        "number",
        "Percentage points an arrow key moves. Defaults to 4.",
      ],
    ],
    sections: [
      {
        id: "separator",
        title: "A separator with a value",
        blocks: [
          {
            kind: "text",
            text: "The divider is a separator with a current value, a minimum, and a maximum, and it can be focused. That is what makes the split adjustable by anyone who cannot drag: arrow keys move it a step at a time, and Home and End take it to either limit.",
          },
          {
            kind: "text",
            text: "A one pixel line is also close to impossible to hit with a pointer, so the area that responds is considerably wider than the line that is drawn. The line stays thin and the target does not.",
          },
        ],
      },
      {
        id: "bounds",
        title: "Panels that cannot be lost",
        blocks: [
          {
            kind: "text",
            text: "The size is clamped between the minimum and maximum on every change, wherever it came from, so neither panel can be dragged down to nothing and become impossible to get back. Both panels scroll their own contents rather than pushing the split around.",
          },
        ],
      },
    ],
    accessibility:
      "The divider is a separator with an orientation, a current value, and its limits, reachable in the tab order and driven by the arrow keys, Home, and End. Its grab area is far larger than the line it draws. Both panels are ordinary regions and their contents are reached in the order they are written.",
  },
  {
    slug: "stepper",
    kind: "component",
    name: "Stepper",
    family: "Controls",
    summary:
      "Where someone is in something with a beginning and an end, said in words as well as drawn.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("stepper"),
    npmImport: packageImport("Stepper", "stepper"),
    usage: `export function Setup({ step }) {
  return (
    <Stepper
      current={step}
      steps={[
        { id: "account", label: "Account", description: "Name and email" },
        { id: "workspace", label: "Workspace" },
        { id: "done", label: "Done" },
      ]}
    />
  )
}`,
    props: [
      ["steps", "Step[]", "The steps, in order."],
      ["current", "number", "Index of the step being worked on."],
      [
        "orientation",
        '"horizontal" | "vertical"',
        'Which way it runs. Defaults to "horizontal".',
      ],
      [
        "onSelect",
        "(index, step) => void",
        "Makes finished steps revisitable. Without it they are not.",
      ],
      ["label", "string", 'Names the navigation. Defaults to "Progress".'],
    ],
    types: [
      {
        name: "Step",
        rows: [
          ["id", "string", "Identifies the step."],
          ["label", "string", "What it is called."],
          ["description", "string", "An optional line underneath."],
        ],
      },
    ],
    sections: [
      {
        id: "said",
        title: "Progress that does not live in a colour",
        blocks: [
          {
            kind: "text",
            text: "A filled circle means finished and an outlined one means not started, and neither of those is available to a reader who cannot see them. So each step also carries its state as text: finished, in progress, or not started, read after its name.",
          },
          {
            kind: "text",
            text: "The current step is marked as the current step in the page, which is how assistive technology finds it without being told where to look.",
          },
        ],
      },
      {
        id: "back",
        title: "Going back only when there is somewhere to go",
        blocks: [
          {
            kind: "text",
            text: "Pass onSelect and finished steps become buttons that return to them. Leave it out and nothing in the stepper is interactive, which is the right default: most steppers report progress rather than offering navigation, and a control that looks pressable and is not is worse than no control.",
          },
          {
            kind: "text",
            text: "Steps ahead of the current one are never reachable, whether or not onSelect is passed.",
          },
        ],
      },
    ],
    accessibility:
      "A navigation landmark holding an ordered list. Each step's state is written out after its name, the current step is marked as current, and the connecting lines are hidden. Revisitable steps are real buttons, named with where they go, and steps ahead are never among them.",
  },
  {
    slug: "avatar-stack",
    kind: "component",
    name: "Avatar Stack",
    family: "Blocks",
    summary:
      "Overlapping faces with a count for the rest, and the names underneath as a real list.",
    dependencies: [],
    install: registryInstallCommand("avatar-stack"),
    npmImport: packageImport("AvatarStack", "avatar-stack"),
    usage: `export function Editors({ people }) {
  return <AvatarStack people={people} max={4} label="Editing now" />
}`,
    props: [
      ["people", "Person[]", "Everyone, not only the ones shown."],
      [
        "max",
        "number",
        "How many faces before the rest become a count. Defaults to 4.",
      ],
      ["size", "number", "Pixels across. Defaults to 32."],
      [
        "spread",
        "boolean",
        "Fans the stack out under the pointer. On by default.",
      ],
      ["label", "string", 'Names the group. Defaults to "People".'],
    ],
    types: [
      {
        name: "Person",
        rows: [
          ["name", "string", "Used as the picture's alt text, or as initials."],
          [
            "src",
            "string",
            "Optional picture. Without one, initials are drawn.",
          ],
          ["id", "string", "Optional key."],
        ],
      },
    ],
    sections: [
      {
        id: "list",
        title: "Faces on top of a list",
        blocks: [
          {
            kind: "text",
            text: "The stack is a named list and each face is an item in it, so the group is read as the people it contains rather than as a row of pictures. Someone without a picture gets their initials drawn, with their full name still carried underneath, because initials read aloud are not a name.",
          },
          {
            kind: "text",
            text: "The overflow count says how many more there are in words as well as showing a number, so it is announced as a quantity of people rather than as a plus sign and a digit.",
          },
        ],
      },
    ],
    accessibility:
      "A named list whose items carry full names, whether shown as a picture or as initials. The overflow is announced as a number of further people. Under reduced motion the stack does not fan out, and nothing about the group depends on it having done so.",
  },
  {
    slug: "timeline",
    kind: "component",
    name: "Timeline",
    family: "Blocks",
    summary:
      "Things that happened, in the order they happened, with the state of each one said aloud rather than left in a coloured dot.",
    dependencies: [],
    install: registryInstallCommand("timeline"),
    npmImport: packageImport("Timeline", "timeline"),
    usage: `export function History({ events }) {
  return <Timeline entries={events} label="Pull request history" />
}`,
    props: [
      ["entries", "TimelineEntry[]", "The events, oldest first."],
      ["label", "string", 'Names the list. Defaults to "Timeline".'],
    ],
    types: [
      {
        name: "TimelineEntry",
        rows: [
          ["id", "string", "Identifies the entry."],
          ["title", "string", "What happened."],
          ["time", "string", "When, already formatted."],
          ["description", "ReactNode", "Anything further."],
          [
            "tone",
            '"done" | "active" | "todo" | "problem"',
            'Its state. Defaults to "done".',
          ],
        ],
      },
    ],
    sections: [
      {
        id: "tone",
        title: "The dot is not the only thing carrying it",
        blocks: [
          {
            kind: "text",
            text: "Each tone is drawn as a colour and also written out after the title: finished, happening now, not started, or went wrong. The colour is the quick version for anyone who can see it and the words are the actual record.",
          },
          {
            kind: "text",
            text: "Time is taken already formatted rather than as a date, because how a time should be written depends on the locale, the timezone, and whether it is worth showing a year -- none of which a timeline component can work out on your behalf.",
          },
        ],
      },
    ],
    accessibility:
      "A named ordered list, so the sequence is conveyed as a sequence rather than as a column of text. Each entry's state is announced after its title, and the dots and connecting line are hidden. Nothing animates.",
  },
  {
    slug: "data-table",
    kind: "component",
    name: "Data Table",
    family: "Blocks",
    featured: true,
    summary:
      "Typed rows with cells you write, column widths you set or the reader drags, sorting that is one property to switch on, and selection kept in keys rather than positions.",
    dependencies: ["lucide-react"],
    install: registryInstallCommand("data-table"),
    npmImport: packageImport("DataTable", "data-table"),
    usage: `const columns: Column<Person>[] = [
  { key: "name", header: "Name", sort: true },
  { key: "email", header: "Email", cell: (p) => <a href={\`mailto:\${p.email}\`}>{p.email}</a> },
  { key: "seats", header: "Seats", width: "6rem", align: "end", sort: true },
]

export function People({ people }) {
  return (
    <DataTable
      rows={people}
      columns={columns}
      getKey={(person) => person.id}
      label="People"
    />
  )
}`,
    props: [
      ["rows", "TRow[]", "The data, in whatever order it arrived."],
      ["columns", "Column<TRow>[]", "One entry per column."],
      [
        "getKey",
        "(row) => string",
        "Identity that survives sorting. Selection is kept in these.",
      ],
      [
        "getLabel",
        "(row) => string",
        "Names a row, for the checkbox that selects it. Worth passing.",
      ],
      ["label", "string", "Names the table. Becomes its caption."],
      [
        "sort / defaultSort",
        "DataTableSort | null",
        "Which column, and which way.",
      ],
      ["onSortChange", "(sort) => void", "Called with the new sort, or null."],
      [
        "selected / defaultSelected",
        "string[]",
        "The keys that are selected. Passing any selection prop turns it on.",
      ],
      [
        "onSelectionChange",
        "(keys: string[]) => void",
        "The keys after a change.",
      ],
      [
        "resizable",
        "boolean",
        "Lets the reader drag the boundary between columns.",
      ],
      [
        "onColumnResize",
        "(key, width) => void",
        "For persisting a width you were given.",
      ],
      [
        "density",
        '"comfortable" | "compact"',
        'Row height. Defaults to "comfortable".',
      ],
      ["striped", "boolean", "Shades alternate rows."],
      [
        "loading",
        "boolean",
        "Shows placeholder rows shaped like the real ones.",
      ],
      ["loadingRows", "number", "How many placeholders. Defaults to 5."],
      ["stickyHeader", "boolean", "Holds the header while the body scrolls."],
      ["rowClassName", "(row, index) => string", "Classes for one row."],
      [
        "onRowClick",
        "(row, index) => void",
        "A pointer convenience. Never the only way to reach what it does.",
      ],
      ["empty", "ReactNode", "Shown instead of rows when there are none."],
    ],
    types: [
      {
        name: "Column<TRow>",
        rows: [
          [
            "key",
            "string",
            "Identifies the column, and names the field read when there is no cell or value.",
          ],
          ["header", "ReactNode", "The heading."],
          [
            "cell",
            "(row, index) => ReactNode",
            "What the cell shows. Defaults to the field named by key.",
          ],
          [
            "value",
            "(row) => SortValue",
            "What the column is worth when sorted. Defaults to the field named by key.",
          ],
          [
            "width",
            "string",
            "Any CSS width. Columns without one share what is left over.",
          ],
          [
            "minWidth",
            "number",
            "Narrowest it may be dragged, in pixels. Defaults to 64.",
          ],
          [
            "align",
            '"start" | "center" | "end"',
            "End also sets tabular figures.",
          ],
          [
            "sort",
            "boolean | ((a, b) => number)",
            "true for the built-in comparator, or your own. Absent means not sortable.",
          ],
          [
            "resizable",
            "boolean",
            "Excludes one column while the rest stay resizable.",
          ],
          [
            "maxWidth",
            "number",
            "Widest it may be dragged. Unbounded by default.",
          ],
          [
            "pinned",
            '"start"',
            "Holds the column against the left edge while the rest scrolls past.",
          ],
          [
            "wrap",
            "boolean",
            "Lets the cell run onto a second line instead of being cut short.",
          ],
          [
            "footer",
            "ReactNode | ((rows) => ReactNode)",
            "A summary under the column. The function is given the rows in the order shown.",
          ],
          [
            "sortFirst",
            '"asc" | "desc"',
            'Which way the first press sorts. Defaults to "asc".',
          ],
        ],
      },
    ],
    sections: [
      {
        id: "sorting",
        title: "Three levels of effort",
        blocks: [
          {
            kind: "text",
            text: "A column with no sort property is not sortable, and its heading is plain text rather than a button that looks pressable and does nothing.",
          },
          {
            kind: "text",
            text: "sort: true uses the built-in comparator against the column's value, which is the field named by key unless you gave it one. Numbers compare as numbers, dates as dates, and everything else by the reader's locale, so ten does not sort before nine and Ä does not sort after Z.",
          },
          {
            kind: "code",
            code: `{ key: "seats", header: "Seats", sort: true }
{ key: "plan", header: "Plan", sort: (a, b) => RANK[a.plan] - RANK[b.plan] }`,
            caption:
              "Anything with an order that is not alphabetical brings its own comparator.",
          },
          {
            kind: "text",
            text: "Pressing a heading a third time clears the sort and returns the rows to the order they arrived in, which is often the order that meant something before anyone touched it.",
          },
          {
            kind: "text",
            text: "Empty cells sit at the bottom whichever way the column is pointing. A column of blanks at the top is never what was being asked for.",
          },
        ],
      },
      {
        id: "widths",
        title: "Widths, and dragging them",
        blocks: [
          {
            kind: "text",
            text: "The table is laid out with fixed columns and a colgroup, so a width is any CSS length you like. Columns without one share whatever is left over in equal parts, which is the behaviour you would reach for a fraction unit to get.",
          },
          {
            kind: "code",
            code: `{ key: "plan", header: "Plan", width: "8rem" }
{ key: "name", header: "Name" }  // takes a share of the rest`,
          },
          {
            kind: "text",
            text: "With resizable on, every boundary between two columns can be dragged. The last column has no handle, because there is nothing to its right to trade width with. The first drag pins every column to the width it already had, so pulling one boundary does not make the others jump about, and a drag writes straight to the colgroup rather than into state, so moving a boundary renders nothing.",
          },
          {
            kind: "text",
            text: "Each handle is a separator that can be focused and moved with the arrow keys, because a table whose columns can only be adjusted by dragging cannot be adjusted by everybody. Double-clicking a handle returns that column to the width you declared, and no column can be dragged below its minimum and lost.",
          },
        ],
      },
      {
        id: "selection",
        title: "Selection is kept in keys",
        blocks: [
          {
            kind: "text",
            text: "Passing any of selected, defaultSelected, or onSelectionChange turns selection on. What is stored is whatever getKey returns, never a row position, so sorting the table does not silently change what is selected.",
          },
          {
            kind: "text",
            text: "Shift-clicking a checkbox extends from the last one touched, which is what people try first. The heading checkbox selects everything and shows the third, in-between state when only some rows are chosen -- a state that has to be set as a property rather than an attribute, which is why it is easy to leave out.",
          },
          {
            kind: "text",
            text: "Clicking a row never selects it. Only the checkbox does. That keeps onRowClick free to mean open this without the two gestures fighting, and keeps a link inside a cell working.",
          },
        ],
      },
      {
        id: "pinning",
        title: "Holding a column while the rest scrolls",
        blocks: [
          {
            kind: "text",
            text: "A wide table scrolls sideways, and the column saying which row you are looking at is the first thing to go. Pinning holds it against the left edge. The checkbox column is held with it whenever anything is pinned, because a column of checkboxes that has scrolled away from its rows is worse than no checkboxes at all.",
          },
          {
            kind: "code",
            code: `{ key: "name", header: "Name", pinned: "start", width: "11rem" }`,
          },
          {
            kind: "text",
            text: "Each held column's distance from the edge is written as a custom property rather than as a class, which is what lets the offsets follow a drag. Widen a held column and the ones after it move with it on the same frame, without anything re-rendering. Resizing and pinning are a pair: it is resizing that makes a table wide enough to need it.",
          },
        ],
      },
      {
        id: "loading",
        title: "Waiting, and not flashing while you do",
        blocks: [
          {
            kind: "text",
            text: "loading fills the body with placeholders shaped like the rows they stand in for: one per column, at the same density, so nothing shifts under the reader when the data lands.",
          },
          {
            kind: "text",
            text: "They are held back for a tenth of a second first. Most answers arrive faster than that, and a skeleton that appears and vanishes inside two frames reads as a flicker rather than as progress. The table marks itself busy while it waits, and the placeholders carry no text, so there is nothing for a screen reader to read out of them.",
          },
        ],
      },
      {
        id: "footers",
        title: "Totals",
        blocks: [
          {
            kind: "text",
            text: "A column with a footer gets one, and the table grows a foot only when at least one column has asked for it. The function is handed the rows in the order they are shown, so a total is the sum of what is in front of you.",
          },
          {
            kind: "code",
            code: `{
  key: "seats",
  header: "Seats",
  align: "end",
  sortFirst: "desc",
  footer: (rows) => rows.reduce((total, row) => total + row.seats, 0),
}`,
            caption:
              "sortFirst earns its place on a number: the first press of Seats nearly always means show me the biggest.",
          },
        ],
      },
      {
        id: "composing",
        title: "What it deliberately does not do",
        blocks: [
          {
            kind: "text",
            text: "There is no pagination, no filtering, and no toolbar in here. Mischief already has pagination, and an empty row for when a filter matches nothing, and they compose better as themselves than they would absorbed into this.",
          },
          {
            kind: "code",
            code: `<DataTable rows={page} columns={columns} getKey={byId} label="Invoices" />
<Pagination page={page} pageCount={pages} onPageChange={setPage} />`,
          },
          {
            kind: "text",
            text: "There is no virtualisation either. It would change how every row is rendered, and a few hundred rows do not need it. Reach for a windowing library when you genuinely have thousands.",
          },
          {
            kind: "text",
            text: "Nor is there a menu for hiding columns, because there does not need to be. Columns are an array you own, so hiding one is filtering that array before you hand it over, and the widths, the sorting and the pinning all follow from that with nothing else to keep in step.",
          },
          {
            kind: "code",
            code: `const shown = columns.filter((column) => visible[column.key])

<DataTable rows={rows} columns={shown} getKey={byId} label="Invoices" />`,
          },
        ],
      },
    ],
    accessibility:
      "A real table with a caption, column headers scoped to their columns, and aria-sort on any column that can be sorted, so the current order is announced when a heading is reached. Sort controls are buttons with a touch-sized target. Resize handles are separators in the tab order, driven by the arrow keys. Every checkbox is named with the row it selects rather than being a column of boxes called Select, and the number chosen is kept in a polite live region. onRowClick is pointer only and is documented as never being the only route to what it does. While loading it marks itself busy, and the placeholders carry no text for anything to read out.",
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

/**
 * The families in the order a reader should meet them, and what each is for.
 * This is the one place the order lives: the sidebar, the home page gallery,
 * the docs index, and llms.txt all read it rather than grouping again.
 */
const familyOrder = [
  [
    "Agent UI",
    "The surface an assistant answers through: the thread, the composer, and everything it shows while it is working.",
  ],
  [
    "Code",
    "Code an agent wrote, ran, or wants to change, and the controls to accept it.",
  ],
  [
    "Documents",
    "Reading a file someone uploaded, marking it up, cutting it into pieces, and pulling structure out of it.",
  ],
  ["Files", "Getting a file in, and showing what arrived."],
  [
    "Feedback",
    "What the page says while it waits, and when there is nothing to show.",
  ],
  [
    "Controls",
    "Familiar inputs with more feedback than usual, and none of it required to operate them.",
  ],
  [
    "Wayfinding",
    "Knowing where you are in something long, and getting somewhere else quickly.",
  ],
  ["Docs", "The furniture of a documentation site, taken out of this one."],
  [
    "Blocks",
    "Larger pieces that compose several components into one part of a page.",
  ],
  [
    "Scenes",
    "Backdrops and moments where the drawing is the job, each one taking its colours from the theme it was installed into.",
  ],
  [
    "Motion",
    "Entrances and numbers that move, driven by arrival or by scrolling, and never by withholding the content.",
  ],
] as const

export type ComponentFamily = {
  name: string
  slug: string
  description: string
  components: ComponentDoc[]
}

/** "Agent UI" as it appears in a URL. */
export function familySlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export const componentFamilies: ComponentFamily[] = familyOrder.map(
  ([name, description]) => ({
    name,
    slug: familySlug(name),
    description,
    components: componentDocs.filter((component) => component.family === name),
  })
)

export function getComponentFamily(slug: string) {
  return componentFamilies.find((family) => family.slug === slug)
}

/** Shown with a live demo on the home page. The rest are listed compactly. */
export const featuredComponents = componentDocs.filter(
  (component) => component.featured
)

export type ComponentDoc = (typeof componentDocs)[number]

export type ComponentSlug = ComponentDoc["slug"]

export function getComponentDoc(slug: string) {
  return componentDocs.find((component) => component.slug === slug)
}
