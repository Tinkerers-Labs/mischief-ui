import { describe, expect, it } from "vitest"

import { componentDocs } from "../lib/component-docs"
import { directoryEntry } from "../lib/registry-directory"
import registry from "../registry.json"
import { siteConfig } from "../site.config"

const entry = directoryEntry()

/**
 * The rules shadcn's own validator applies, from
 * apps/v4/scripts/validate-registries.mts. Copied deliberately: a submission
 * that fails there is a round trip through someone else's review queue.
 */
describe("the shadcn directory entry", () => {
  it("uses an @-prefixed namespace", () => {
    expect(entry.name).toMatch(/^@[a-zA-Z0-9][a-zA-Z0-9-_]*$/)
  })

  it("has a homepage that parses as a URL", () => {
    expect(() => new URL(entry.homepage)).not.toThrow()
  })

  it("has a url carrying the {name} placeholder", () => {
    expect(entry.url).toContain("{name}")
  })

  it("has a description and a logo", () => {
    expect(entry.description.length).toBeGreaterThan(0)
    expect(entry.logo).toMatch(/^<svg[\s\S]*<\/svg>$/)
  })
})

describe("what the entry promises about us", () => {
  it("names the namespace the registry itself declares", () => {
    expect(registry.name).toBe(entry.name)
    expect(registry.name).toBe(siteConfig.registry.namespace)
  })

  it("resolves to a real item once {name} is substituted", () => {
    const slug = componentDocs[0]!.slug
    const resolved = entry.url.replace("{name}", slug)

    expect(resolved).toBe(`${siteConfig.url}r/${slug}.json`)
  })

  it("puts no number in a sentence it cannot come back and change", () => {
    // The entry is copied into shadcn's repository. A count there is right on
    // the day it is written and wrong afterwards: the first one said
    // ninety-four and was stale within a day.
    expect(entry.description).not.toMatch(/\d/)
  })

  it("draws the logo in the directory's colour, not ours", () => {
    expect(entry.logo).toContain("var(--foreground)")
    expect(entry.logo).not.toContain("#e5532d")
  })

  it("gives the logo an intrinsic size, so the listing can lay it out", () => {
    expect(entry.logo).toMatch(/<svg[^>]*width='\d+'/)
    expect(entry.logo).toMatch(/<svg[^>]*height='\d+'/)
  })

  it("keeps the logo on one line, as the directory stores it", () => {
    expect(entry.logo).not.toContain("\n")
    // Their file is JSON with double-quoted strings; the markup uses single.
    expect(entry.logo).not.toContain('"')
  })
})
