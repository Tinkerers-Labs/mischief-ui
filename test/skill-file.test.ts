import { describe, expect, it } from "vitest"

import { componentDocs, componentFamilies } from "../lib/component-docs"
import { skillMarkdown, skillReference } from "../lib/skill-file"
import registry from "../registry.json"

const skill = skillMarkdown()
const reference = skillReference()

describe("the skill an agent is given", () => {
  it("stays short enough to be worth loading every time", () => {
    // The guidance is 500 lines. A routing document should be far inside that,
    // and the moment it is not, something belongs in the reference instead.
    expect(skill.split("\n").length).toBeLessThan(120)
  })

  it("routes by family rather than listing the collection", () => {
    for (const family of componentFamilies) {
      expect(skill).toContain(family.name)
      expect(skill).toContain(`| ${family.components.length} |`)
    }

    // The catalog is what reference.md is for. Naming a handful here is how
    // the file fell eighty two components behind the last time.
    const named = componentDocs.filter((doc) =>
      skill.includes(`\`${doc.slug}\``)
    )
    expect(named.length).toBeLessThan(5)
  })

  it("says how many components there are, from the collection itself", () => {
    expect(skill).toContain(
      `${componentDocs.length} accessible React components`
    )
  })

  it("points at the catalog both ways round", () => {
    expect(skill).toContain("reference.md")
    expect(skill).toContain("skill-reference.md")
  })

  it("names every optional peer any component actually asks for", () => {
    const declared = new Set<string>()
    for (const item of registry.items) {
      for (const entry of item.dependencies ?? []) {
        declared.add(entry.replace(/@[\^~>=<\d].*$/, ""))
      }
    }

    for (const peer of declared) {
      expect(
        skill,
        `${peer} is installed by a component but never mentioned`
      ).toContain(`\`${peer}\``)
    }
  })
})

describe("the catalog the skill points at", () => {
  it.each(registry.items)("lists $name", (item) => {
    expect(reference).toContain(`\`${item.name}\``)
  })

  it("gives every component a line of its own", () => {
    const lines = reference.match(/^- `[a-z-]+`: /gm) ?? []
    expect(lines.length).toBe(componentDocs.length)
  })

  it("groups them under every family", () => {
    for (const family of componentFamilies) {
      expect(reference).toContain(`## ${family.name}`)
    }
  })
})
