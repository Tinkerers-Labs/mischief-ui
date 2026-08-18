import { readFileSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import registry from "../registry.json"
import packageJson from "../packages/mischief-ui/package.json"

const ROOT = path.resolve(import.meta.dirname, "..")

/** Peers every component may rely on without declaring them. */
const AMBIENT = new Set(["react", "react-dom"])

/** Shipped by the shared `utils` registry item, not by any component. */
const FROM_UTILS = new Set(["clsx", "tailwind-merge"])

const IMPORT = /(?:from|import)\s+"([^"]+)"/g

function bareImportsOf(file: string) {
  const source = readFileSync(path.join(ROOT, file), "utf8")
  const found = new Set<string>()

  for (const [, specifier] of source.matchAll(IMPORT)) {
    if (!specifier || specifier.startsWith(".") || specifier.startsWith("@/")) {
      continue
    }

    // "motion/react" and "node:path" both belong to their root package.
    const parts = specifier.split("/")
    const pkg = specifier.startsWith("@")
      ? parts.slice(0, 2).join("/")
      : parts[0]!

    found.add(pkg)
  }

  return found
}

const items = registry.items.map((item) => ({
  name: item.name,
  file: item.files[0]!.path,
  declared: new Set(
    (item.dependencies ?? []).map((entry) =>
      entry.replace(/@[\^~>=<\d].*$/, "")
    )
  ),
  registryDeps: new Set(item.registryDependencies ?? []),
}))

describe("registry dependency declarations", () => {
  it("covers every registry item", () => {
    expect(items.length).toBeGreaterThan(20)
  })

  it.each(items)("$name declares everything it imports", (item) => {
    const missing = [...bareImportsOf(item.file)].filter(
      (pkg) =>
        !item.declared.has(pkg) && !AMBIENT.has(pkg) && !FROM_UTILS.has(pkg)
    )

    expect(missing).toEqual([])
  })

  it.each(items)("$name imports everything it declares", (item) => {
    const imported = bareImportsOf(item.file)
    const unused = [...item.declared].filter((pkg) => !imported.has(pkg))

    expect(unused).toEqual([])
  })

  it.each(items)("$name depends on utils when it imports cn", (item) => {
    const source = readFileSync(path.join(ROOT, item.file), "utf8")

    if (!source.includes('from "@/lib/utils"')) return

    expect([...item.registryDeps]).toContain("utils")
  })

  it("never forces a package that only some components use", () => {
    const usage = new Map<string, number>()

    for (const item of items) {
      for (const pkg of item.declared) {
        usage.set(pkg, (usage.get(pkg) ?? 0) + 1)
      }
    }

    const required = Object.keys(packageJson.peerDependencies).filter(
      (pkg) => !(pkg in packageJson.peerDependenciesMeta) && !AMBIENT.has(pkg)
    )

    // A required peer must be one every component can be assumed to need.
    // Anything narrower belongs in peerDependenciesMeta as optional.
    const overreaching = required.filter(
      (pkg) => (usage.get(pkg) ?? 0) < items.length
    )

    expect(overreaching).toEqual([])
  })

  it("keeps every optional peer out of the auto-installed dependencies", () => {
    const optional = Object.keys(packageJson.peerDependenciesMeta)
    const auto = Object.keys(packageJson.dependencies)

    expect(optional.filter((pkg) => auto.includes(pkg))).toEqual([])
  })
})
