# Mischief Design Language

> Playful, useful, and precise. Familiar controls should feel better without becoming harder to use.

## Product principles

Mischief is a small collection of production-ready React components for interfaces with personality.

Every component must meet the same bar:

1. It solves a familiar interface problem.
2. Its personality comes from behavior, timing, and detail, not decoration piled on top.
3. It remains clear with motion reduced or disabled.
4. It works with a keyboard, touch, pointer, and screen reader where applicable.
5. It uses the host application's shadcn theme tokens by default.
6. Its public API stays small enough to understand from one example.

The collection should feel edited. A component is included because it is useful and unusually well made, not because a category needs another entry.

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

Mischief uses warm paper, dark ink, and a sharp tomato accent. The shapes are sturdy, the typography is lively, and motion has a clear physical cause.

The website can have a distinct identity. Installed components must inherit the consumer's shadcn tokens unless an explicit color prop is part of the component API.

## Colors

### Website palette

| Token         | Value                         | Usage                                   |
| ------------- | ----------------------------- | --------------------------------------- |
| paper         | `oklch(0.975 0.012 84)`       | Page background                         |
| paper-raised  | `oklch(0.995 0.006 84)`       | Raised examples and menus               |
| ink           | `oklch(0.215 0.018 58)`       | Primary text and strong borders         |
| ink-muted     | `oklch(0.48 0.025 58)`        | Supporting text                         |
| tomato        | `oklch(0.675 0.205 32)`       | Links, active states, and focus accents |
| tomato-strong | `oklch(0.59 0.22 30)`         | Pressed states                          |
| leaf          | `oklch(0.78 0.16 128)`        | Small success details                   |
| line          | `oklch(0.215 0.018 58 / 16%)` | Rules and quiet borders                 |

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

The first collection is called Tactile Controls. It contains three familiar controls with clearer physical feedback:

### Magnetic Tabs

A tab list whose active surface follows selection and responds gently to pointer proximity. Keyboard selection is immediate. Reduced motion removes pointer attraction while preserving the active state.

### Elastic Slider

A value slider with a track that gives subtle visual feedback at its limits. It uses the shadcn slider as its accessible behavioral foundation and keeps the current value visible.

### Hold Button

A confirmation button for consequential actions. Holding fills a progress surface, releasing early cancels, and completing triggers the action once. It provides a standard click alternative for keyboard and assistive technology users.

## Content examples

Examples should resemble real product moments:

- Tabs: Overview, Activity, Settings
- Slider: Notification volume at 68 percent
- Hold button: Hold to remove download

Do not use fake analytics, invented companies, anonymous testimonials, or meaningless dashboard numbers.
