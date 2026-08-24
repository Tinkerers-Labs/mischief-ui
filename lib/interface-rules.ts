import { componentDocs } from "@/lib/component-docs"

/**
 * A rule, and what makes it true rather than aspirational.
 *
 * `checked` names a test in this repository that fails when the rule is
 * broken. `components` are the ones a reader can open to see it kept. A rule
 * with neither is an opinion, and none of these are.
 */
export type InterfaceRule = {
  id: string
  rule: string
  detail: string
  /** The test that enforces this across the collection. */
  checked?: string
  /** Slugs demonstrating it. */
  components?: readonly string[]
}

export type InterfaceSection = {
  id: string
  title: string
  description: string
  rules: readonly InterfaceRule[]
}

export const interfaceSections: readonly InterfaceSection[] = [
  {
    id: "motion",
    title: "Motion",
    description:
      "Movement is a way of explaining a change, not a toll paid before seeing it.",
    rules: [
      {
        id: "motion-decides",
        rule: "Anything that moves decides what it does when motion is unwelcome.",
        detail:
          "Not one component animates without saying what happens under prefers-reduced-motion. It is a decision every time rather than a default, because the right answer differs: some things stop, some things cut to the end state, and some stop being that kind of component altogether.",
        checked: "every animating component handles reduced motion",
      },
      {
        id: "motion-never-withholds",
        rule: "Motion changes how something arrives, never whether it arrives.",
        detail:
          "An entrance that fades content in from nothing has made the content conditional on a script running, an observer firing, and a preference being off. The content is present and readable from the first paint, and the movement is the part that is optional.",
        components: ["reveal", "split-text", "number-ticker"],
      },
      {
        id: "motion-reduced-is-not-frozen",
        rule: "Stopping is not always the reduced-motion answer.",
        detail:
          "A frozen marquee leaves whatever had not scrolled past permanently unreachable, and a frozen audio meter says the microphone is dead while it is open. Where stopping would lie or hide, the component becomes something else: a row that scrolls, or a line of text.",
        components: ["marquee", "voice-input", "connection-beam"],
      },
      {
        id: "motion-off-screen",
        rule: "A drawing surface that cannot be seen is not drawing.",
        detail:
          "Every canvas here sleeps when it scrolls out of view, when its tab is hidden, and when it is told to pause, and picks up where it left off. Time spent asleep does not count, so an animation does not jump forward to catch up on arrival.",
        components: ["render-surface", "metaballs", "constellation-field"],
      },
    ],
  },
  {
    id: "waiting",
    title: "Waiting",
    description: "What the page says between asking and answering.",
    rules: [
      {
        id: "waiting-says-what",
        rule: "Say what is being waited for, not that something is happening.",
        detail:
          "A spinner with no words is a claim that the page is not broken and nothing more. Where the wait has a subject or a length, the component says so: which tool is running, how long it has been, how much of the context is gone.",
        components: ["thinking-state", "tool-call", "token-meter"],
      },
      {
        id: "waiting-empty-is-a-state",
        rule: "Nothing to show is a state somebody designed, not a blank area.",
        detail:
          "Empty, failed, and not-yet are three different things and want three different sentences. A table with no rows because a filter excluded them is not the same as a table with no rows at all.",
        components: ["empty-state", "empty-row", "not-found"],
      },
      {
        id: "waiting-shape-first",
        rule: "A placeholder should be the shape of what is coming.",
        detail:
          "A skeleton exists so the layout does not jump when the content lands. One that is not the size of the real thing has spent the reader's attention on a jump it was meant to prevent.",
        components: ["skeleton", "spinner"],
      },
      {
        id: "waiting-interruptible",
        rule: "Anything long enough to regret is long enough to stop.",
        detail:
          "A generation that cannot be interrupted makes the reader wait for an answer they already know is wrong. The control that stops it says how long it has been running, and Escape works.",
        components: ["stop-generating", "streaming-text"],
      },
    ],
  },
  {
    id: "keyboard",
    title: "Keyboard",
    description:
      "Everything that can be done with a pointer can be done without one.",
    rules: [
      {
        id: "keyboard-one-stop",
        rule: "A composite widget is one tab stop, not one per item.",
        detail:
          "Tabbing through a hundred tree rows to reach what is after the tree is not navigation. A tree, a listbox or a toolbar takes one Tab, and the arrow keys move within it, with the widget remembering which item it was on.",
        components: ["json-viewer", "file-tree", "command-palette"],
      },
      {
        id: "keyboard-arrows-mean",
        rule: "Arrow keys mean what the shape implies.",
        detail:
          "In a tree, Right opens and then descends, Left closes and then climbs to the parent. In a list, Home and End go to the ends. These are not preferences; they are what somebody arriving with the habit already expects.",
        components: ["json-viewer", "file-tree", "sortable-list"],
      },
      {
        id: "keyboard-escape",
        rule: "Escape closes the thing that opened last.",
        detail:
          "Anything laid over the page can be dismissed from the keyboard, and focus goes back where it came from rather than to the top of the document.",
        components: ["command-palette", "side-panel", "lightbox"],
      },
      {
        id: "keyboard-not-only-hover",
        rule: "Nothing is reachable only by hovering.",
        detail:
          "A control that appears on hover appears on focus too. Otherwise it exists for pointers alone, which is most of the reason row actions go missing for keyboard users.",
        components: ["json-viewer", "message", "response-actions"],
      },
    ],
  },
  {
    id: "focus",
    title: "Focus",
    description: "Where you are, and where you go back to.",
    rules: [
      {
        id: "focus-visible-only",
        rule: "Style focus-visible, never focus.",
        detail:
          "Styling :focus puts a ring on a button somebody clicked, which reads as a bug and teaches people to remove it. Across every component here there is not one bare focus: utility.",
        checked: "no component styles bare focus",
      },
      {
        id: "focus-never-removed",
        rule: "An outline is replaced, not removed.",
        detail:
          "outline: none on its own leaves keyboard users with no way to tell where they are. Where the native ring is dropped, a ring is drawn in its place in the same act.",
        components: ["copy-button", "otp-input", "tag-input"],
      },
      {
        id: "focus-returns",
        rule: "Focus comes back from wherever it went.",
        detail:
          "When something laid over the page closes, focus returns to what opened it. Otherwise the next Tab starts from the beginning of the document and the reader has to find their place again.",
        components: ["command-palette", "side-panel"],
      },
    ],
  },
  {
    id: "announcements",
    title: "Announcements",
    description: "What a screen reader is told, and how often.",
    rules: [
      {
        id: "announce-once",
        rule: "Say it once.",
        detail:
          "A message shown on screen and repeated in a live region is heard twice. Where both exist, one of them is the announcement and the other is marked as decoration, so the sentence is said a single time.",
        components: ["voice-input", "code-block"],
      },
      {
        id: "announce-state-changes",
        rule: "A change with no new text still needs saying.",
        detail:
          "An icon swapping from a clipboard to a tick is invisible to a screen reader. Anything that only changes appearance is announced politely in words.",
        components: ["copy-button", "copy-for-ai", "json-viewer"],
      },
      {
        id: "announce-state-in-tree",
        rule: "State belongs in the accessibility tree, not only in the styling.",
        detail:
          "Pressed, expanded, selected, sorted and current are attributes before they are colours. A control whose only record of being on is a background is off as far as assistive technology is concerned.",
        components: ["voice-input", "accordion", "data-table"],
      },
      {
        id: "announce-streaming",
        rule: "Text arriving a token at a time is not announced a token at a time.",
        detail:
          "A live region on a streaming answer reads every fragment as it lands. The stream is not announced as it grows; what is announced is that it started and that it finished.",
        components: ["streaming-text", "conversation"],
      },
    ],
  },
  {
    id: "decoration",
    title: "Decoration",
    description: "The parts that carry no meaning, and must not pretend to.",
    rules: [
      {
        id: "decoration-hidden",
        rule: "An icon beside a word is decoration.",
        detail:
          "Icons are hidden from assistive technology, either directly or through the element wrapping them, so a button is announced as what it does rather than as a glyph and a word.",
        components: ["tool-call", "accordion", "file-upload"],
      },
      {
        id: "decoration-never-sole-carrier",
        rule: "A drawing never carries meaning the words do not.",
        detail:
          "Every backdrop, trace and field here is aria-hidden. That is only honest if nothing is said by the drawing alone, which is why the components that draw a state also write it: the trace is confirmation, and the words are the claim.",
        components: ["voice-input", "presence-field", "stream-glow"],
      },
      {
        id: "decoration-theme",
        rule: "A backdrop takes its colours from the theme it was installed into.",
        detail:
          "A scene that brings its own palette is a scene that looks wrong in half of the projects that install it. These read the theme's own custom properties, including when it changes under them.",
        components: ["shader-surface", "aurora-field", "connection-beam"],
      },
    ],
  },
  {
    id: "installing",
    title: "Installing",
    description:
      "Rules about being a registry rather than a repository, which are the ones nobody tests until an install is broken.",
    rules: [
      {
        id: "install-keyframes",
        rule: "A component that animates a keyframe by name ships that keyframe.",
        detail:
          "The failure is quiet: the component installs cleanly, renders correctly, and never animates, because the rule referred to a keyframe that only existed in the library it came from.",
        checked: "ships the keyframes a component animates by name",
      },
      {
        id: "install-site-too",
        rule: "This site defines them too.",
        detail:
          "An install carries keyframes through the registry, and the npm package ships them in its stylesheet, but these pages render the same components from source. For a while one of them animated a keyframe this site never defined, which is exactly the bug the rule above prevents for everybody else.",
        checked: "defines them for this site too, which renders from source",
      },
      {
        id: "install-declares",
        rule: "Every file an item ships declares what it imports.",
        detail:
          "A dependency imported by a fixture rather than the component is still a dependency of the install, and a package that is imported but not declared is an error in somebody else's project rather than this one.",
        checked: "declares everything it imports",
      },
      {
        id: "install-own-address",
        rule: "A dependency on a sibling names where it lives.",
        detail:
          "A registry dependency written as a bare name sends the CLI to shadcn's registry looking for a component only this one has. Seventeen components were uninstallable this way, and nothing here caught it, because a dependency that resolves to the wrong place still parses.",
        components: ["metaballs", "voice-input", "connection-beam"],
      },
      {
        id: "install-tested-by-installing",
        rule: "The registry is tested by installing it.",
        detail:
          "Both of the failures above were invisible to anything that only read the JSON. Every build installs a handful of items into a throwaway project and checks what lands: the files, the stylesheet, and whether the imports resolve.",
        checked: "registry installs cleanly",
      },
    ],
  },
] as const

/**
 * The rules numbered straight through, so a rule keeps its number wherever it
 * is cited. Derived once rather than counted during render.
 */
export const ruleNumbers: ReadonlyMap<string, string> = new Map(
  interfaceSections
    .flatMap((section) => section.rules)
    .map((rule, index) => [rule.id, String(index + 1).padStart(2, "0")])
)

/** Every component named as evidence, so nothing here cites something gone. */
export function citedComponents() {
  return [
    ...new Set(
      interfaceSections.flatMap((section) =>
        section.rules.flatMap((rule) => rule.components ?? [])
      )
    ),
  ]
}

export function ruleCount() {
  return interfaceSections.reduce(
    (total, section) => total + section.rules.length,
    0
  )
}

export function checkedCount() {
  return interfaceSections.reduce(
    (total, section) =>
      total + section.rules.filter((rule) => rule.checked).length,
    0
  )
}

export function componentFor(slug: string) {
  return componentDocs.find((entry) => entry.slug === slug)
}
