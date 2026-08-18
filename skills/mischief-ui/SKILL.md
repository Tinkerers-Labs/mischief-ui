---
name: mischief-ui
description: Find, evaluate, and install playful React components from Mischief into shadcn projects. Use when a user asks for Mischief UI, wants a distinctive interaction instead of a generic primitive, names a Mischief component, or asks an agent to browse or add components from Tinkerers-Labs/mischief-ui.
---

# Mischief UI

Add only the component that solves the request. Treat each component as owned source code that can be adapted to the project.

## Workflow

1. Read `components.json` and the project's package manager before choosing a command.
2. Match the request to the smallest suitable component in the catalog below.
3. Prefer the shadcn registry so the source lands in the consumer's codebase:

   ```bash
   npx shadcn@latest add Tinkerers-Labs/mischief-ui/<component>
   ```

   Replace `npx` with the runner used by the project.

4. Review the installed diff. Preserve existing aliases, shadcn tokens, Tailwind conventions, and React Server Component boundaries.
5. Adapt copy and content to the product. Do not leave demo names or placeholder text in shipped UI.
6. Verify keyboard use, focus visibility, reduced motion, and the relevant responsive layout.

Use `npm install mischief-ui` only when the user specifically prefers package imports over owned source. Base UI, Motion, and the document parsers are optional peers, so install one only if the component you added lists it.

## Catalog

- `magnetic-tabs`: Accessible tabs with a restrained pointer pull.
- `elastic-slider`: A keyboard-friendly slider with elastic end feedback.
- `hold-button`: Hold-to-confirm for consequential actions, with immediate keyboard activation.
- `signature-footer`: A complete footer composition with a large closing wordmark.
- `impossible-checkbox`: A bear that refuses to leave a checkbox on. Use only for demos, Easter eggs, and harmless preferences. Never use it for consent, safety, or required settings.
- `floating-index`: A compact page outline that tracks reading progress and the active section.
- `shift-button`: A call to action whose leading icon makes room for a directional cue.
- `image-gallery`: A responsive gallery block with grid and masonry layouts and an accessible lightbox.
- `scroll-to-top-button`: A floating shortcut that appears after someone moves down a long page or scroll container and takes them back to the top.
- `ask-ai`: A source-aware prompt handoff for ChatGPT, Claude, Perplexity, Grok, or a copied prompt.
- `file-upload`: A validated file picker and dropzone with a visible queue and optional upload progress, cancel, and retry handling.
- `file-thumbnail`: A compact image preview with automatic browser File support, loading, and failure states.

## Guardrails

- Keep the project's theme. Override documented CSS custom properties when a component needs a distinct art direction.
- Do not install several components as decoration or fill space with invented marketing copy.
- Do not remove native semantics or accessibility behavior to simplify an animation.
- Respect `prefers-reduced-motion` and avoid adding remote audio, images, or tracking.
- Read component documentation at `https://ui.tinkererslabs.com/docs/components/<component>` when API details are needed.
