import { defaultPackageManager, runCommand } from "@/lib/package-commands"

const repositoryPath = "Tinkerers-Labs/mischief-ui"
const repositoryUrl = `https://github.com/${repositoryPath}`
const siteUrl = "https://ui.tinkererslabs.com/"
const siteName = "Mischief"
const packageName = "mischief-ui"
const packageUrl = `https://www.npmjs.com/package/${packageName}`
const skillName = "mischief-ui"
/** The registry namespace, as the shadcn directory requires it: @-prefixed. */
const registryNamespace = "@mischief"
const routes = {
  home: "/",
  docs: "/docs",
  components: "/#components",
  brand: "/brand",
  license: "/license",
  changelog: "/changelog",
  interfaces: "/interfaces",
  skill: "/skill.md",
} as const

const navigation = [
  { href: routes.components, label: "Components" },
  { href: routes.docs, label: "Docs" },
  { href: routes.interfaces, label: "Interfaces" },
] as const

export const siteConfig = {
  name: siteName,
  title: `${siteName} UI | Playful React Components for shadcn`,
  tagline: "Good interfaces deserve a little mischief.",
  description:
    "Open-source React components and blocks for shadcn projects, with playful interaction, accessible behavior, Tailwind CSS, and source you can own.",
  url: siteUrl,
  registry: {
    namespace: registryNamespace,
    /** What a consumer puts in components.json, and what the directory lists. */
    url: `${siteUrl}r/{name}.json`,
  },
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
  /** The rest of what we make, shown as a row across the foot of the site. */
  elsewhere: [
    { label: "Fetchbean", href: "https://fetchbean.com/" },
    { label: "Promptsmint", href: "https://promptsmint.com/" },
    { label: "AI Code Usage", href: "https://aicodeusage.com/" },
    { label: "aijobsdesk", href: "https://aijobsdesk.com/" },
    { label: "AidenGPT", href: "https://aidengpt.com/" },
    { label: "Tinkerers Labs", href: "https://tinkererslabs.com/" },
    { label: "amankumar.ai", href: "https://amankumar.ai/" },
  ],
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
    /** Every component page is also served as markdown at its own address. */
    path: (slug: string) => `/docs/components/${slug}.md`,
    index: "/llms.txt",
    full: "/llms-full.txt",
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
    { href: routes.changelog, label: "Changelog" },
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

/** The shorter form, for a project that has registered the namespace once. */
export function namespaceInstallArgs(slug: string) {
  return `shadcn@latest add ${siteConfig.registry.namespace}/${slug}`
}

export function namespaceInstallCommand(slug: string) {
  return runCommand(defaultPackageManager, namespaceInstallArgs(slug))
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
