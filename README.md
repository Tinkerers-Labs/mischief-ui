# Mischief

Good interfaces deserve a little mischief.

Browse the live components and documentation at [ui.tinkererslabs.com](https://ui.tinkererslabs.com/).

Mischief is a small collection of playful, production-ready React components. The components use Base UI where behavior is complex, Tailwind CSS for styling, and shadcn theme tokens so they fit the project that receives them.

## Install

Mischief is a public GitHub registry for shadcn CLI v4. Install a component directly from this repository:

```bash
pnpm dlx shadcn@latest add Tinkerers-Labs/mischief-ui/magnetic-tabs
pnpm dlx shadcn@latest add Tinkerers-Labs/mischief-ui/elastic-slider
pnpm dlx shadcn@latest add Tinkerers-Labs/mischief-ui/hold-button
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
