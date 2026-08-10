<p align="center">
  <a href="https://ui.tinkererslabs.com/" aria-label="Mischief website">
    <img src="./public/brand/mischief-mark.svg" width="88" height="88" alt="Mischief" />
  </a>
</p>

<h1 align="center">Mischief</h1>

<p align="center">Good interfaces deserve a little mischief.</p>

Browse the live components and documentation at [ui.tinkererslabs.com](https://ui.tinkererslabs.com/).

Mischief is a small collection of playful, production-ready React components. The components use Base UI where behavior is complex, Tailwind CSS for styling, and shadcn theme tokens so they fit the project that receives them.

## Install

### Give Mischief to your agent

Install the catalog as an agent skill:

```bash
npx skills add Tinkerers-Labs/mischief-ui --skill mischief-ui
```

Then ask for what you need:

```text
Use $mischief-ui to add the impossible-checkbox component to this project.
```

### Add it yourself

Mischief is a public GitHub registry for shadcn CLI v4. Install a component directly from this repository:

```bash
pnpm dlx shadcn@latest add Tinkerers-Labs/mischief-ui/magnetic-tabs
pnpm dlx shadcn@latest add Tinkerers-Labs/mischief-ui/elastic-slider
pnpm dlx shadcn@latest add Tinkerers-Labs/mischief-ui/hold-button
pnpm dlx shadcn@latest add Tinkerers-Labs/mischief-ui/signature-footer
pnpm dlx shadcn@latest add Tinkerers-Labs/mischief-ui/impossible-checkbox
pnpm dlx shadcn@latest add Tinkerers-Labs/mischief-ui/floating-index
pnpm dlx shadcn@latest add Tinkerers-Labs/mischief-ui/shift-button
pnpm dlx shadcn@latest add Tinkerers-Labs/mischief-ui/image-gallery
```

Use `npm`, `yarn`, or `bun` if that is what your project uses. The shadcn CLI reads `components.json` and places the source in the configured UI directory.

Mischief is also available as [`mischief-ui`](https://www.npmjs.com/package/mischief-ui):

```bash
pnpm add mischief-ui @base-ui/react motion
```

Import `mischief-ui/styles.css` in your Tailwind CSS entry file, then import components from `mischief-ui`. The registry remains the recommended path when you want to own and adapt the source.

## Components

### Magnetic Tabs

```tsx
import { MagneticTabs } from "@/components/ui/magnetic-tabs"

const items = [
  { value: "overview", label: "Overview", content: <p>Ready to go.</p> },
  { value: "activity", label: "Activity", content: <p>No new activity.</p> },
]

export function Example() {
  return <MagneticTabs items={items} />
}
```

The component supports controlled and uncontrolled selection through `value`, `defaultValue`, and `onValueChange`.

### Elastic Slider

```tsx
import { ElasticSlider } from "@/components/ui/elastic-slider"

export function Example() {
  return <ElasticSlider label="Volume" defaultValue={68} name="volume" />
}
```

Use `value` and `onValueChange` for a controlled slider. `min`, `max`, `step`, `formatValue`, and `onValueCommitted` are available for common form needs.

### Hold Button

```tsx
import { HoldButton } from "@/components/ui/hold-button"

export function Example() {
  return (
    <HoldButton aria-label="Remove download" onComplete={removeDownload}>
      Hold to remove download
    </HoldButton>
  )
}
```

Pointer users hold for 900ms by default. Keyboard and assistive technology users activate the native button once. Set `duration` to change the hold time, with a minimum of 500ms.

### Signature Footer

```tsx
import { SignatureFooter } from "@/components/ui/signature-footer"

export function Footer() {
  return (
    <SignatureFooter
      heading="Make the ending memorable."
      navigation={<nav aria-label="Footer">...</nav>}
      brand={<a href="/">Northstar</a>}
      wordmark="Northstar"
    />
  )
}
```

Pass ordinary React nodes for the action, navigation, compact brand, and metadata. The footer owns the composition while your app owns its links and language.

### Impossible Checkbox

```tsx
import { ImpossibleCheckbox } from "@/components/ui/impossible-checkbox"

export function Demo() {
  return <ImpossibleCheckbox aria-label="Enable bear mode" />
}
```

The bear always turns it back off. Use it for demos and harmless jokes, never for consent or a setting someone needs to change.

### Floating Index

```tsx
import { FloatingIndex } from "@/components/ui/floating-index"

const items = [
  { id: "introduction", label: "Introduction" },
  { id: "details", label: "Details" },
  { id: "examples", label: "Examples" },
]

export function PageIndex() {
  return <FloatingIndex items={items} />
}
```

The index tracks page progress and the active section. Pass `containerRef` when the content scrolls inside an element instead of the page.

### Shift Button

```tsx
import { Apple } from "lucide-react"
import { ShiftButton } from "@/components/ui/shift-button"

export function DownloadButton() {
  return (
    <ShiftButton
      render={<a href="/download" />}
      leadingIcon={<Apple aria-hidden="true" />}
    >
      Download for Mac
    </ShiftButton>
  )
}
```

The component uses Base UI so the same interaction can remain a button or render as a real link.

## Blocks

### Image Gallery

```tsx
import { ImageGallery } from "@/components/ui/image-gallery"

const images = [
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
}
```

The lightbox traps focus, locks page scroll, restores focus on close, and supports Left Arrow, Right Arrow, and Escape.

## Compatibility

- React 18 and 19 through component dependencies
- Tailwind CSS 4
- shadcn CLI 4 and GitHub registries
- Base UI 1.7 or newer
- Next.js, Vite, React Router, TanStack Start, and other React projects supported by shadcn
- Light and dark themes through semantic shadcn tokens
- Left-to-right and right-to-left document direction through logical layout and Base UI behavior

## Local development

Use Node 24 or any supported Node release from 20.18.1 onward.

```bash
pnpm install
pnpm dev
```

Before committing:

```bash
pnpm check
```

The check formats, lints, type-checks, validates the registry build, and creates a production Next.js build.

## Design and contribution

Read [DESIGN.md](./DESIGN.md) before changing the interface or its copy. Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## License

MIT
