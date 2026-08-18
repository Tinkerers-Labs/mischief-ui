import { copyFile, mkdir } from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"

// Copied at build time so the worker can never drift from the installed
// pdfjs-dist, which refuses to run against a mismatched version.
const require = createRequire(import.meta.url)
const source = require.resolve("pdfjs-dist/build/pdf.worker.min.mjs")
const target = path.resolve("public/demo/pdf.worker.min.mjs")

await mkdir(path.dirname(target), { recursive: true })
await copyFile(source, target)

console.log(`pdf worker -> ${path.relative(process.cwd(), target)}`)
