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

/** A demo that reaches for another demo needs fixtures we do not publish. */
function selfContained(file: string) {
  const source = readFileSync(path.join(DEMOS, file), "utf8")
  return !source.includes('from "@/components/demos/')
}

describe("published examples", () => {
  it("covers every demo that stands on its own", () => {
    const shouldPublish = demoFiles
      .filter(selfContained)
      .map((file) => file.replace("-demo.tsx", ""))
      .filter((slug) => components.some((item) => item.name === slug))

    const published = examples.map((item) => item.name.replace(/-demo$/, ""))

    expect(published.sort()).toEqual(shouldPublish.sort())
  })

  it("publishes nothing that depends on another demo's fixtures", () => {
    for (const example of examples) {
      const file = `${example.name}.tsx`
      expect(
        selfContained(file),
        `${example.name} reaches for another demo`
      ).toBe(true)
    }
  })

  it.each(examples)("$name has the file it points at", (example) => {
    const file = example.files?.[0]?.path
    expect(file).toBeDefined()
    expect(existsSync(path.join(ROOT, file!))).toBe(true)
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
    const source = readFileSync(
      path.join(ROOT, example.files![0]!.path),
      "utf8"
    )
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
