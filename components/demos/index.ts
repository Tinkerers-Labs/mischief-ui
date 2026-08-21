import type { ComponentType } from "react"

import { CodeBlockDemo } from "@/components/demos/code-block-demo"
import { DiffViewDemo } from "@/components/demos/diff-view-demo"
import { ResponseActionsDemo } from "@/components/demos/response-actions-demo"
import { TerminalOutputDemo } from "@/components/demos/terminal-output-demo"
import { AccordionDemo } from "@/components/demos/accordion-demo"
import { ComponentPreviewDemo } from "@/components/demos/component-preview-demo"
import { EmptyStateDemo } from "@/components/demos/empty-state-demo"
import { KbdDemo } from "@/components/demos/kbd-demo"
import { ModelPickerDemo } from "@/components/demos/model-picker-demo"
import { SourceCardDemo } from "@/components/demos/source-card-demo"
import { StopGeneratingDemo } from "@/components/demos/stop-generating-demo"
import { ThemeToggleDemo } from "@/components/demos/theme-toggle-demo"
import { TokenMeterDemo } from "@/components/demos/token-meter-demo"
import { FooterColumnsDemo } from "@/components/demos/footer-columns-demo"
import { FooterRowDemo } from "@/components/demos/footer-row-demo"
import { FooterWordmarkDemo } from "@/components/demos/footer-wordmark-demo"
import { EmptyRowDemo } from "@/components/demos/empty-row-demo"
import { NotFoundDemo } from "@/components/demos/not-found-demo"
import { ImageGridDemo } from "@/components/demos/image-grid-demo"
import { LightboxDemo } from "@/components/demos/lightbox-demo"
import { SpinnerDemo } from "@/components/demos/spinner-demo"
import { SkeletonDemo } from "@/components/demos/skeleton-demo"
import { StatusPillDemo } from "@/components/demos/status-pill-demo"
import { CopyButtonDemo } from "@/components/demos/copy-button-demo"
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
import { CommandPaletteDemo } from "@/components/demos/command-palette-demo"
import { CopyForAiDemo } from "@/components/demos/copy-for-ai-demo"
import { InstallCommandDemo } from "@/components/demos/install-command-demo"
import { TableOfContentsDemo } from "@/components/demos/table-of-contents-demo"
import { ConversationDemo } from "@/components/demos/conversation-demo"
import { MessageDemo } from "@/components/demos/message-demo"
import { PromptInputDemo } from "@/components/demos/prompt-input-demo"
import { QuestionnaireDemo } from "@/components/demos/questionnaire-demo"
import { RedactionDemo } from "@/components/demos/redaction-demo"
import { SuggestionsDemo } from "@/components/demos/suggestions-demo"
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
import { ScrollToTopDemo } from "@/components/demos/scroll-to-top-button-demo"
import { ShiftButtonDemo } from "@/components/demos/shift-button-demo"
import { SignatureFooterDemo } from "@/components/demos/signature-footer-demo"
import { StreamingTextDemo } from "@/components/demos/streaming-text-demo"
import { ThinkingStateDemo } from "@/components/demos/thinking-state-demo"
import { ToolCallDemo } from "@/components/demos/tool-call-demo"

export type ComponentDemo = {
  Demo: ComponentType
  frameClassName?: string
  /** How much of the twelve column gallery grid this component needs. */
  tileClassName?: string
}

