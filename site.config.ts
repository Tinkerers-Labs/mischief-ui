const repositoryPath = "Tinkerers-Labs/mischief-ui"
const repositoryUrl = `https://github.com/${repositoryPath}`
const siteName = "Mischief"
const packageName = "mischief-ui"
const packageUrl = `https://www.npmjs.com/package/${packageName}`
const skillName = "mischief-ui"
const routes = {
  home: "/",
  docs: "/docs",
  components: "/docs/components/magnetic-tabs",
  brand: "/brand",
  license: "/license",
} as const

const navigation = [
  { href: routes.components, label: "Components" },
  { href: routes.docs, label: "Docs" },
  { href: routes.brand, label: "Brand" },
] as const

export const siteConfig = {
  name: siteName,
  title: `${siteName} | UI with personality`,
  tagline: "Good interfaces deserve a little mischief.",
  description:
    "Playful, production-ready React components that work with shadcn.",
  url: "https://ui.tinkererslabs.com/",
  routes,
  assets: {
    socialPreview: "/brand/mischief-social-preview.png",
  },
  organization: {
    name: "Tinkerers Labs",
    url: "https://tinkererslabs.com/",
  },
  author: {
    name: "Aman",
    url: "https://amankumar.ai/",
  },
  repository: {
    path: repositoryPath,
    url: repositoryUrl,
    issuesUrl: `${repositoryUrl}/issues`,
  },
  license: {
    name: "MIT",
    route: routes.license,
    sourceUrl: `${repositoryUrl}/blob/main/LICENSE`,
  },
  package: {
    name: packageName,
    url: packageUrl,
    installCommand: `pnpm add ${packageName} @base-ui/react motion`,
  },
  skill: {
    name: skillName,
    installCommand: `npx skills add ${repositoryPath} --skill ${skillName}`,
  },
  navigation,
  footerNavigation: [...navigation, { href: routes.license, label: "License" }],
  externalLinks: [
    {
      id: "npm",
      href: packageUrl,
      label: "npm",
      accessibleLabel: `${siteName} on npm`,
    },
    {
      id: "github",
      href: repositoryUrl,
      label: "GitHub",
      accessibleLabel: `${siteName} on GitHub`,
    },
  ],
} as const

export type ExternalLinkId = (typeof siteConfig.externalLinks)[number]["id"]

export function registryInstallCommand(slug: string) {
  return `pnpm dlx shadcn@latest add ${siteConfig.repository.path}/${slug}`
}

export function packageImport(exportName: string) {
  return `import { ${exportName} } from "${siteConfig.package.name}"`
}

export function componentSourceUrl(slug: string) {
  return `${siteConfig.repository.url}/blob/main/registry/default/${slug}/${slug}.tsx`
}
