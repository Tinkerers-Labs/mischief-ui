import path from "node:path"

import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "magnetic-tabs": "../../registry/default/magnetic-tabs/magnetic-tabs.tsx",
    "elastic-slider":
      "../../registry/default/elastic-slider/elastic-slider.tsx",
    "hold-button": "../../registry/default/hold-button/hold-button.tsx",
    "signature-footer":
      "../../registry/default/signature-footer/signature-footer.tsx",
    "impossible-checkbox":
      "../../registry/default/impossible-checkbox/impossible-checkbox.tsx",
    "floating-index":
      "../../registry/default/floating-index/floating-index.tsx",
    "shift-button": "../../registry/default/shift-button/shift-button.tsx",
    "image-gallery": "../../registry/default/image-gallery/image-gallery.tsx",
    "scroll-to-top-button":
      "../../registry/default/scroll-to-top-button/scroll-to-top-button.tsx",
    "ask-ai": "../../registry/default/ask-ai/ask-ai.tsx",
    "file-upload": "../../registry/default/file-upload/file-upload.tsx",
    "file-thumbnail":
      "../../registry/default/file-thumbnail/file-thumbnail.tsx",
    "streaming-text":
      "../../registry/default/streaming-text/streaming-text.tsx",
    "thinking-state":
      "../../registry/default/thinking-state/thinking-state.tsx",
    "tool-call": "../../registry/default/tool-call/tool-call.tsx",
    "agent-checklist":
      "../../registry/default/agent-checklist/agent-checklist.tsx",
    "inline-citations":
      "../../registry/default/inline-citations/inline-citations.tsx",
    "approval-card": "../../registry/default/approval-card/approval-card.tsx",
    "bounding-boxes":
      "../../registry/default/bounding-boxes/bounding-boxes.tsx",
    "page-navigator":
      "../../registry/default/page-navigator/page-navigator.tsx",
    "file-tree": "../../registry/default/file-tree/file-tree.tsx",
    "document-splits":
      "../../registry/default/document-splits/document-splits.tsx",
    "schema-builder":
      "../../registry/default/schema-builder/schema-builder.tsx",
    "signature-pad": "../../registry/default/signature-pad/signature-pad.tsx",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  esbuildOptions(options) {
    options.alias = {
      ...options.alias,
      "@": path.resolve(import.meta.dirname, "../.."),
    }
  },
  external: [
    "react",
    "react-dom",
    "@base-ui/react",
    "motion",
    "clsx",
    "lucide-react",
    "tailwind-merge",
  ],
})
