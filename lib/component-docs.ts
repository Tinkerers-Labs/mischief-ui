import { packageImport, registryInstallCommand } from "@/site.config"

export const componentDocs = [
  {
    slug: "magnetic-tabs",
    kind: "component",
    name: "Magnetic Tabs",
    number: "01",
    family: "Tactile controls",
    summary:
      "Familiar tabs with a gentle pull toward the pointer. Selection stays clear and keyboard navigation remains immediate.",
    dependencies: ["@base-ui/react", "motion", "clsx", "tailwind-merge"],
    install: registryInstallCommand("magnetic-tabs"),
    npmImport: packageImport("MagneticTabs"),
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
    number: "02",
    family: "Tactile controls",
    summary:
      "A precise slider with a small amount of give at either end. The current value stays visible and the control works without a pointer.",
    dependencies: ["@base-ui/react", "motion", "clsx", "tailwind-merge"],
    install: registryInstallCommand("elastic-slider"),
    npmImport: packageImport("ElasticSlider"),
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
    number: "03",
    family: "Tactile controls",
    summary:
      "A confirmation button for actions that deserve a second thought. Release early to cancel, or activate once with a keyboard.",
    dependencies: ["clsx", "tailwind-merge"],
    install: registryInstallCommand("hold-button"),
    npmImport: packageImport("HoldButton"),
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
    slug: "signature-footer",
    kind: "block",
    name: "Signature Footer",
    number: "04",
    family: "Layout",
    summary:
      "A complete closing section with room for the useful links first and one oversized wordmark at the end.",
    dependencies: ["clsx", "tailwind-merge"],
    install: registryInstallCommand("signature-footer"),
    npmImport: packageImport("SignatureFooter"),
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
    slug: "impossible-checkbox",
    kind: "component",
    name: "Impossible Checkbox",
    number: "05",
    family: "Playful extras",
    summary:
      "A checkbox with one stubborn rule: the bear will not let you leave it on. Best kept for demos, Easter eggs, and harmless preferences.",
    dependencies: ["motion", "clsx", "tailwind-merge"],
    install: registryInstallCommand("impossible-checkbox"),
    npmImport: packageImport("ImpossibleCheckbox"),
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
    number: "06",
    family: "Wayfinding",
    summary:
      "A compact outline for long pages. It keeps the active section and reading progress visible without becoming another permanent sidebar.",
    dependencies: ["motion", "lucide-react", "clsx", "tailwind-merge"],
    install: registryInstallCommand("floating-index"),
    npmImport: packageImport("FloatingIndex"),
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
    slug: "shift-button",
    kind: "component",
    name: "Shift Button",
    number: "07",
    family: "Actions",
    summary:
      "A call to action that trades its leading icon for a directional cue when someone approaches it.",
    dependencies: ["@base-ui/react", "lucide-react", "clsx", "tailwind-merge"],
    install: registryInstallCommand("shift-button"),
    npmImport: packageImport("ShiftButton"),
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
    slug: "image-gallery",
    kind: "block",
    name: "Image Gallery",
    number: "08",
    family: "Blocks",
    summary:
      "A responsive image collection with equal and masonry layouts, plus a lightbox that handles focus, keyboard navigation, and scroll locking.",
    dependencies: ["@base-ui/react", "lucide-react", "clsx", "tailwind-merge"],
    install: registryInstallCommand("image-gallery"),
    npmImport: packageImport("ImageGallery"),
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
    ],
    accessibility:
      "Every thumbnail is a named button. Base UI supplies the modal dialog, focus trap, scroll lock, Escape handling, and focus restoration. Left and Right Arrow move between images. Captions, position, and close controls remain available without hover.",
  },
] as const

export type ComponentSlug = (typeof componentDocs)[number]["slug"]

export function getComponentDoc(slug: string) {
  return componentDocs.find((component) => component.slug === slug)
}
