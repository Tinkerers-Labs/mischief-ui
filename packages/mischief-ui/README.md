# mischief-ui

<p align="center">
  <a href="https://www.npmjs.com/package/mischief-ui"><img alt="npm version" src="https://img.shields.io/npm/v/mischief-ui?style=flat&color=FB573B&labelColor=201711&label=npm" /></a>
  <a href="https://www.npmjs.com/package/mischief-ui"><img alt="npm downloads per month" src="https://img.shields.io/npm/dm/mischief-ui?style=flat&color=FB573B&labelColor=201711&label=downloads" /></a>
  <a href="https://ui.tinkererslabs.com/docs"><img alt="38 components" src="https://img.shields.io/badge/components-62-FB573B?style=flat&labelColor=201711" /></a>
  <a href="https://github.com/Tinkerers-Labs/mischief-ui/actions/workflows/ci.yml"><img alt="CI status" src="https://img.shields.io/github/actions/workflow/status/Tinkerers-Labs/mischief-ui/ci.yml?branch=main&style=flat&color=FB573B&labelColor=201711&label=CI" /></a>
  <a href="https://github.com/Tinkerers-Labs/mischief-ui/blob/main/LICENSE"><img alt="MIT license" src="https://img.shields.io/npm/l/mischief-ui?style=flat&color=FB573B&labelColor=201711&label=license" /></a>
</p>

Good interfaces deserve a little mischief.

Playful, production-ready React components and blocks built with Base UI, Motion, Tailwind CSS, and shadcn theme tokens. Every component is a separate entry point, and anything heavier than React is an optional peer, so installing this package pulls none of them.

See the full list at https://ui.tinkererslabs.com.

## Install from npm

```bash
npm install mischief-ui
```

Import `mischief-ui/styles.css` once in your Tailwind CSS entry file so Tailwind can find the component classes:

```css
@import "tailwindcss";
@import "mischief-ui/styles.css";
```

Tailwind does not scan `node_modules`, so point it at this package or the
components arrive with none of their classes generated:

```css
@import "tailwindcss";
@source "../node_modules/mischief-ui";
```

Then import a component from its direct entry:

```tsx
import { ElasticSlider } from "mischief-ui/elastic-slider"

export function Volume() {
  return <ElasticSlider label="Volume" defaultValue={68} />
}
```

A root import also works, and tree-shakes to the same bytes:

```tsx
import { HoldButton } from "mischief-ui"
```

It carries the 54 components that resolve with nothing but React installed.
The other seven are reachable only through their own entry, because a barrel
holding them would drag in an optional peer and fail for everyone who had not
installed it: Magnetic Tabs, Elastic Slider, Shift Button, and Image Gallery
need Base UI, Impossible Checkbox and Floating Index need Motion, and Markdown
Blocks needs react-markdown. Reaching for one of those at the root is a
compile error naming the missing export, not a crash at run time.

Importing `mischief-ui/signature-footer` also keeps that server-safe component
out of a client boundary.

File validation must be repeated on the server. The browser checks only help
people correct a selection before upload.

For full source ownership, install through the shadcn registry instead:

```bash
npx shadcn@latest add Tinkerers-Labs/mischief-ui/elastic-slider
```

See the live components and complete docs at https://ui.tinkererslabs.com/.
