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

      expect(rows).toHaveLength(component.props.length)

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

  it("lists dependencies, or says there are none", () => {
    for (const { component, markdown } of documents) {
      if (component.dependencies.length === 0) {
        expect(markdown).toContain("None beyond React")
        continue
      }

      for (const dependency of component.dependencies) {
        expect(markdown).toContain(`- ${dependency}`)
      }
    }
  })
})
