import type { ComponentType } from "react"

import { AgentChecklistDemo } from "@/components/demos/agent-checklist-demo"
import { BoundingBoxesDemo } from "@/components/demos/bounding-boxes-demo"
import { CsvViewerDemo } from "@/components/demos/csv-viewer-demo"
import { DocxViewerDemo } from "@/components/demos/docx-viewer-demo"
import { MarkdownBlocksDemo } from "@/components/demos/markdown-blocks-demo"
import { PdfViewerDemo } from "@/components/demos/pdf-viewer-demo"
import { DocumentSplitsDemo } from "@/components/demos/document-splits-demo"
import { FileTreeDemo } from "@/components/demos/file-tree-demo"
import { PageNavigatorDemo } from "@/components/demos/page-navigator-demo"
import { SchemaBuilderDemo } from "@/components/demos/schema-builder-demo"
import { SignaturePadDemo } from "@/components/demos/signature-pad-demo"
import { AnnotationLayerDemo } from "@/components/demos/annotation-layer-demo"
import { ConversationDemo } from "@/components/demos/conversation-demo"
import { MessageDemo } from "@/components/demos/message-demo"
import { PromptInputDemo } from "@/components/demos/prompt-input-demo"
import { RedactionDemo } from "@/components/demos/redaction-demo"
import { SuggestionsDemo } from "@/components/demos/suggestions-demo"
import { ApprovalCardDemo } from "@/components/demos/approval-card-demo"
import { AskAiDemo } from "@/components/demos/ask-ai-demo"
import { ElasticSliderDemo } from "@/components/demos/elastic-slider-demo"
import { FileThumbnailDemo } from "@/components/demos/file-thumbnail-demo"
import { FileUploadDemo } from "@/components/demos/file-upload-demo"
import { FloatingIndexDemo } from "@/components/demos/floating-index-demo"
import { HoldButtonDemo } from "@/components/demos/hold-button-demo"
import { ImageGalleryDemo } from "@/components/demos/image-gallery-demo"
import { ImpossibleCheckboxDemo } from "@/components/demos/impossible-checkbox-demo"
import { InlineCitationsDemo } from "@/components/demos/inline-citations-demo"
import { MagneticTabsDemo } from "@/components/demos/magnetic-tabs-demo"
import { ScrollToTopDemo } from "@/components/demos/scroll-to-top-demo"
import { ShiftButtonDemo } from "@/components/demos/shift-button-demo"
import { SignatureFooterDemo } from "@/components/demos/signature-footer-demo"
import { StreamingTextDemo } from "@/components/demos/streaming-text-demo"
import { ThinkingStateDemo } from "@/components/demos/thinking-state-demo"
import { ToolCallDemo } from "@/components/demos/tool-call-demo"

export type ComponentDemo = {
  Demo: ComponentType
  frameClassName?: string
}

export const componentDemos: Record<string, ComponentDemo> = {
  "magnetic-tabs": { Demo: MagneticTabsDemo },
  "elastic-slider": { Demo: ElasticSliderDemo },
  "hold-button": { Demo: HoldButtonDemo },
  "shift-button": { Demo: ShiftButtonDemo },
  "impossible-checkbox": { Demo: ImpossibleCheckboxDemo },
  "floating-index": { Demo: FloatingIndexDemo },
  "scroll-to-top-button": { Demo: ScrollToTopDemo },
  "file-upload": { Demo: FileUploadDemo, frameClassName: "p-4 md:p-8" },
  "file-thumbnail": { Demo: FileThumbnailDemo, frameClassName: "p-6 md:p-10" },
  "ask-ai": { Demo: AskAiDemo, frameClassName: "p-4 md:p-8" },
  "streaming-text": { Demo: StreamingTextDemo, frameClassName: "p-6 md:p-10" },
  "thinking-state": { Demo: ThinkingStateDemo, frameClassName: "p-6 md:p-10" },
  "tool-call": { Demo: ToolCallDemo, frameClassName: "p-6 md:p-10" },
  "agent-checklist": {
    Demo: AgentChecklistDemo,
    frameClassName: "p-6 md:p-10",
  },
  "inline-citations": {
    Demo: InlineCitationsDemo,
    frameClassName: "p-6 md:p-10",
  },
  "approval-card": { Demo: ApprovalCardDemo, frameClassName: "p-6 md:p-10" },
  "bounding-boxes": { Demo: BoundingBoxesDemo, frameClassName: "p-6 md:p-10" },
  "page-navigator": { Demo: PageNavigatorDemo, frameClassName: "p-6 md:p-10" },
  "file-tree": { Demo: FileTreeDemo, frameClassName: "p-6 md:p-10" },
  "document-splits": {
    Demo: DocumentSplitsDemo,
    frameClassName: "p-6 md:p-10",
  },
  "schema-builder": { Demo: SchemaBuilderDemo, frameClassName: "p-6 md:p-10" },
  "signature-pad": { Demo: SignaturePadDemo, frameClassName: "p-6 md:p-10" },
  "csv-viewer": { Demo: CsvViewerDemo, frameClassName: "p-6 md:p-10" },
  "docx-viewer": { Demo: DocxViewerDemo, frameClassName: "p-6 md:p-10" },
  "pdf-viewer": { Demo: PdfViewerDemo, frameClassName: "p-6 md:p-10" },
  "markdown-blocks": {
    Demo: MarkdownBlocksDemo,
    frameClassName: "p-6 md:p-10",
  },
  conversation: { Demo: ConversationDemo, frameClassName: "p-6 md:p-10" },
  message: { Demo: MessageDemo, frameClassName: "p-6 md:p-10" },
  "prompt-input": { Demo: PromptInputDemo, frameClassName: "p-6 md:p-10" },
  suggestions: { Demo: SuggestionsDemo, frameClassName: "p-6 md:p-10" },
  "annotation-layer": {
    Demo: AnnotationLayerDemo,
    frameClassName: "p-6 md:p-10",
  },
  redaction: { Demo: RedactionDemo, frameClassName: "p-6 md:p-10" },
  "signature-footer": {
    Demo: SignatureFooterDemo,
    frameClassName: "p-4 md:p-8",
  },
  "image-gallery": { Demo: ImageGalleryDemo, frameClassName: "items-start" },
}
