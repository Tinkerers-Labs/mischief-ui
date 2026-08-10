import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  banner: { js: '"use client";' },
  dts: true,
  clean: true,
  sourcemap: true,
  external: ["react", "react-dom", "@base-ui/react", "motion"],
  noExternal: ["clsx", "tailwind-merge"],
})
