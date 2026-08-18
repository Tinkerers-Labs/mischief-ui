/** npm leads because it is what most projects already have. */
export const packageManagers = ["npm", "pnpm", "yarn", "bun"] as const

export type PackageManager = (typeof packageManagers)[number]

export const defaultPackageManager: PackageManager = "npm"

const runners: Record<PackageManager, string> = {
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
}

const installers: Record<PackageManager, string> = {
  npm: "npm install",
  pnpm: "pnpm add",
  yarn: "yarn add",
  bun: "bun add",
}

/** Runs a package without adding it to the project, such as the shadcn CLI. */
export function runCommand(manager: PackageManager, args: string) {
  return `${runners[manager]} ${args}`
}

/** Adds a dependency to the project. */
export function addCommand(manager: PackageManager, packages: string) {
  return `${installers[manager]} ${packages}`
}
