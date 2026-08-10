export const siteNavigation = [
  { href: "/docs/components/magnetic-tabs", label: "Components" },
  { href: "/docs", label: "Docs" },
  { href: "/brand", label: "Brand" },
] as const

export const externalLinks = [
  {
    id: "npm",
    href: "https://www.npmjs.com/package/mischief-ui",
    label: "npm",
    accessibleLabel: "Mischief on npm",
  },
  {
    id: "github",
    href: "https://github.com/Tinkerers-Labs/mischief-ui",
    label: "GitHub",
    accessibleLabel: "Mischief on GitHub",
  },
] as const

export type ExternalLinkId = (typeof externalLinks)[number]["id"]
