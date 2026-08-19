import { readFileSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { componentDocs } from "../lib/component-docs"
import { componentMarkdown } from "../lib/component-markdown"

const documents = componentDocs.map((component) => ({
  name: component.name,
  component,
  markdown: componentMarkdown(component),
}))

describe("component markdown", () => {
  it("covers every component", () => {
    expect(documents).toHaveLength(componentDocs.length)
  })

  it.each(documents)(
    "$name opens with its name and summary",
    ({ component, markdown }) => {
      expect(markdown.startsWith(`# ${component.name}\n`)).toBe(true)
      expect(markdown).toContain(component.summary)
    }
  )

  it.each(documents)(
    "$name documents every prop",
    ({ component, markdown }) => {
      const rows = markdown
        .split("\n")
        .filter(
          (line) => line.startsWith("| `") && !line.startsWith("| `Prop`")
        )

      // Type tables use the same row format, so they count towards the total.
      const typeRows = component.types.reduce(
        (total, entry) => total + entry.rows.length,
        0
      )

      expect(rows).toHaveLength(component.props.length + typeRows)

      for (const [propName] of component.props) {
        expect(markdown).toContain(`| \`${propName}\` |`)
      }
    }
  )

  it.each(documents)(
    "$name carries the install and import lines",
    ({ component, markdown }) => {
      expect(markdown).toContain(
        `add Tinkerers-Labs/mischief-ui/${component.slug}`
      )
      expect(markdown).toContain(component.npmImport)
      expect(markdown).toContain(component.accessibility)
    }
  )

  it.each(documents)("$name leaks no placeholder values", ({ markdown }) => {
    expect(markdown).not.toContain("undefined")
    expect(markdown).not.toContain("[object Object]")
  })

  it("lists dependencies, and omits the section when there are none", () => {
    for (const { component, markdown } of documents) {
      if (component.dependencies.length === 0) {
        expect(markdown).not.toContain("## Dependencies")
        continue
      }

      expect(markdown).toContain("## Dependencies")
      for (const dependency of component.dependencies) {
        expect(markdown).toContain(`- ${dependency}`)
      }
    }
  })
})

describe("readme badges", () => {
  const readmes = ["README.md", "packages/mischief-ui/README.md"]

  it.each(readmes)("%s counts the components it ships", (file) => {
    const badge = readFileSync(
      path.resolve(import.meta.dirname, "..", file),
      "utf8"
    ).match(/badge\/components-(\d+)-/)

    expect(badge?.[1]).toBe(String(componentDocs.length))
  })
})

describe("guidance sections", () => {
  const withSections = componentDocs.filter(
    (component) => component.sections.length > 0
  )

  it("are carried by the components that need them", () => {
    expect(withSections.length).toBeGreaterThan(0)
  })

  it.each(withSections)("$name anchors each section once", (component) => {
    const ids = component.sections.map((section) => section.id)

    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z][a-z0-9-]*$/)
  })

  it.each(withSections)("$name says something in each", (component) => {
    for (const section of component.sections) {
      expect(section.title).not.toBe("")
      expect(section.blocks.length).toBeGreaterThan(0)

      for (const block of section.blocks) {
        if (block.kind === "text") expect(block.text.length).toBeGreaterThan(40)
        if (block.kind === "code") expect(block.code).toContain("\n")
        if (block.kind === "list") expect(block.items.length).toBeGreaterThan(1)
        if (block.kind === "table") {
          for (const row of block.rows) {
            expect(row).toHaveLength(block.headers.length)
          }
        }
      }
    }
  })

  it.each(withSections)("$name carries them into the markdown", (component) => {
    const markdown = componentMarkdown(component)

    for (const section of component.sections) {
      expect(markdown).toContain(`## ${section.title}`)
    }
    for (const entry of component.types) {
      expect(markdown).toContain(`### ${entry.name}`)
    }
  })
})
