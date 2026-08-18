import { defaultPackageManager, runCommand } from "@/lib/package-commands"

const repositoryPath = "Tinkerers-Labs/mischief-ui"
const repositoryUrl = `https://github.com/${repositoryPath}`
const siteUrl = "https://ui.tinkererslabs.com/"
const siteName = "Mischief"
const packageName = "mischief-ui"
const packageUrl = `https://www.npmjs.com/package/${packageName}`
const skillName = "mischief-ui"
const routes = {
  home: "/",
  docs: "/docs",
  components: "/#components",
  brand: "/brand",
  license: "/license",
  skill: "/skill.md",
} as const

const navigation = [
  { href: routes.components, label: "Components" },
  { href: routes.docs, label: "Docs" },
] as const

export const siteConfig = {
  name: siteName,
  title: `${siteName} UI | Playful React Components for shadcn`,
  tagline: "Good interfaces deserve a little mischief.",
  description:
    "Open-source React components and blocks for shadcn projects, with playful interaction, accessible behavior, Tailwind CSS, and source you can own.",
  url: siteUrl,
  routes,
  assets: {
    socialPreview: "/brand/mischief-social-preview.png",
  },
  analytics: {
    googleMeasurementId: "G-PSFZX72FZ4",
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
    installArgs: packageName,
  },
  markdown: {
    /** Every component page is also served as markdown at this address. */
    path: (slug: string) => `/md/${slug}.md`,
  },
  skill: {
    name: skillName,
    url: `${siteUrl}skill.md`,
    prompt: `Read ${siteUrl}skill.md and follow its instructions.`,
    installCommand: `npx skills add ${repositoryPath} --skill ${skillName}`,
  },
  navigation,
  footerNavigation: [
    ...navigation,
    { href: routes.brand, label: "Brand" },
    { href: routes.license, label: "License" },
  ],
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

/** Arguments for the shadcn CLI, without a package runner in front. */
export function registryInstallArgs(slug: string) {
  return `shadcn@latest add ${siteConfig.repository.path}/${slug}`
}

export function registryInstallCommand(slug: string) {
  return runCommand(defaultPackageManager, registryInstallArgs(slug))
}

export function packageImport(exportName: string, slug: string) {
  return `import { ${exportName} } from "${siteConfig.package.name}/${slug}"`
}

export function componentSourceUrl(slug: string) {
  return `${siteConfig.repository.url}/blob/main/registry/default/${slug}/${slug}.tsx`
}