export const componentDemos: Record<string, ComponentDemo> = {
  "magnetic-tabs": { Demo: MagneticTabsDemo, tileClassName: "lg:col-span-7" },
  "elastic-slider": { Demo: ElasticSliderDemo, tileClassName: "lg:col-span-5" },
  "hold-button": { Demo: HoldButtonDemo, tileClassName: "lg:col-span-4" },
  "shift-button": { Demo: ShiftButtonDemo },
  "impossible-checkbox": {
    Demo: ImpossibleCheckboxDemo,
    tileClassName: "lg:col-span-4",
  },
  "floating-index": { Demo: FloatingIndexDemo },
  "scroll-to-top-button": { Demo: ScrollToTopDemo },
  "file-upload": { Demo: FileUploadDemo, frameClassName: "p-4 md:p-8" },
  "file-thumbnail": { Demo: FileThumbnailDemo, frameClassName: "p-6 md:p-10" },
  "ask-ai": { Demo: AskAiDemo, frameClassName: "p-4 md:p-8" },
  "streaming-text": { Demo: StreamingTextDemo, frameClassName: "p-6 md:p-10" },
  "thinking-state": { Demo: ThinkingStateDemo, frameClassName: "p-6 md:p-10" },
  "tool-call": { Demo: ToolCallDemo, frameClassName: "p-6 md:p-10" },
  spinner: { Demo: SpinnerDemo, frameClassName: "p-6 md:p-10" },
  skeleton: { Demo: SkeletonDemo, frameClassName: "p-6 md:p-10" },
  "status-pill": { Demo: StatusPillDemo, frameClassName: "p-6 md:p-10" },
  "copy-button": { Demo: CopyButtonDemo, frameClassName: "p-6 md:p-10" },
  "image-grid": { Demo: ImageGridDemo, frameClassName: "p-6 md:p-10" },
  lightbox: { Demo: LightboxDemo, frameClassName: "p-6 md:p-10" },
  "empty-row": { Demo: EmptyRowDemo, frameClassName: "p-6 md:p-10" },
  "not-found": { Demo: NotFoundDemo, frameClassName: "p-6 md:p-10" },
  "footer-columns": { Demo: FooterColumnsDemo, frameClassName: "p-6 md:p-10" },
  "footer-row": { Demo: FooterRowDemo, frameClassName: "p-6 md:p-10" },
  "footer-wordmark": {
    Demo: FooterWordmarkDemo,
    frameClassName: "p-6 md:p-10",
  },
  "theme-toggle": { Demo: ThemeToggleDemo, frameClassName: "p-6 md:p-10" },
  accordion: { Demo: AccordionDemo, frameClassName: "p-6 md:p-10" },
  "component-preview": {
    Demo: ComponentPreviewDemo,
    frameClassName: "p-6 md:p-10",
  },
  kbd: { Demo: KbdDemo, frameClassName: "p-6 md:p-10" },
  "stop-generating": {
    Demo: StopGeneratingDemo,
    frameClassName: "p-6 md:p-10",
  },
  "token-meter": { Demo: TokenMeterDemo, frameClassName: "p-6 md:p-10" },
  "model-picker": { Demo: ModelPickerDemo, frameClassName: "p-6 md:p-10" },
  "source-card": { Demo: SourceCardDemo, frameClassName: "p-6 md:p-10" },
  "empty-state": { Demo: EmptyStateDemo, frameClassName: "p-6 md:p-10" },
  "code-block": { Demo: CodeBlockDemo, frameClassName: "p-6 md:p-10" },
  "diff-view": { Demo: DiffViewDemo, frameClassName: "p-6 md:p-10" },
  "terminal-output": {
    Demo: TerminalOutputDemo,
    frameClassName: "p-6 md:p-10",
  },
  "response-actions": {
    Demo: ResponseActionsDemo,
    frameClassName: "p-6 md:p-10",
  },
  "agent-checklist": {
    Demo: AgentChecklistDemo,
    frameClassName: "p-6 md:p-10",
  },
  "inline-citations": {
    Demo: InlineCitationsDemo,
    frameClassName: "p-6 md:p-10",
  },
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
  conversation: {
    Demo: ConversationDemo,
    frameClassName: "p-6 md:p-10",
    tileClassName: "lg:col-span-4",
  },
  message: { Demo: MessageDemo, frameClassName: "p-6 md:p-10" },
  "prompt-input": { Demo: PromptInputDemo, frameClassName: "p-6 md:p-10" },
  suggestions: { Demo: SuggestionsDemo, frameClassName: "p-6 md:p-10" },
  "annotation-layer": {
    Demo: AnnotationLayerDemo,
    frameClassName: "p-6 md:p-10",
  },
  redaction: {
    Demo: RedactionDemo,
    frameClassName: "p-6 md:p-10",
    tileClassName: "lg:col-span-5",
  },
  questionnaire: {
    Demo: QuestionnaireDemo,
    frameClassName: "p-6 md:p-10",
    tileClassName: "lg:col-span-7",
  },
  "command-palette": {
    Demo: CommandPaletteDemo,
    frameClassName: "p-6 md:p-10",
  },
  "install-command": {
    Demo: InstallCommandDemo,
    frameClassName: "p-6 md:p-10",
  },
  "copy-for-ai": { Demo: CopyForAiDemo, frameClassName: "p-6 md:p-10" },
  "table-of-contents": {
    Demo: TableOfContentsDemo,
    frameClassName: "p-6 md:p-10",
  },
  "signature-footer": {
    Demo: SignatureFooterDemo,
    frameClassName: "p-4 md:p-8",
  },
  "image-gallery": {
    Demo: ImageGalleryDemo,
    frameClassName: "items-start",
    tileClassName: "lg:col-span-12",
  },
}
