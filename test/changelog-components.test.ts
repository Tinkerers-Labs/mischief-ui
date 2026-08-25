import { describe, expect, it } from "vitest"

import { newestComponent, releases } from "../lib/changelog"
import { componentDocs } from "../lib/component-docs"

const slugs = new Set<string>(componentDocs.map((entry) => entry.slug))

describe("what a release says it shipped", () => {
  it("names only components that exist", () => {
    for (const release of releases) {
      for (const slug of release.components ?? []) {
        expect(slugs.has(slug), `${release.version} names ${slug}`).toBe(true)
      }
    }
  })

  it("claims a component once, in the release that added it", () => {
    const seen = releases.flatMap((release) => release.components ?? [])
    expect(new Set(seen).size).toBe(seen.length)
  })

  it("gives the home page something real to point at", () => {
    // The badge said Data Table for three releases because it was typed in by
    // hand. It reads this now, so an empty answer is a broken badge.
    const newest = newestComponent()

    expect(newest).toBeDefined()
    expect(slugs.has(newest!.slug)).toBe(true)
    expect(newest!.version).toBe(releases[0]!.version)
  })
})
