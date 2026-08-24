import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { componentDocs } from "../lib/component-docs"
import {
  checkedCount,
  citedComponents,
  interfaceSections,
} from "../lib/interface-rules"

const ROOT = path.resolve(import.meta.dirname, "..")
const REGISTRY = path.join(ROOT, "registry/default")

/** Every component's own source, by slug. */
const sources = readdirSync(REGISTRY)
  .map((slug) => {
    const file = path.join(REGISTRY, slug, `${slug}.tsx`)
    try {
      return [slug, readFileSync(file, "utf8")] as const
    } catch {
      return null
    }
  })
  .filter((entry): entry is readonly [string, string] => entry !== null)

/**
 * The rules the page claims are enforced. Each of these is the enforcement,
 * so a rule cannot quietly become an aspiration.
 */
describe("the rules this collection keeps", () => {
  it("every animating component handles reduced motion", () => {
    const unguarded = sources
      .filter(([, source]) =>
        /\b(animate-|transition-|animation:)/.test(source)
      )
      .filter(
        ([, source]) =>
          !/motion-(reduce|safe)|prefers-reduced-motion/.test(source)
      )
      .map(([slug]) => slug)

    expect(unguarded).toEqual([])
  })

  it("no component styles bare focus", () => {
    // focus-visible: and focus-within: are the two that are fine; a bare
    // focus: utility puts a ring on anything somebody clicked.
    const offenders = sources
      .flatMap(([slug, source]) =>
        [...source.matchAll(/(?<![\w-])focus:[a-z0-9:[\]/-]+/g)].map(
          ([match]) => `${slug}: ${match}`
        )
      )
      .filter(Boolean)

    expect(offenders).toEqual([])
  })
})

describe("the interfaces page", () => {
  it("cites only components that exist", () => {
    const slugs = new Set<string>(componentDocs.map((entry) => entry.slug))

    for (const cited of citedComponents()) {
      expect(slugs.has(cited), `${cited} is cited but not shipped`).toBe(true)
    }
  })

  it("gives every rule a statement and a reason", () => {
    for (const section of interfaceSections) {
      expect(section.rules.length).toBeGreaterThan(0)

      for (const rule of section.rules) {
        expect(rule.rule.length).toBeGreaterThan(0)
        expect(rule.detail.length).toBeGreaterThan(0)
        // A rule is either enforced or demonstrated. An unsupported one is an
        // opinion, and this page does not carry those.
        expect(
          Boolean(rule.checked) || (rule.components?.length ?? 0) > 0,
          `${rule.id} has neither a check nor a component behind it`
        ).toBe(true)
      }
    }
  })

  it("keeps every id distinct, since they are anchors", () => {
    const ids = interfaceSections.flatMap((section) => [
      section.id,
      ...section.rules.map((rule) => rule.id),
    ])

    expect(new Set(ids).size).toBe(ids.length)
  })

  it("only claims a check that something actually runs", () => {
    // The page says these are enforced. This is what makes that true: the
    // named test or build step has to exist somewhere in the repository.
    const haystack = [
      ...readdirSync(path.join(ROOT, "test")).map((file) =>
        readFileSync(path.join(ROOT, "test", file), "utf8")
      ),
      ...readdirSync(path.join(ROOT, "scripts")).map((file) =>
        readFileSync(path.join(ROOT, "scripts", file), "utf8")
      ),
    ].join("\n")

    const claimed = interfaceSections.flatMap((section) =>
      section.rules.map((rule) => rule.checked).filter(Boolean)
    )

    expect(claimed.length).toBe(checkedCount())

    for (const check of claimed) {
      expect(
        haystack.includes(check!),
        `the page claims "${check}" is checked, but nothing by that name runs`
      ).toBe(true)
    }
  })
})
