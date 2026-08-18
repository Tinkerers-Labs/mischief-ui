# Contributing

Thanks for taking the time to improve Mischief.

Read `DESIGN.md` first. It explains the product bar, visual language, writing style, accessibility requirements, and motion rules.

## Component bar

A component should solve a familiar interface problem, work across input methods, inherit shadcn theme tokens, and have a reason to exist beyond decoration.

Before opening a pull request:

1. Add or update a real example on the site.
2. Test the component with a keyboard and a pointer.
3. Test reduced motion.
4. Test at 375px and 1440px widths.
5. Run `pnpm check`.

Keep pull requests focused. Explain the user-facing reason for the change and include screenshots for visual changes.

## Dependencies

A component may only require what it actually uses. Someone installing Hold
Button must never be asked for a PDF parser.

- **Registry installs are already scoped.** Each item in `registry.json`
  declares its own `dependencies`, so `shadcn add pdf-viewer` installs the PDF
  packages and `shadcn add hold-button` does not.
- **The npm package scopes through optional peers.** Anything used by only
  some components goes in `peerDependencies` _and_ in
  `peerDependenciesMeta` as `{ "optional": true }`. Package managers then
  neither install it nor warn when it is missing. `react` and `react-dom` are
  the only required peers. `clsx`, `tailwind-merge`, and `lucide-react` stay
  ordinary dependencies because they are small and nearly universal here.
- **Subpath exports keep the code apart.** Every component is its own build
  entry, so `mischief-ui/hold-button` never reaches the code behind
  `mischief-ui/pdf-viewer`.

Two tests enforce this and both fail loudly on drift.
`test/registry-dependencies.test.ts` compares each component's real imports
against what it declares, in both directions, and rejects a required peer that
only some components use. `test/package-isolation.test.ts` walks the built
chunk graph for every entry and fails if an entry reaches a package it did not
declare.
