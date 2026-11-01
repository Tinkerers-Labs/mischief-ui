import { spawnSync } from "node:child_process"

const BATCH_SIZE = 20

if (process.env.SKIP_DTS === "1") process.exit(0)

const { default: config } = await import("../tsup.config.ts")
const names = Object.keys(config.entry)

for (let start = 0; start < names.length; start += BATCH_SIZE) {
  const batch = names.slice(start, start + BATCH_SIZE)
  console.log(`types ${start + 1}-${start + batch.length} of ${names.length}`)

  const result = spawnSync("tsup", {
    stdio: "inherit",
    env: {
      ...process.env,
      DTS_ENTRIES: batch.join(","),
      NODE_OPTIONS: "--max-old-space-size=8192",
    },
  })

  if (result.status !== 0) process.exit(result.status ?? 1)
}
