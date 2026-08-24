import { readFileSync, readdirSync, writeFileSync } from "node:fs"
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
 * An example that reaches for another demo needs that demo's fixtures too, and
 * those are site furniture rather than anything worth installing. Those stay
 * unpublished until the fixtures are items of their own.
 */
function isSelfContained(source: string) {
  return !importsOf(source).some((s) => s.startsWith("@/components/demos/"))
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

const components = new Set(
  registry.items
    .filter((item: { type: string }) => item.type !== "registry:example")
    .map((item: { name: string }) => item.name)
)

const examples = []
let skipped = 0

for (const file of readdirSync(demoDir).sort()) {
  if (!file.endsWith("-demo.tsx")) continue

  const slug = file.replace("-demo.tsx", "")
  const doc = componentDocs.find((entry) => entry.slug === slug)
  if (!doc || !components.has(slug)) continue

  const source = readFileSync(path.join(demoDir, file), "utf8")
  if (!isSelfContained(source)) {
    skipped += 1
    continue
  }

  const packages = packagesOf(source).map((pkg) => versions.get(pkg) ?? pkg)
  const example: Record<string, unknown> = {
    name: `${slug}-demo`,
    type: "registry:example",
    title: `${doc.name} Demo`,
    description: `A worked example of ${doc.name}: ${doc.summary}`,
  }

  if (packages.length > 0) example.dependencies = packages
  example.files = [
    { path: `components/demos/${file}`, type: "registry:example" },
  ]
  // The component itself, by the address it is served from, so the example
  // installs the thing it demonstrates whichever way the reader came in.
  example.registryDependencies = [`${siteConfig.url}r/${slug}.json`]

  examples.push(example)
}

registry.items = [
  ...registry.items.filter(
    (item: { type: string }) => item.type !== "registry:example"
  ),
  ...examples,
]

writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`)
console.log(
  `examples: ${examples.length} published, ${skipped} held back for shared fixtures`
)
