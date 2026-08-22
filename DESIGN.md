# Mischief Design Language

> Playful, useful, and precise. Familiar controls should feel better without becoming harder to use.

## Product principles

Mischief is a small collection of production-ready React components for interfaces with personality.

Every component must meet the same bar:

1. It solves a familiar interface problem.
2. Its personality comes from behavior, timing, and detail. Where decoration is the job, it obeys the same physics: a clear cause, an honest resting state, and a still frame when motion is reduced.
3. It remains clear with motion reduced or disabled.
4. It works with a keyboard, touch, pointer, and screen reader where applicable.
5. It uses the host application's shadcn theme tokens by default.
6. Its public API stays small enough to understand from one example.

The collection should feel edited. A component is included because it is useful and unusually well made, not because a category needs another entry.

## Drawn components

Some components draw rather than arrange: a backdrop, a texture, a lit object. They meet the same bar, and two rules keep them from drifting away from the rest of the collection.

**Escalate rendering only when the tier below cannot do it.** CSS and SVG, then a two dimensional canvas, then a single shader, then a full renderer. A component that asks for a dependency the size of three has to show that geometry, lighting, or depth is the point of it and not a shortcut.

**A drawn component still reads its colors from the theme.** Baking a palette into a shader is what makes a library's components look like the library instead of like the application. Custom properties are resolved from the mounted element and read again when the theme changes, so the same component arrives dark in a dark application and light in a light one. `render-surface` supplies the helper that does this.

Decoration is never the only carrier of meaning. When a drawn moment says something, such as a burst on a completed payment, that sentence also reaches a reader who will not see it.

## Voice

Write like a thoughtful person showing another developer something useful.

- Prefer short, direct sentences.
- Say what a component does before describing how it looks.
- Use real interface examples instead of abstract product language.
- Avoid hype, filler, fake testimonials, and claims that cannot be demonstrated.
- Avoid words such as revolutionary, stunning, seamless, powerful, cutting-edge, and game-changing.
- Do not use em dashes.
- Humor is welcome when it adds warmth. Never let it obscure instructions.

### Examples

Good: "Choose a plan. You can change it later."

Bad: "Unlock limitless possibilities with our stunning pricing experience."

Good: "Hold for a moment to delete the file."

Bad: "Reimagine destructive actions through delightful interaction."

## Visual character

Mischief uses white paper, dark ink, and a sharp tomato accent. The shapes are sturdy, the typography is lively, and motion has a clear physical cause. Light mode should feel crisp rather than creamy. Dark mode uses warm brown-black surfaces instead of cool blue-gray ones.

The website can have a distinct identity. Installed components must inherit the consumer's shadcn tokens unless an explicit color prop is part of the component API.

## Brand mark

The Mischief mark is a crooked, single-line M with a small spark above its final stroke. It should feel hand-drawn at first glance and deliberate on closer inspection.

- Use the tomato mark on paper or the paper mark on ink.
- Keep clear space equal to the height of the spark on every side.
- Do not rotate, stretch, outline, or add effects to the mark.
- At sizes below 24px, use the mark without the word Mischief.
- Use the supplied SVG instead of redrawing the curve.

The bend connects the brand to the physical feedback in the components. The spark is the small surprise promised by the name. Neither element should be animated in routine navigation.

## Colors

### Website palette

| Token         | Value                         | Usage                                   |
| ------------- | ----------------------------- | --------------------------------------- |
| paper         | `oklch(1 0 0)`                | Page background                         |
| paper-raised  | `oklch(1 0 0)`                | Raised examples and menus               |
| ink           | `oklch(0.215 0.018 58)`       | Primary text and strong borders         |
| ink-muted     | `oklch(0.48 0.025 58)`        | Supporting text                         |
| tomato        | `oklch(0.675 0.205 32)`       | Links, active states, and focus accents |
| tomato-strong | `oklch(0.59 0.22 30)`         | Pressed states                          |
| leaf          | `oklch(0.78 0.16 128)`        | Small success details                   |
| line          | `oklch(0.215 0.018 58 / 16%)` | Rules and quiet borders                 |

Public brand references also show the sRGB hex equivalents: Paper `#FFFFFF`, Ink `#201711`, Tomato `#FB573B`, and Leaf `#99CA50`.

### Dark mode

| Token      | Value                       | Usage                                   |
| ---------- | --------------------------- | --------------------------------------- |
| background | `oklch(0.17 0.012 58)`      | Page background                         |
| surface    | `oklch(0.215 0.014 58)`     | Raised examples and menus               |
| text       | `oklch(0.94 0.01 84)`       | Primary text                            |
| text-muted | `oklch(0.72 0.016 76)`      | Supporting text                         |
| tomato     | `oklch(0.72 0.185 32)`      | Links, active states, and focus accents |
| line       | `oklch(0.94 0.01 84 / 15%)` | Rules and quiet borders                 |

