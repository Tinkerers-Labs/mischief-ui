# mischief-ui

Good interfaces deserve a little mischief.

Playful, production-ready React components and blocks built with Base UI, Motion, Tailwind CSS, and shadcn theme tokens. The package exports Magnetic Tabs, Elastic Slider, Hold Button, Signature Footer, Impossible Checkbox, Floating Index, Shift Button, and Image Gallery.

## Install from npm

```bash
pnpm add mischief-ui @base-ui/react motion
```

Import `mischief-ui/styles.css` once in your Tailwind CSS entry file so Tailwind can find the component classes:

```css
@import "tailwindcss";
@import "mischief-ui/styles.css";
```

Then import a component:

```tsx
import { ElasticSlider } from "mischief-ui"

export function Volume() {
  return <ElasticSlider label="Volume" defaultValue={68} />
}
```

The layout components use the same import path:

```tsx
import { SignatureFooter } from "mischief-ui"
```

For full source ownership, install through the shadcn registry instead:

```bash
pnpm dlx shadcn@latest add Tinkerers-Labs/mischief-ui/elastic-slider
```

See the live components and complete docs at https://ui.tinkererslabs.com/.
