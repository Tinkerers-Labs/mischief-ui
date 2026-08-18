# mischief-ui

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

Then import a component from its direct entry:

```tsx
import { ElasticSlider } from "mischief-ui/elastic-slider"

export function Volume() {
  return <ElasticSlider label="Volume" defaultValue={68} />
}
```

The root export remains available when a single import path is more convenient:

```tsx
import { ElasticSlider, SignatureFooter } from "mischief-ui"
```

Direct entries keep each component independently loadable. Importing
`mischief-ui/signature-footer` also keeps that server-safe component out of a
client boundary.

File validation must be repeated on the server. The browser checks only help
people correct a selection before upload.

For full source ownership, install through the shadcn registry instead:

```bash
npx shadcn@latest add Tinkerers-Labs/mischief-ui/elastic-slider
```

See the live components and complete docs at https://ui.tinkererslabs.com/.
