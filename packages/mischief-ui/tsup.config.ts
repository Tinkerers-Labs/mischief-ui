import path from "node:path"

import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    // The "." export: only the components that resolve with no optional peer
    // installed.
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
    "csv-viewer": "../../registry/default/csv-viewer/csv-viewer.tsx",
    "docx-viewer": "../../registry/default/docx-viewer/docx-viewer.tsx",
    "pdf-viewer": "../../registry/default/pdf-viewer/pdf-viewer.tsx",
    "markdown-blocks":
      "../../registry/default/markdown-blocks/markdown-blocks.tsx",
    conversation: "../../registry/default/conversation/conversation.tsx",
    message: "../../registry/default/message/message.tsx",
    "prompt-input": "../../registry/default/prompt-input/prompt-input.tsx",
    suggestions: "../../registry/default/suggestions/suggestions.tsx",
    "annotation-layer":
      "../../registry/default/annotation-layer/annotation-layer.tsx",
    redaction: "../../registry/default/redaction/redaction.tsx",
    questionnaire: "../../registry/default/questionnaire/questionnaire.tsx",
    "command-palette":
      "../../registry/default/command-palette/command-palette.tsx",
    "install-command":
      "../../registry/default/install-command/install-command.tsx",
    "copy-for-ai": "../../registry/default/copy-for-ai/copy-for-ai.tsx",
    "table-of-contents":
      "../../registry/default/table-of-contents/table-of-contents.tsx",
    "code-block": "../../registry/default/code-block/code-block.tsx",
    "diff-view": "../../registry/default/diff-view/diff-view.tsx",
    "terminal-output":
      "../../registry/default/terminal-output/terminal-output.tsx",
    "response-actions":
      "../../registry/default/response-actions/response-actions.tsx",
    "theme-toggle": "../../registry/default/theme-toggle/theme-toggle.tsx",
    accordion: "../../registry/default/accordion/accordion.tsx",
    "component-preview":
      "../../registry/default/component-preview/component-preview.tsx",
    kbd: "../../registry/default/kbd/kbd.tsx",
    "stop-generating":
      "../../registry/default/stop-generating/stop-generating.tsx",
    "token-meter": "../../registry/default/token-meter/token-meter.tsx",
    "model-picker": "../../registry/default/model-picker/model-picker.tsx",
    "source-card": "../../registry/default/source-card/source-card.tsx",
    "empty-state": "../../registry/default/empty-state/empty-state.tsx",
    "footer-columns":
      "../../registry/default/footer-columns/footer-columns.tsx",
    "footer-row": "../../registry/default/footer-row/footer-row.tsx",
    "footer-wordmark":
      "../../registry/default/footer-wordmark/footer-wordmark.tsx",
    "empty-row": "../../registry/default/empty-row/empty-row.tsx",
    "not-found": "../../registry/default/not-found/not-found.tsx",
    "image-grid": "../../registry/default/image-grid/image-grid.tsx",
    lightbox: "../../registry/default/lightbox/lightbox.tsx",
    spinner: "../../registry/default/spinner/spinner.tsx",
    skeleton: "../../registry/default/skeleton/skeleton.tsx",
    "status-pill": "../../registry/default/status-pill/status-pill.tsx",
    "copy-button": "../../registry/default/copy-button/copy-button.tsx",
    "secret-field": "../../registry/default/secret-field/secret-field.tsx",
    pagination: "../../registry/default/pagination/pagination.tsx",
    "side-panel": "../../registry/default/side-panel/side-panel.tsx",
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
    "papaparse",
    "mammoth",
    "pdfjs-dist",
    "react-markdown",
    "remark-gfm",
  ],
})
