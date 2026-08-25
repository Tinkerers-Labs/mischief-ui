# Contributing

Thanks for taking the time to improve Mischief.

Read `DESIGN.md` first. It explains the product bar, visual language, writing style, accessibility requirements, and motion rules.

## Component bar

A component should solve a familiar interface problem, work across input methods, inherit shadcn theme tokens, and have a reason to exist beyond decoration.

Before opening a pull request:

1. Wire a real example into the site. See below for where it goes.
2. Test the component with a keyboard and a pointer.
3. Test reduced motion.
4. Test at 375px and 1440px widths.
5. Run `pnpm check`.

Keep pull requests focused. Explain the user-facing reason for the change and include screenshots for visual changes.

## Where a component gets wired

Six files, every one of them hand-edited:

1. `registry/default/<slug>/<slug>.tsx`, the component.
2. `lib/component-docs.ts`, its entry. `registry.json`, the docs page, the
   markdown under `public/docs`, and llms.txt are all generated from this, so
   it is the only place any of them is written.
3. `components/demos/<slug>-demo.tsx`, the example.
4. `components/demos/index.ts`, registering that demo under the component's
   slug. A demo nothing registers still compiles and still ships: it simply
   renders nowhere, because the page looks the component up by slug and draws
   nothing when it misses.
5. `packages/mischief-ui/tsup.config.ts`, a build entry.
6. `packages/mischief-ui/package.json`, the subpath export, plus the barrel in
   `src/index.ts` when the component needs no optional peer.

Anything the component exports belongs in that docs entry as well, secondary
components included, written as `prop (ExportName)` the way Inline Citations
documents `id (Citation)`.

`pnpm check` enforces all of it. Every link above has a test that reads the
tree and fails on a gap: a directory the registry does not ship, a documented
component with no registered demo, an export named nowhere in its own
documentation.

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
- **Blocks are composed; components are not.** A block -- Signature Footer,
  Image Gallery -- is openly an assembly, so it is built from components that
  are worth installing on their own: Image Grid drops Base UI entirely, and
  Footer Columns is useful without a wordmark. A component stays one file even
  when it is long, because `shadcn add file-upload` pulling two more items
  before anything renders is a worse trade than six hundred lines. Length is
  not a reason to split; ask instead whether the part would be installed by
  itself.
- **Subpath exports keep the code apart.** Every component is its own build
  entry, so `mischief-ui/hold-button` never reaches the code behind
  `mischief-ui/pdf-viewer`.
- **The declaration build needs headroom.** `package:build` raises the Node
  heap because the shared type graph across every entry outgrows the default
  limit. tsup runs the declaration pass in a worker thread, which inherits
  `NODE_OPTIONS`. Dropping the flag fails with `ERR_WORKER_OUT_OF_MEMORY`.
- **The root barrel holds only what installs with React alone.** A component
  that statically imports an optional peer stays out of `src/index.ts`, so a
  root import never fails on a package the reader chose not to install. Its
  types are still re-exported there, as `export type`, which erases at build
  time and gives the declaration build one shared graph.

Two tests enforce this and both fail loudly on drift.
`test/registry-dependencies.test.ts` compares each component's real imports
against what it declares, in both directions, and rejects a required peer that
only some components use. `test/package-isolation.test.ts` walks the built
chunk graph for every entry and fails if an entry reaches a package it did not
declare.
