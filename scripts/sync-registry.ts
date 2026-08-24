import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import path from "node:path"

import { componentDocs } from "../lib/component-docs"
import { siteConfig } from "../site.config"

const root = process.cwd()
const demoDir = path.join(root, "components/demos")
const registryPath = path.join(root, "registry.json")

/** Shipped by the shared utils item rather than declared per example. */
const FROM_UTILS = new Set(["clsx", "tailwind-merge"])
const AMBIENT = new Set(["react", "react-dom", "next"])

const IMPORT = /(?:from\s+|import\s+|import\()"([^"]+)"/g

function importsOf(source: string) {
  return [...source.matchAll(IMPORT)].map(([, specifier]) => specifier!)
}

/**
 * Every demo file an example reaches for, and everything those reach for in
 * turn. A registry item may carry several files, so an example ships its own
 * fixtures rather than the collection publishing site furniture as components
 * nobody would want to install on purpose.
 */
function fixturesFor(entry: string, seen = new Set<string>()): string[] {
  const source = readFileSync(path.join(demoDir, entry), "utf8")
  const found: string[] = []

  for (const specifier of importsOf(source)) {
    if (!specifier.startsWith("@/components/demos/")) continue

    const base = specifier.replace("@/components/demos/", "")
    const file = [`${base}.tsx`, `${base}.ts`].find((candidate) =>
      existsSync(path.join(demoDir, candidate))
    )

    if (!file || seen.has(file)) continue
    seen.add(file)
    found.push(file, ...fixturesFor(file, seen))
  }

  return found
}

function packagesOf(source: string) {
  const found = new Set<string>()

  for (const specifier of importsOf(source)) {
    if (specifier.startsWith(".") || specifier.startsWith("@/")) continue
    const parts = specifier.split("/")
    const pkg = specifier.startsWith("@")
      ? parts.slice(0, 2).join("/")
      : parts[0]!
    if (!AMBIENT.has(pkg) && !FROM_UTILS.has(pkg)) found.add(pkg)
  }

  return [...found].sort()
}

const registry = JSON.parse(readFileSync(registryPath, "utf8"))

const installed: Record<string, string> = {
  ...(JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"))
    .dependencies ?? {}),
  ...(JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"))
    .devDependencies ?? {}),
}

const REGISTRY_IMPORT = /^@\/registry\/default\/([a-z-]+)\//

/**
 * What a component's entry can be read from its own source, rather than
 * remembered. The description and the categories stay written by hand: the
 * registry's descriptions are terser than the documentation's on purpose,
 * because one is read in a terminal and the other on a page.
 */
function componentEntry(doc: (typeof componentDocs)[number]) {
  const name = doc.slug
  // A component that is documented but not yet in the registry is new: seed it
  // from the documentation and let the derived fields fill in below.
  const item = published.get(name) ?? {
    name,
    description: doc.summary,
    categories: [],
  }

  const file = `registry/default/${name}/${name}.tsx`
  const source = readFileSync(path.join(root, file), "utf8")

  const packages = new Set<string>()
  const registryDeps = new Set<string>()

  for (const specifier of importsOf(source)) {
    if (specifier === "@/lib/utils") {
      registryDeps.add("utils")
      continue
    }

    const sibling = specifier.match(REGISTRY_IMPORT)
    if (sibling) {
      // Absolute, so the CLI comes back here rather than asking shadcn for a
      // component only this registry has.
      registryDeps.add(`${siteConfig.url}r/${sibling[1]}.json`)
      continue
    }

    if (specifier.startsWith(".") || specifier.startsWith("@/")) continue
    const parts = specifier.split("/")
    const pkg = specifier.startsWith("@")
      ? parts.slice(0, 2).join("/")
      : parts[0]!
    if (!AMBIENT.has(pkg) && !FROM_UTILS.has(pkg)) packages.add(pkg)
  }

  // Start from what is there, so anything written by hand survives: the
  // description, the categories, and the odd component that ships a keyframe.
  // Only the fields that can be read from the source are overwritten.
  const entry: Record<string, unknown> = { ...item }

  entry.type = doc.kind === "block" ? "registry:block" : "registry:ui"
  entry.title = doc.name
  entry.files = [{ path: file, type: entry.type }]

  if (packages.size > 0) {
    entry.dependencies = [...packages]
      .sort()
      .map((pkg) => (installed[pkg] ? `${pkg}@${installed[pkg]}` : pkg))
  } else {
    delete entry.dependencies
  }

  // utils first, then this registry's own, which reads the way the install does.
  entry.registryDependencies = [
    ...(registryDeps.has("utils") ? ["utils"] : []),
    ...[...registryDeps].filter((dep) => dep !== "utils").sort(),
  ]

  return order(entry)
}

/** One key order for every entry, so a new one is not shaped differently. */
const KEYS = [
  "name",
  "type",
  "title",
  "description",
  "dependencies",
  "files",
  "css",
  "categories",
  "registryDependencies",
]

function order(entry: Record<string, unknown>) {
  const ordered: Record<string, unknown> = {}

  for (const key of KEYS) {
    if (key in entry) ordered[key] = entry[key]
  }
  for (const key of Object.keys(entry)) {
    if (!(key in ordered)) ordered[key] = entry[key]
  }

  return ordered
}
const versions = new Map<string, string>(
  registry.items
    .filter((item: { type: string }) => item.type !== "registry:example")
    .flatMap((item: { dependencies?: string[] }) =>
      (item.dependencies ?? []).map((entry) => [
        entry.replace(/@[\^~>=<\d].*$/, ""),
        entry,
      ])
    )
)

const published = new Map<string, Record<string, unknown>>(
  registry.items
    .filter((item: { type: string }) => item.type !== "registry:example")
    .map((item: { name: string }) => [item.name, item])
)

const examples = []
for (const file of readdirSync(demoDir).sort()) {
  if (!file.endsWith("-demo.tsx")) continue

  const slug = file.replace("-demo.tsx", "")
  const doc = componentDocs.find((entry) => entry.slug === slug)
  if (!doc) continue

  const fixtures = fixturesFor(file)
  const sources = [file, ...fixtures].map((name) =>
    readFileSync(path.join(demoDir, name), "utf8")
  )

  // A fixture's own imports are the example's problem too, since they arrive
  // in the same install.
  const packages = [...new Set(sources.flatMap(packagesOf))]
    .sort()
    .map((pkg) => versions.get(pkg) ?? pkg)
  const example: Record<string, unknown> = {
    name: `${slug}-demo`,
    type: "registry:example",
    title: `${doc.name} Demo`,
    description: `A worked example of ${doc.name}: ${doc.summary}`,
  }

  if (packages.length > 0) example.dependencies = packages
  example.files = [file, ...fixtures].map((name) => ({
    path: `components/demos/${name}`,
    type: "registry:example",
  }))
  // The component itself, by the address it is served from, so the example
  // installs the thing it demonstrates whichever way the reader came in.
  example.registryDependencies = [`${siteConfig.url}r/${slug}.json`]

  examples.push(example)
}

registry.items = [...componentDocs.map(componentEntry), ...examples]

writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`)
const bundled = examples.filter(
  (example) => (example.files as unknown[]).length > 1
).length

console.log(
  `registry: ${registry.items.length - examples.length} components, ${examples.length} examples published, ${bundled} carrying their own fixtures`
)
