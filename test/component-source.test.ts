import { existsSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { componentDemos } from "../components/demos"
import { componentDocs } from "../lib/component-docs"
import {
  componentSource,
  componentSourcePath,
  demoSource,
  demoSourcePath,
} from "../lib/component-source"

const root = path.resolve(import.meta.dirname, "..")
const exists = (relativePath: string) =>
  existsSync(path.join(root, relativePath))

describe("component source", () => {
  it.each(componentDocs)("$name has a source file to show", (component) => {
    expect(exists(componentSourcePath(component.slug))).toBe(true)
  })

  it.each(componentDocs)("$name has a demo file to show", (component) => {
    expect(exists(demoSourcePath(component.slug))).toBe(true)
  })

  it.each(componentDocs)(
    "$name has a demo the docs can render",
    (component) => {
      expect(componentDemos[component.slug]).toBeDefined()
    }
  )

  it("reads the component itself, not a stub", async () => {
    const source = await componentSource("hold-button")

    expect(source).toContain("export")
    expect(source.length).toBeGreaterThan(400)
  })

  it("rewrites demo imports to the ones a reader would write", async () => {
    const source = await demoSource("hold-button")

    expect(source).not.toContain("@/registry/default/")
    expect(source).toContain('from "mischief-ui/hold-button"')
  })

  it("leaves a demo's own imports alone", async () => {
    const source = await demoSource("tool-call")

    expect(source).toContain("@/components/demos/")
  })
})
