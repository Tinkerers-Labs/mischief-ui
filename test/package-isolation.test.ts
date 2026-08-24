import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { componentDocs } from "../lib/component-docs"
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

const byName = new Map(registry.items.map((item) => [item.name, item]))

/**
 * Our own items are declared as absolute URLs, so the CLI knows to come back
 * here for them rather than looking in shadcn's registry. Reading one as a
 * name means taking the slug back off the end.
 */
function itemName(dependency: string) {
  return dependency.startsWith("http")
    ? (dependency.split("/").pop() ?? "").replace(/\.json$/, "")
    : dependency
}

/** Its own packages, plus those of the components it is built from. */
function declaredPackages(name: string, seen = new Set<string>()): string[] {
  const item = byName.get(name)
  if (!item || seen.has(name)) return []
  seen.add(name)

  return [
    ...(item.dependencies ?? []).map((entry) =>
      entry.replace(/@[\^~>=<\d].*$/, "")
    ),
    ...(item.registryDependencies ?? []).flatMap((dependency) =>
      declaredPackages(itemName(dependency), seen)
    ),
  ]
}

const entries = registry.items
  .map((item) => ({
    name: item.name,
    declared: new Set(declaredPackages(item.name)),
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

    it("shares code only with the components it declares", () => {
      // A block is allowed to be built from other components, but only ones it
      // names in registryDependencies. Anything else sharing a chunk is two
      // entries quietly reaching into each other.
      const reachedBy = new Map<string, Set<string>>()

      for (const item of entries) {
        for (const file of graphOf(`${item.name}.js`)) {
          if (!file.startsWith("chunk-")) continue
          reachedBy.set(file, (reachedBy.get(file) ?? new Set()).add(item.name))
        }
      }

      const declared = new Map(
        registry.items.map((item) => [
          item.name,
          (item.registryDependencies ?? [])
            .map(itemName)
            .filter((name) => name !== "utils"),
        ])
      )

      function dependsOn(
        name: string,
        target: string,
        seen = new Set<string>()
      ): boolean {
        if (seen.has(name)) return false
        seen.add(name)

        return (declared.get(name) ?? []).some(
          (dependency) =>
            dependency === target || dependsOn(dependency, target, seen)
        )
      }

      const undeclared = [...reachedBy]
        .filter(([, names]) => names.size > 1)
        .filter(
          ([file]) =>
            !readFileSync(path.join(DIST, file), "utf8").includes(
              "function cn("
            )
        )
        .filter(([, names]) => {
          const sharers = [...names]

          // One of them owns the chunk; every other must declare it.
          return !sharers.some((owner) =>
            sharers.every((name) => name === owner || dependsOn(name, owner))
          )
        })
        .map(([file, names]) => `${file}: ${[...names].join(", ")}`)

      expect(undeclared).toEqual([])
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

describe("what an install pulls", () => {
  const blocks = new Set(
    componentDocs.filter((doc) => doc.kind === "block").map((doc) => doc.slug)
  )

  /**
   * Machinery components sit on rather than interface they assemble. Both hold
   * behaviour that has to be identical everywhere and is expensive to get
   * wrong, so they are shared instead of copied into each component that needs
   * them. Nothing may join this set because it is merely reused.
   */
  const INFRASTRUCTURE = new Set(["utils", "render-surface"])

  it.each(registry.items)(
    "$name only reaches for other components if it is a block",
    (item) => {
      const parts = (item.registryDependencies ?? [])
        .map(itemName)
        .filter((name) => !INFRASTRUCTURE.has(name))

      // A component is one thing you install. Only a block, which is openly an
      // assembly, may pull others in behind it.
      if (parts.length > 0) expect(blocks).toContain(item.name)
    }
  )

  it("keeps infrastructure out of the interface it serves", () => {
    const surface = registry.items.find(
      (item) => item.name === "render-surface"
    )

    expect(surface?.registryDependencies ?? []).toEqual(["utils"])
  })

  /**
   * The whole reason the URLs are there. A bare name resolved against
   * shadcn's own registry and failed, which left every component that sits on
   * the render surface uninstallable by either route.
   */
  it("never names one of its own items without saying where it lives", () => {
    const own = new Set(registry.items.map((item) => item.name))
    const bare = registry.items.flatMap((item) =>
      (item.registryDependencies ?? [])
        .filter((dependency) => own.has(dependency))
        .map((dependency) => `${item.name} -> ${dependency}`)
    )

    expect(bare).toEqual([])
  })
})
