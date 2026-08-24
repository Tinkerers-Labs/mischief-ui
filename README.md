<p align="center">
  <a href="https://ui.tinkererslabs.com/" aria-label="Mischief website">
    <img src="./public/brand/mischief-mark.svg" width="88" height="88" alt="Mischief" />
  </a>
</p>

<h1 align="center">Mischief</h1>

<p align="center">Good interfaces deserve a little mischief.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/mischief-ui"><img alt="npm version" src="https://img.shields.io/npm/v/mischief-ui?style=flat&color=FB573B&labelColor=201711&label=npm" /></a>
  <a href="https://www.npmjs.com/package/mischief-ui"><img alt="npm downloads per month" src="https://img.shields.io/npm/dm/mischief-ui?style=flat&color=FB573B&labelColor=201711&label=downloads" /></a>
  <a href="https://ui.tinkererslabs.com/docs"><img alt="97 components" src="https://img.shields.io/badge/components-97-FB573B?style=flat&labelColor=201711" /></a>
  <a href="https://github.com/Tinkerers-Labs/mischief-ui/actions/workflows/ci.yml"><img alt="CI status" src="https://img.shields.io/github/actions/workflow/status/Tinkerers-Labs/mischief-ui/ci.yml?branch=main&style=flat&color=FB573B&labelColor=201711&label=CI" /></a>
  <a href="https://github.com/Tinkerers-Labs/mischief-ui/blob/main/LICENSE"><img alt="MIT license" src="https://img.shields.io/npm/l/mischief-ui?style=flat&color=FB573B&labelColor=201711&label=license" /></a>
</p>

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
npx shadcn@latest add Tinkerers-Labs/mischief-ui/magnetic-tabs
npx shadcn@latest add Tinkerers-Labs/mischief-ui/conversation
npx shadcn@latest add Tinkerers-Labs/mischief-ui/questionnaire
npx shadcn@latest add Tinkerers-Labs/mischief-ui/redaction
```

Every component is listed at [ui.tinkererslabs.com](https://ui.tinkererslabs.com/), and each page carries the command for it.

Use `pnpm dlx`, `yarn dlx`, or `bunx` if that is what your project uses. The shadcn CLI reads `components.json` and places the source in the configured UI directory.

Mischief is also available as [`mischief-ui`](https://www.npmjs.com/package/mischief-ui):

```bash
npm install mischief-ui
```

Import `mischief-ui/styles.css` in your Tailwind CSS entry file, then use a direct entry such as `mischief-ui/magnetic-tabs`. The root export remains available when one import path is more convenient. The registry remains the recommended path when you want to own and adapt the source.

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

### Scroll to Top Button

```tsx
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button"

export function LongPage() {
  return (
    <>
      <main>{/* Long page content */}</main>
      <ScrollToTopButton />
    </>
  )
}
```

Pass `containerRef` to target a scroll area instead of the page. The button appears after scrolling down and switches to immediate scrolling when reduced motion is preferred.

### Ask AI

```tsx
import { AskAi } from "@/components/ui/ask-ai"

const prompt =
  "Explain Acme using current sources. Cite claims and flag anything unverified."

export function AskAboutAcme() {
  return <AskAi subject="Acme" prompt={prompt} />
}
```

The default destinations are ChatGPT, Claude, Perplexity, and Grok. Pass `targets` to provide another set. The copy action keeps the same prompt available for any other assistant.

### File Upload

```tsx
import { FileUpload } from "@/components/ui/file-upload"

export function Attachments() {
  return <FileUpload accept="image/*,.pdf" maxFiles={5} />
}
```

The component validates file type, size, count, and duplicates before adding anything to its queue. Pass `uploadFile` to connect storage and enable progress, cancel, and retry behavior. Its return value is stored on the completed entry and passed to `onUploadComplete`. Use `value` and `onValueChange` when the queue belongs to application state.

Repeat file type, size, and authorization checks on the server. Browser validation is user feedback, not a security boundary.

### File Thumbnail

```tsx
import { FileThumbnail } from "@/components/ui/file-thumbnail"

export function Preview() {
  return <FileThumbnail file={file} className="w-32" />
}
```

Pass a browser image `File` to preview it directly, or use `previewImageUrl` for an image that already lives elsewhere. Loading and failed images have clear fallback states.

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

For reproducible GitHub installs, append a release tag or full commit SHA to the item address. Unpinned commands intentionally install the current version from `main`.

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
