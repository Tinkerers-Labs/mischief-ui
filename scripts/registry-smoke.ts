import { execFileSync } from "node:child_process"
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

import { siteConfig } from "@/site.config"

/**
 * Installs a few items the way somebody else would, into a throwaway project.
 *
 * The registry is only correct if the CLI can resolve it, and the things that
 * have broken were invisible to a dry run: a dependency written in a form that
 * sent the CLI to shadcn's registry instead of ours, and a component whose
 * keyframes stopped being published, which installs cleanly and simply never
 * animates. Both need files on disk to catch.
 *
 * The published items point at absolute URLs, so a copy of the built registry
 * is rewritten to reach the sibling files instead. That keeps this offline and
 * pointed at the build in hand rather than at whatever is currently deployed.
 */
const root = process.cwd()
const built = path.join(root, "public/r")

type Expectation = {
  item: string
  files: string[]
  css?: string
}

/** One of each shape that has broken before, or could. */
const CASES: Expectation[] = [
  {
    // Reaches a sibling component through registryDependencies.
    item: "metaballs",
    files: [
      "components/ui/metaballs.tsx",
      "components/ui/render-surface.tsx",
      "lib/utils.ts",
    ],
  },
  {
    // Publishes keyframes that have to land in the consumer's stylesheet.
    item: "file-thumbnail",
    files: ["components/ui/file-thumbnail.tsx"],
    css: "mischief-file-thumbnail-shimmer",
  },
  {
    // An example that carries fixtures, plus the component it demonstrates.
    item: "agent-checklist-demo",
    files: [
      "components/demos/agent-checklist-demo.tsx",
      "components/demos/demo-variants.tsx",
      "components/demos/restart-button.tsx",
      "components/demos/use-scripted-timeline.ts",
      "components/ui/agent-checklist.tsx",
    ],
  },
]

function fail(message: string): never {
  console.error(`✖ ${message}`)
  process.exit(1)
}

/** The built registry, with our public URLs pointed at the copy on disk. */
function localRegistry(dir: string) {
  const prefix = `${siteConfig.url}r/`

  for (const file of readdirSync(built).filter((name) =>
    name.endsWith(".json")
  )) {
    const source = readFileSync(path.join(built, file), "utf8")
    writeFileSync(
      path.join(dir, file),
      source
        .replaceAll(prefix, `${dir}${path.sep}`)
        .replaceAll(".json.json", ".json")
    )
  }
}

function scaffold(dir: string) {
  mkdirSync(path.join(dir, "src/app"), { recursive: true })
  writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({ name: "smoke", private: true }, null, 2)
  )
  writeFileSync(
    path.join(dir, "tsconfig.json"),
    JSON.stringify(
      { compilerOptions: { baseUrl: ".", paths: { "@/*": ["./src/*"] } } },
      null,
      2
    )
  )
  writeFileSync(
    path.join(dir, "src/app/globals.css"),
    '@import "tailwindcss";\n'
  )
  writeFileSync(
    path.join(dir, "components.json"),
    JSON.stringify(
      {
        $schema: "https://ui.shadcn.com/schema.json",
        style: "new-york",
        rsc: true,
        tsx: true,
        tailwind: {
          config: "",
          css: "src/app/globals.css",
          baseColor: "neutral",
          cssVariables: true,
        },
        iconLibrary: "lucide",
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
          ui: "@/components/ui",
          lib: "@/lib",
          hooks: "@/hooks",
        },
      },
      null,
      2
    )
  )
}

/** Every `@/…` import the installed files make, checked against what landed. */
function unresolvedImports(dir: string) {
  const src = path.join(dir, "src")
  const broken: string[] = []

  const walk = (current: string): string[] =>
    readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) return walk(full)
      return /\.tsx?$/.test(entry.name) ? [full] : []
    })

  for (const file of walk(src)) {
    const source = readFileSync(file, "utf8")
    for (const [, specifier] of source.matchAll(/from "(@\/[^"]+)"/g)) {
      const target = path.join(src, specifier!.replace("@/", ""))
      if (!existsSync(`${target}.tsx`) && !existsSync(`${target}.ts`)) {
        broken.push(`${path.basename(file)} -> ${specifier}`)
      }
    }
  }

  return broken
}

function main() {
  if (!existsSync(built))
    fail("public/r is missing; run `pnpm registry:build` first")

  const dir = mkdtempSync(path.join(tmpdir(), "mischief-smoke-"))
  const registry = path.join(dir, "registry")
  const project = path.join(dir, "project")

  mkdirSync(registry)
  mkdirSync(project)
  localRegistry(registry)
  scaffold(project)

  for (const expectation of CASES) {
    const item = path.join(registry, `${expectation.item}.json`)
    if (!existsSync(item)) fail(`${expectation.item} was never published`)

    try {
      execFileSync("npx", ["shadcn", "add", item, "--yes", "--silent"], {
        cwd: project,
        stdio: "pipe",
      })
    } catch (error) {
      fail(`installing ${expectation.item} failed: ${(error as Error).message}`)
    }

    for (const file of expectation.files) {
      if (!existsSync(path.join(project, "src", file))) {
        fail(`${expectation.item} did not install ${file}`)
      }
    }

    if (expectation.css) {
      const css = readFileSync(
        path.join(project, "src/app/globals.css"),
        "utf8"
      )
      if (!css.includes(expectation.css)) {
        fail(
          `${expectation.item} did not add ${expectation.css} to the stylesheet`
        )
      }
    }

    console.log(
      `✔ ${expectation.item} (${expectation.files.length} files${expectation.css ? " + css" : ""})`
    )
  }

  const broken = unresolvedImports(project)
  if (broken.length > 0)
    fail(`imports that resolve to nothing:\n  ${broken.join("\n  ")}`)

  console.log("✔ every import in the installed files resolves")
  console.log("\n✅ registry installs cleanly.")
}

main()
