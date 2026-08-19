import { readFile } from "node:fs/promises"
import path from "node:path"

const root = process.cwd()

/**
 * Both files are found by convention rather than being listed anywhere, so a
 * component cannot be added with its source quietly missing from its page.
 * `test/component-source.test.ts` holds the convention to that promise.
 */
export function componentSourcePath(slug: string) {
  return path.join("registry", "default", slug, `${slug}.tsx`)
}

export function demoSourcePath(slug: string) {
  return path.join("components", "demos", `${slug}-demo.tsx`)
}

async function read(relativePath: string) {
  return (await readFile(path.join(root, relativePath), "utf8")).trimEnd()
}

export function componentSource(slug: string) {
  return read(componentSourcePath(slug))
}

/** The code behind the live preview, with its site-only imports rewritten. */
export async function demoSource(slug: string) {
  const source = await read(demoSourcePath(slug))

  // Demos import from the repo's registry path, which means nothing in the
  // reader's project. Show the import they would actually write.
  return source.replace(
    /@\/registry\/default\/[^/]+\/([^"]+)/g,
    (_match, file: string) => `mischief-ui/${file}`
  )
}
