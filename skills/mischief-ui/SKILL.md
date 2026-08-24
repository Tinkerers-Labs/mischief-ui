---
name: mischief-ui
description: Find, evaluate, and install playful React components from Mischief into shadcn projects. Use when a user asks for Mischief UI, wants a distinctive interaction instead of a generic primitive, names a Mischief component, or asks an agent to browse or add components from Tinkerers-Labs/mischief-ui.
---

# Mischief UI

94 accessible React components for shadcn projects, across 11 families. Add only the component that solves the request. Treat each one as owned source code that can be adapted to the project.

## Finding the right component

Start from the family, then read only what you need. Do not guess a component name: they are listed, with a line each, in the files below.

| Family | Components | What it covers |
| --- | --- | --- |
| Agent UI | 18 | The surface an assistant answers through: the thread, the composer, and everything it shows while it is working. |
| Code | 3 | Code an agent wrote, ran, or wants to change, and the controls to accept it. |
| Documents | 12 | Reading a file someone uploaded, marking it up, cutting it into pieces, and pulling structure out of it. |
| Files | 2 | Getting a file in, and showing what arrived. |
| Feedback | 6 | What the page says while it waits, and when there is nothing to show. |
| Controls | 13 | Familiar inputs with more feedback than usual, and none of it required to operate them. |
| Wayfinding | 5 | Knowing where you are in something long, and getting somewhere else quickly. |
| Docs | 5 | The furniture of a documentation site, taken out of this one. |
| Blocks | 11 | Larger pieces that compose several components into one part of a page. |
| Scenes | 16 | Backdrops and moments where the drawing is the job, each one taking its colours from the theme it was installed into. |
| Motion | 3 | Entrances and numbers that move, driven by arrival or by scrolling, and never by withholding the content. |

- **Browse the catalog:** `reference.md` beside this file, or `https://ui.tinkererslabs.com/skill-reference.md` if you were handed this over the network. Every component grouped by family, one line each. Read it when you do not already know the name you want.
- **One component in full:** `https://ui.tinkererslabs.com/docs/components/<component>.md` gives its whole documentation: install command, worked example, props, and accessibility behaviour. Read this before writing code against a component.
- **Everything at once:** `https://ui.tinkererslabs.com/llms-full.txt`. Large. Only worth it when comparing many components in one pass.

## Workflow

1. Read `components.json` and the project's package manager before choosing a command.
2. Narrow to a family above, then find the component in `reference.md`.
3. Read that component's markdown page before using it. The props and the accessibility notes are there, not here.
4. Install through the shadcn registry, so the source lands in the consumer's codebase:

   ```bash
   npx shadcn@latest add Tinkerers-Labs/mischief-ui/<component>
   ```

   Replace `npx` with the runner used by the project.

5. Review the installed diff. Preserve existing aliases, shadcn tokens, Tailwind conventions, and React Server Component boundaries.
6. Adapt copy and content to the product. Do not leave demo names or placeholder text in shipped UI.
7. Verify keyboard use, focus visibility, reduced motion, and the relevant responsive layout.

Use `npm install mischief-ui` only when the user specifically prefers package imports over owned source.

## Dependencies

Everything beyond React is an optional peer: `@base-ui/react`, `lucide-react`, `mammoth`, `motion`, `papaparse`, `pdfjs-dist`, `react-markdown`, `remark-gfm`, `three`. Install one only if the component you added lists it, which its documentation page states. Most components need nothing but React.

## Guardrails

- Keep the project's theme. Override documented CSS custom properties when a component needs a distinct art direction.
- Do not install several components as decoration or fill space with invented marketing copy.
- Do not remove native semantics or accessibility behavior to simplify an animation.
- Respect `prefers-reduced-motion` and avoid adding remote audio, images, or tracking.
