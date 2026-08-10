export const componentDocs = [
  {
    slug: "magnetic-tabs",
    name: "Magnetic Tabs",
    number: "01",
    family: "Tactile controls",
    summary:
      "Familiar tabs with a gentle pull toward the pointer. Selection stays clear and keyboard navigation remains immediate.",
    dependencies: ["@base-ui/react", "motion", "clsx", "tailwind-merge"],
    install:
      "pnpm dlx shadcn@latest add Tinkerers-Labs/mischief-ui/magnetic-tabs",
    npmImport: 'import { MagneticTabs } from "mischief-ui"',
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
    name: "Elastic Slider",
    number: "02",
    family: "Tactile controls",
    summary:
      "A precise slider with a small amount of give at either end. The current value stays visible and the control works without a pointer.",
    dependencies: ["@base-ui/react", "motion", "clsx", "tailwind-merge"],
    install:
      "pnpm dlx shadcn@latest add Tinkerers-Labs/mischief-ui/elastic-slider",
    npmImport: 'import { ElasticSlider } from "mischief-ui"',
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
    name: "Hold Button",
    number: "03",
    family: "Tactile controls",
    summary:
      "A confirmation button for actions that deserve a second thought. Release early to cancel, or activate once with a keyboard.",
    dependencies: ["clsx", "tailwind-merge"],
    install:
      "pnpm dlx shadcn@latest add Tinkerers-Labs/mischief-ui/hold-button",
    npmImport: 'import { HoldButton } from "mischief-ui"',
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
    name: "Signature Footer",
    number: "04",
    family: "Layout",
    summary:
      "A complete closing section with room for the useful links first and one oversized wordmark at the end.",
    dependencies: ["clsx", "tailwind-merge"],
    install:
      "pnpm dlx shadcn@latest add Tinkerers-Labs/mischief-ui/signature-footer",
    npmImport: 'import { SignatureFooter } from "mischief-ui"',
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
] as const

export type ComponentSlug = (typeof componentDocs)[number]["slug"]

export function getComponentDoc(slug: string) {
  return componentDocs.find((component) => component.slug === slug)
}
