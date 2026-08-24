import { directoryEntry } from "../lib/registry-directory"

// Paste into apps/v4/registry/directory.json, in alphabetical order by name.
console.log(JSON.stringify(directoryEntry(), null, 2))
