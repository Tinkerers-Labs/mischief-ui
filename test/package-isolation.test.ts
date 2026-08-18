import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import registry from "../registry.json"
import packageJson from "../packages/mischief-ui/package.json"

const DIST = path.resolve(import.meta.dirname, "../packages/mischief-ui/dist")

/** Available to every entry without being declared by a component. */
const AMBIENT = new Set(["react", "react-dom", "clsx", "tailwind-merge"])

const CHUNK = /from "(\.\/chunk-[A-Z0-9]+\.js)"/g
const EXTERNAL = /from "([^".][^"]*)"/g

function rootPackage(specifier: string) {
  const parts = specifier.split("/")
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]!
}

/** Every file an entry reaches, following relative chunk imports. */
function graphOf(entry: string) {
  const seen = new Set<string>()
  const queue = [entry]

  while (queue.length > 0) {
    const file = queue.pop()!
    if (seen.has(file) || !existsSync(path.join(DIST, file))) continue
    seen.add(file)

    const source = readFileSync(path.join(DIST, file), "utf8")
    for (const [, chunk] of source.matchAll(CHUNK)) {
      queue.push(chunk!.replace("./", ""))
    }
  }

  return seen
}

function externalsOf(entry: string) {
  const packages = new Set<string>()

  for (const file of graphOf(entry)) {
    const source = readFileSync(path.join(DIST, file), "utf8")
    for (const [, specifier] of source.matchAll(EXTERNAL)) {
      packages.add(rootPackage(specifier!))
    }
  }

  return packages
}

const optional = new Set(Object.keys(packageJson.peerDependenciesMeta))

/**
 * Slugs the barrel re-exports as values. Type-only re-exports are excluded:
 * they erase at build time, so they add nothing to what a root import needs.
 */
const barrelExports = new Set(
  [
    ...readFileSync(
      path.resolve(import.meta.dirname, "../packages/mischief-ui/src/index.ts"),
      "utf8"
    ).matchAll(/^export \{[^}]*\} from "[^"]*registry\/default\/([^/]+)\//gm),
  ].map(([, slug]) => slug!)
)

const built = existsSync(DIST)

const entries = registry.items
  .map((item) => ({
    name: item.name,
    declared: new Set(
      (item.dependencies ?? []).map((entry) =>
        entry.replace(/@[\^~>=<\d].*$/, "")
      )
    ),
  }))
  .filter((item) => existsSync(path.join(DIST, `${item.name}.js`)))

describe.skipIf(!built || entries.length === 0)(
  "published entry isolation",
  () => {
    it("has a built entry for every registry item", () => {
      expect(entries.length).toBe(registry.items.length)
    })

    it.each(entries)("$name pulls only what it declares", (item) => {
      const leaked = [...externalsOf(`${item.name}.js`)].filter(
        (pkg) => !item.declared.has(pkg) && !AMBIENT.has(pkg)
      )

      expect(leaked).toEqual([])
    })

    it("shares nothing between entries beyond the cn helper", () => {
      const counts = new Map<string, number>()

      for (const item of entries) {
        for (const file of graphOf(`${item.name}.js`)) {
          if (!file.startsWith("chunk-")) continue
          counts.set(file, (counts.get(file) ?? 0) + 1)
        }
      }

      const shared = [...counts].filter(([, count]) => count > 1)

      expect(shared).toHaveLength(1)
      expect(readFileSync(path.join(DIST, shared[0]![0]), "utf8")).toContain(
        "function cn("
      )
    })

    it("offers a root import that needs no optional peer", () => {
      // "." would be read as a property path, so compare keys directly.
      expect(Object.keys(packageJson.exports)).toContain(".")
      expect(
        [...externalsOf("index.js")].filter((pkg) => optional.has(pkg))
      ).toEqual([])
    })

    it("carries every peer-free component in the barrel, and no others", () => {
      const peerFree = entries
        .filter((item) =>
          [...externalsOf(`${item.name}.js`)].every((pkg) => !optional.has(pkg))
        )
        .map((item) => item.name)

      expect([...barrelExports].sort()).toEqual(peerFree.sort())
    })

    it("resolves only through exports", () => {
      expect(Object.keys(packageJson)).not.toContain("main")
      expect(Object.keys(packageJson)).not.toContain("module")
      expect(Object.keys(packageJson)).not.toContain("types")
    })

    it("exports a subpath for every registry item", () => {
      const missing = registry.items
        .map((item) => item.name)
        .filter((name) => !(`./${name}` in packageJson.exports))

      expect(missing).toEqual([])
    })

    it("leaves every optional peer absent from most entries", () => {
      for (const pkg of optional) {
        const users = entries.filter((item) =>
          externalsOf(`${item.name}.js`).has(pkg)
        )

        expect(users.length).toBeLessThan(entries.length)
      }
    })
  }
)

describe.skipIf(built)("published entry isolation", () => {
  it("is skipped until the package is built", () => {
    expect(readdirSync(path.resolve(import.meta.dirname, ".."))).toContain(
      "packages"
    )
  })
})
