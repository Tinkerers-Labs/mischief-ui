import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { componentDocs } from "../lib/component-docs"
import registry from "../registry.json"
import { siteConfig } from "../site.config"

const ROOT = path.resolve(import.meta.dirname, "..")
const DEMOS = path.join(ROOT, "components/demos")

const examples = registry.items.filter(
  (item) => item.type === "registry:example"
)
const components = registry.items.filter(
  (item) => item.type !== "registry:example"
)

const demoFiles = readdirSync(DEMOS).filter((file) =>
  file.endsWith("-demo.tsx")
)

/** The demo files an example reaches for, transitively. */
function fixturesFor(entry: string, seen = new Set<string>()): string[] {
  const source = readFileSync(path.join(DEMOS, entry), "utf8")
  const found: string[] = []

  for (const [, specifier] of source.matchAll(
    /from "@\/components\/demos\/([^"]+)"/g
  )) {
    const file = [`${specifier}.tsx`, `${specifier}.ts`].find((candidate) =>
      existsSync(path.join(DEMOS, candidate))
    )
    if (!file || seen.has(file)) continue
    seen.add(file)
    found.push(file, ...fixturesFor(file, seen))
  }

  return found
}

describe("published examples", () => {
  it("covers every demo of a component", () => {
    const shouldPublish = demoFiles
      .map((file) => file.replace("-demo.tsx", ""))
      .filter((slug) => components.some((item) => item.name === slug))

    const published = examples.map((item) => item.name.replace(/-demo$/, ""))

    expect(published.sort()).toEqual(shouldPublish.sort())
  })

  /**
   * An example that imports a fixture and does not ship it installs a file
   * whose import resolves to nothing in the reader's project.
   */
  it.each(examples)("$name carries every fixture it reaches for", (example) => {
    const shipped = new Set(
      example.files!.map((file) => path.basename(file.path))
    )

    for (const fixture of fixturesFor(`${example.name}.tsx`)) {
      expect(
        shipped.has(fixture),
        `${example.name} is missing ${fixture}`
      ).toBe(true)
    }
  })

  it.each(examples)("$name has every file it points at", (example) => {
    expect(example.files?.length).toBeGreaterThan(0)
    for (const file of example.files!) {
      expect(existsSync(path.join(ROOT, file.path)), file.path).toBe(true)
    }
  })

  it.each(examples)(
    "$name installs the component it demonstrates",
    (example) => {
      const slug = example.name.replace(/-demo$/, "")
      expect(example.registryDependencies).toEqual([
        `${siteConfig.url}r/${slug}.json`,
      ])
    }
  )

  it.each(examples)("$name declares what it imports", (example) => {
    const source = example
      .files!.map((file) => readFileSync(path.join(ROOT, file.path), "utf8"))
      .join("\n")
    const declared = new Set(
      (example.dependencies ?? []).map((entry) =>
        entry.replace(/@[\^~>=<\d].*$/, "")
      )
    )

    const ambient = new Set([
      "react",
      "react-dom",
      "next",
      "clsx",
      "tailwind-merge",
    ])
    const missing = [
      ...new Set(
        [...source.matchAll(/(?:from\s+|import\()"([^"]+)"/g)]
          .map(([, specifier]) => specifier!)
          .filter((s) => !s.startsWith(".") && !s.startsWith("@/"))
          .map((s) => {
            const parts = s.split("/")
            return s.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]!
          })
      ),
    ].filter((pkg) => !declared.has(pkg) && !ambient.has(pkg))

    expect(missing).toEqual([])
  })

  it("names itself after the component, so the pair is obvious", () => {
    for (const example of examples) {
      expect(example.name).toMatch(/-demo$/)
      const slug = example.name.replace(/-demo$/, "")
      expect(
        components.some((item) => item.name === slug),
        `${example.name} has no component`
      ).toBe(true)
    }
  })

  it("carries a title and a description drawn from the component", () => {
    for (const example of examples) {
      const doc = componentDocs.find(
        (entry) => entry.slug === example.name.replace(/-demo$/, "")
      )
      expect(example.title).toBe(`${doc!.name} Demo`)
      expect(example.description).toContain(doc!.name)
    }
  })
})

describe("component categories", () => {
  it("gives every component at least one, since the sync cannot invent them", () => {
    for (const item of components) {
      const categories = (item as { categories?: string[] }).categories ?? []
      expect(
        categories.length,
        `${item.name} has no categories`
      ).toBeGreaterThan(0)
    }
  })
})

describe("component keyframes", () => {
  it("ships the keyframes a component animates by name", () => {
    for (const item of components) {
      const file = `registry/default/${item.name}/${item.name}.tsx`
      const source = readFileSync(path.join(ROOT, file), "utf8")
      const used = new Set(
        [...source.matchAll(/animate-\[(mischief-[a-z-]+)/g)].map(
          ([, name]) => name
        )
      )
      const shipped = new Set(
        Object.keys((item as { css?: Record<string, unknown> }).css ?? {})
          .map((key) => key.match(/^@keyframes\s+(\S+)/)?.[1])
          .filter(Boolean)
      )

      for (const name of used) {
        expect(
          shipped.has(name),
          `${item.name} animates ${name} but does not ship its @keyframes`
        ).toBe(true)
      }
    }
  })
})