Use the operating system preference on a first visit. A manual choice persists locally. The fixed header contains one icon button that clearly switches to the other mode. The branded site footer remains ink on paper in both modes so its closing gesture stays recognizable.

### Installed component tokens

Use shadcn semantic classes such as `background`, `foreground`, `primary`, `primary-foreground`, `muted`, `muted-foreground`, `border`, `ring`, and `destructive`.

Do not install a global Mischief theme with an individual component. A component should look at home in the project that receives it.

## Typography

### Website fonts

- Display: Bricolage Grotesque. Use for headings and short labels that carry personality.
- Body: Schibsted Grotesk. Use for prose, navigation, code explanations, and controls.
- Code: Geist Mono. Use for commands and source snippets.

### Scale

| Role    | Size                           | Weight | Line height | Letter spacing |
| ------- | ------------------------------ | ------ | ----------- | -------------- |
| Display | `clamp(3rem, 8vw, 7rem)`       | 650    | 0.92        | `-0.055em`     |
| H1      | `clamp(2.5rem, 5vw, 4.5rem)`   | 650    | 0.98        | `-0.04em`      |
| H2      | `clamp(1.75rem, 3vw, 2.75rem)` | 620    | 1.05        | `-0.025em`     |
| H3      | `1.25rem`                      | 620    | 1.2         | `-0.015em`     |
| Body    | `1rem`                         | 450    | 1.6         | `-0.005em`     |
| Small   | `0.875rem`                     | 480    | 1.5         | `0`            |
| Label   | `0.75rem`                      | 650    | 1.2         | `0.08em`       |

Use balanced wrapping for headings and pretty wrapping for prose. Do not center long text.

## Spacing

Use a 4px base unit.

| Token | Value     |
| ----- | --------- |
| 1     | `0.25rem` |
| 2     | `0.5rem`  |
| 3     | `0.75rem` |
| 4     | `1rem`    |
| 6     | `1.5rem`  |
| 8     | `2rem`    |
| 12    | `3rem`    |
| 16    | `4rem`    |
| 24    | `6rem`    |
| 32    | `8rem`    |

## Layout

- Maximum page width: `90rem`
- Reading width: `68ch`
- Example width: determined by the component, never stretched merely to fill space
- Minimum page gutter: `1rem` on small screens, `2rem` on medium screens, `3rem` on large screens
- Breakpoints follow Tailwind defaults
- Test at 375px, 768px, 1440px, and 1920px

Pages should alternate between open editorial space and dense, useful examples. Avoid a repeated grid of identical cards.

The homepage hero uses a compact 42/58 live split. The left column keeps the category-clear headline, explanation, one primary action, and quiet utility links together. The right column is an open, ruled stage containing one complete Magnetic Tabs interaction. It has no window chrome, selector, or decorative product shell. The whole interaction remains visible inside the first viewport on desktop and mobile. Agent support remains a small text link, not a competing panel.

The header keeps text navigation and external utilities as two clear groups. npm, GitHub, and theme controls sit directly beside one another with 44px targets and no visual gap. The header is 56px tall.

The homepage FAQ follows the component gallery and resolves practical questions before the footer. It uses a two-column editorial layout with native disclosure rows. Questions cover installation, ownership, compatibility, accessibility, licensing, blocks, and agent use without turning into sales copy.

Component documentation uses a stable left rail on wide screens and a horizontal component list on small screens. Detail pages keep the title compact, put the live preview first, and use small copy, previous, and next actions near the heading. A sticky in-page index appears on wide screens. Each page follows the same reading order: purpose, live preview, installation, usage, API, accessibility, dependencies, and source.

Documentation headings use a compact scale rather than the website display scale. Introduction titles stop at 4rem and component titles stop at 3.25rem. Desktop page actions use smaller visual surfaces with expanded 44px hit areas; mobile actions remain 44px tall.

The site footer is an ink-colored closing section used on every public page. It pairs one direct invitation with compact navigation and package links. Its attribution line credits Tinkerers Labs and Aman, then points to the source on GitHub. An oversized, low-contrast Mischief wordmark closes the page as a brand signature. It should feel like a useful final thought, not a sitemap dump.

The license page is a public editorial page rather than a dense legal portal. It summarizes MIT permissions and obligations in plain language, then shows the exact repository license text. It links from the docs sidebar and footer without adding another item to the compact header navigation.

## Radius, borders, and shadows

