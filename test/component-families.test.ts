import { describe, expect, it } from "vitest"

import sitemap from "../app/sitemap"
import {
  componentDocs,
  componentFamilies,
  familySlug,
  getComponentFamily,
} from "../lib/component-docs"
import { siteConfig } from "../site.config"

describe("component families", () => {
  it("gives every family a slug that survives a URL", () => {
    for (const family of componentFamilies) {
      expect(family.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      expect(familySlug(family.name)).toBe(family.slug)
    }
  })

  it("keeps the slugs distinct, so a page cannot shadow another", () => {
    const slugs = componentFamilies.map((family) => family.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("resolves each slug back to its family", () => {
    for (const family of componentFamilies) {
      expect(getComponentFamily(family.slug)?.name).toBe(family.name)
    }

    expect(getComponentFamily("not-a-family")).toBeUndefined()
  })

  it("files every component under exactly one family", () => {
    const filed = componentFamilies.flatMap((family) => family.components)

    expect(filed).toHaveLength(componentDocs.length)
    expect(new Set(filed.map((component) => component.slug)).size).toBe(
      componentDocs.length
    )
  })

  it("leaves no family empty, since each one is a page", () => {
    for (const family of componentFamilies) {
      expect(family.components.length).toBeGreaterThan(0)
      expect(family.description.length).toBeGreaterThan(0)
    }
  })
})

describe("the sitemap", () => {
  const urls = sitemap().map((entry) => entry.url)

  it("lists every family page", () => {
    for (const family of componentFamilies) {
      expect(urls).toContain(
        new URL(`docs/families/${family.slug}/`, siteConfig.url).toString()
      )
    }
  })

  it("still lists every component page", () => {
    for (const component of componentDocs) {
      expect(urls).toContain(
        new URL(`docs/components/${component.slug}/`, siteConfig.url).toString()
      )
    }
  })

  it("repeats no URL", () => {
    expect(new Set(urls).size).toBe(urls.length)
  })
})