| Token        | Value                                                                       | Usage                         |
| ------------ | --------------------------------------------------------------------------- | ----------------------------- |
| radius-sm    | `0.5rem`                                                                    | Compact controls              |
| radius-md    | `0.75rem`                                                                   | Buttons and fields            |
| radius-lg    | `1.25rem`                                                                   | Examples and panels           |
| radius-round | `999px`                                                                     | Tracks, pills, and indicators |
| shadow-low   | `0 1px 0 oklch(0.215 0.018 58 / 8%), 0 8px 24px oklch(0.215 0.018 58 / 6%)` | Raised examples               |
| shadow-press | `0 1px 0 oklch(0.215 0.018 58 / 18%)`                                       | Pressed controls              |

Nested radii must remain concentric. Borders use alpha colors so they work across themes.

## Motion

Motion must explain state, preserve continuity, or provide tactile feedback.

- Hover and press feedback: 120 to 180ms
- Small state changes: 180 to 240ms
- User-initiated motion: no longer than 300ms
- Use springs for pointer-driven and interruptible movement
- Use ease-out for entrances and ease-in for exits
- Do not animate keyboard navigation
- Never animate every element at once
- Respect `prefers-reduced-motion`
- Keep deformation between 0.96 and 1.04 unless the component's purpose clearly calls for more

## Accessibility

- Meet WCAG 2.2 AA contrast for text and controls.
- Keep pointer targets at least 32px and touch targets at least 44px.
- Preserve visible focus using the host theme's ring token.
- Use semantic HTML before ARIA.
- Expose names, values, descriptions, and state changes to assistive technology.
- Do not rely on color or motion alone to communicate state.
- Every component example must be usable with a keyboard.

## Component family

The first collection is called Tactile Controls. It is a focused set of familiar controls with clearer physical feedback:

### Magnetic Tabs

A tab list whose active surface follows selection and responds gently to pointer proximity. Keyboard selection is immediate. Reduced motion removes pointer attraction while preserving the active state.

### Elastic Slider

A value slider with a track that gives subtle visual feedback at its limits. It uses the shadcn slider as its accessible behavioral foundation and keeps the current value visible.

### Hold Button

A confirmation button for consequential actions. Holding fills a progress surface, releasing early cancels, and completing triggers the action once. It provides a standard click alternative for keyboard and assistive technology users.

### Signature Footer

A complete closing section with practical content first and an oversized, low-contrast wordmark at the end. Content stays composable so projects can supply their own navigation, actions, brand lockup, and metadata.

### Impossible Checkbox

A novelty checkbox that a bear immediately switches off. It belongs in demos, Easter eggs, and other harmless moments, never in a form or setting where the person needs control. The component keeps native checkbox semantics, announces its refusal, and removes the swat animation when reduced motion is enabled.

### Floating Index

A compact floating outline for long pages and scroll containers. It shows reading progress at a glance, exposes the full section list on demand, and follows the active section without taking over the layout.

### Shift Button

A call to action whose leading icon steps aside for a directional cue. The label stays stable and readable. Reduced motion keeps the leading icon and text in place.

### Image Gallery

A reusable block for presenting a related image set. It supports equal and masonry layouts, then opens images in a modal lightbox with full keyboard and focus behavior.

### Scroll to Top Button

A floating way back on long pages and scroll areas. It appears only after someone has moved down, disappears again near the top, and uses immediate scrolling when reduced motion is preferred. Its default target is 48px and its placement can be overridden for contained scrollers.

### Ask AI

A compact handoff for products that want visitors to get an outside, source-aware explanation. The consumer supplies the subject and complete prompt. Default links open ChatGPT, Claude, Perplexity, or Grok with that prompt, while a copy action supports any other assistant. It must describe new-tab behavior, report clipboard success or failure, and never send someone away without an explicit choice.

### File Upload

A picker and dropzone that keeps file handling legible after the drop. It validates type, size, count, and duplicates before adding files to a visible queue. Upload transport stays with the consumer through an adapter that can report progress and honor cancellation. Retry and remove actions remain named and keyboard accessible. The file stack responds to dragging, while reduced motion keeps it still.

### File Thumbnail

A compact image preview for attachments, upload queues, and file lists. Browser image files preview themselves, while an existing image URL can be supplied directly. Loading and failed images remain recognizable. The small folded corner gives the empty state a physical detail without competing with real preview content.

## Content examples

Examples should resemble real product moments:

- Tabs: Overview, Activity, Settings
- Slider: Notification volume at 68 percent
- Hold button: Hold to remove download

Do not use fake analytics, invented companies, anonymous testimonials, or meaningless dashboard numbers.
