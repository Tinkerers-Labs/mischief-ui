"use client"

export {
  HoldButton,
  type HoldButtonProps,
} from "../../../registry/default/hold-button/hold-button"

export {
  SignatureFooter,
  type SignatureFooterProps,
} from "../../../registry/default/signature-footer/signature-footer"

export {
  ScrollToTopButton,
  type ScrollToTopButtonProps,
} from "../../../registry/default/scroll-to-top-button/scroll-to-top-button"

export {
  AskAi,
  AskAiLogo,
  createAskAiTargets,
  type AskAiProps,
  type AskAiTarget,
} from "../../../registry/default/ask-ai/ask-ai"

export {
  FileUpload,
  type FileUploadAdapter,
  type FileUploadEntry,
  type FileUploadProps,
  type FileUploadRejection,
  type FileUploadRejectionCode,
  type FileUploadStatus,
} from "../../../registry/default/file-upload/file-upload"

export {
  FileThumbnail,
  type FileThumbnailFile,
  type FileThumbnailProps,
} from "../../../registry/default/file-thumbnail/file-thumbnail"

export {
  StreamingText,
  type StreamingTextProps,
  type StreamingTextStatus,
  type StreamSource,
} from "../../../registry/default/streaming-text/streaming-text"

export {
  ThinkingState,
  type ThinkingStateProps,
  type ThinkingStatus,
} from "../../../registry/default/thinking-state/thinking-state"

export {
  ToolCall,
  type ToolCallProps,
  type ToolCallStatus,
} from "../../../registry/default/tool-call/tool-call"

export {
  AgentChecklist,
  type AgentChecklistProps,
  type AgentChecklistItem,
  type ChecklistItemStatus,
} from "../../../registry/default/agent-checklist/agent-checklist"

export {
  Citation,
  InlineCitations,
  type InlineCitationsProps,
  type CitationProps,
  type CitationSource,
} from "../../../registry/default/inline-citations/inline-citations"

export {
  BoundingBoxes,
  type BoundingBoxesProps,
  type BoundingBox,
  type BoundingBoxTone,
} from "../../../registry/default/bounding-boxes/bounding-boxes"

export {
  PageNavigator,
  type PageNavigatorProps,
  type DocumentPage,
} from "../../../registry/default/page-navigator/page-navigator"

export {
  FileTree,
  type FileTreeProps,
  type FileTreeNode,
} from "../../../registry/default/file-tree/file-tree"

export {
  DocumentSplits,
  type DocumentSplitsProps,
  type SplitPage,
  type DocumentSegment,
} from "../../../registry/default/document-splits/document-splits"

export {
  SchemaBuilder,
  type SchemaBuilderProps,
  type SchemaField,
  type SchemaFieldType,
} from "../../../registry/default/schema-builder/schema-builder"

export {
  SignaturePad,
  type SignaturePadProps,
  type SignatureValue,
  type SignatureMode,
} from "../../../registry/default/signature-pad/signature-pad"

export {
  CsvViewer,
  type CsvViewerProps,
  type CsvTable,
  type CsvParser,
} from "../../../registry/default/csv-viewer/csv-viewer"

export {
  DocxViewer,
  type DocxViewerProps,
  type DocxResult,
  type DocxConverter,
} from "../../../registry/default/docx-viewer/docx-viewer"

export {
  PdfViewer,
  type PdfViewerProps,
  type PdfDocumentHandle,
  type PdfPageHandle,
  type PdfLoader,
} from "../../../registry/default/pdf-viewer/pdf-viewer"

export {
  Conversation,
  type ConversationProps,
} from "../../../registry/default/conversation/conversation"

export {
  Message,
  type MessageProps,
  type MessageRole,
} from "../../../registry/default/message/message"

export {
  PromptInput,
  type PromptInputProps,
  type PromptInputStatus,
} from "../../../registry/default/prompt-input/prompt-input"

export {
  Suggestions,
  type SuggestionsProps,
  type Suggestion,
} from "../../../registry/default/suggestions/suggestions"

export {
  AnnotationLayer,
  type AnnotationLayerProps,
  type Annotation,
  type AnnotationRect,
} from "../../../registry/default/annotation-layer/annotation-layer"

export {
  Redaction,
  type RedactionProps,
  type RedactionRegion,
  type RedactionRect,
} from "../../../registry/default/redaction/redaction"

export {
  Questionnaire,
  type QuestionnaireProps,
  type Question,
  type QuestionChoice,
  type QuestionnaireAnswers,
} from "../../../registry/default/questionnaire/questionnaire"

export {
  CommandPalette,
  type CommandPaletteProps,
  type CommandItem,
} from "../../../registry/default/command-palette/command-palette"

export {
  InstallCommand,
  type InstallCommandProps,
  type PackageManager,
} from "../../../registry/default/install-command/install-command"

export {
  CopyForAi,
  type CopyForAiProps,
  type AiDestination,
} from "../../../registry/default/copy-for-ai/copy-for-ai"

export {
  TableOfContents,
  type TableOfContentsProps,
  type TocSection,
} from "../../../registry/default/table-of-contents/table-of-contents"

export {
  CodeBlock,
  type CodeBlockProps,
} from "../../../registry/default/code-block/code-block"

export {
  DiffView,
  diffLines,
  toHunks,
  type DiffViewProps,
  type DiffLine,
  type DiffHunk,
  type DiffLineKind,
} from "../../../registry/default/diff-view/diff-view"

export {
  TerminalOutput,
  type TerminalOutputProps,
  type TerminalLine,
  type TerminalStream,
} from "../../../registry/default/terminal-output/terminal-output"

export {
  ResponseActions,
  type ResponseActionsProps,
  type ResponseFeedback,
} from "../../../registry/default/response-actions/response-actions"

export {
  ThemeToggle,
  applyTheme,
  type ThemeToggleProps,
  type ThemeMode,
} from "../../../registry/default/theme-toggle/theme-toggle"

export {
  Accordion,
  type AccordionProps,
  type AccordionItem,
} from "../../../registry/default/accordion/accordion"

export {
  ComponentPreview,
  type ComponentPreviewProps,
} from "../../../registry/default/component-preview/component-preview"

export { Kbd, type KbdProps } from "../../../registry/default/kbd/kbd"

export {
  StopGenerating,
  type StopGeneratingProps,
} from "../../../registry/default/stop-generating/stop-generating"

export {
  TokenMeter,
  type TokenMeterProps,
  type TokenSegment,
} from "../../../registry/default/token-meter/token-meter"

export {
  ModelPicker,
  type ModelPickerProps,
  type Model,
} from "../../../registry/default/model-picker/model-picker"

export {
  SourceCard,
  type SourceCardProps,
} from "../../../registry/default/source-card/source-card"

export {
  EmptyState,
  type EmptyStateProps,
} from "../../../registry/default/empty-state/empty-state"

export {
  FooterColumns,
  FooterLinkItem,
  FOOTER_LABEL,
  type FooterColumnsProps,
  type FooterColumn,
  type FooterLink,
  type FooterLinkRenderer,
} from "../../../registry/default/footer-columns/footer-columns"

export {
  FooterRow,
  type FooterRowProps,
} from "../../../registry/default/footer-row/footer-row"

export {
  FooterWordmark,
  type FooterWordmarkProps,
} from "../../../registry/default/footer-wordmark/footer-wordmark"

export {
  EmptyRow,
  type EmptyRowProps,
} from "../../../registry/default/empty-row/empty-row"

export {
  NotFound,
  type NotFoundProps,
} from "../../../registry/default/not-found/not-found"

export {
  ImageGrid,
  type ImageGridProps,
  type GalleryImage,
  type ImageGridLayout,
} from "../../../registry/default/image-grid/image-grid"

// Type-only, so these erase at build time and pull in no optional peer. They
// give the declaration build one shared type graph, without which tsup walks
// each entry separately and runs out of heap. The components themselves stay
// subpath-only: importing one is what makes its peer a real requirement.

export type {
  MagneticTabItem,
  MagneticTabsProps,
} from "../../../registry/default/magnetic-tabs/magnetic-tabs"

export type { ElasticSliderProps } from "../../../registry/default/elastic-slider/elastic-slider"

export type { ImpossibleCheckboxProps } from "../../../registry/default/impossible-checkbox/impossible-checkbox"

export type {
  FloatingIndexItem,
  FloatingIndexProps,
} from "../../../registry/default/floating-index/floating-index"

export type { ShiftButtonProps } from "../../../registry/default/shift-button/shift-button"

export type { LightboxProps } from "../../../registry/default/lightbox/lightbox"

export type {
  ImageGalleryItem,
  ImageGalleryLayout,
  ImageGalleryProps,
} from "../../../registry/default/image-gallery/image-gallery"

export type {
  MarkdownBlocksProps,
  MarkdownBlock,
  MarkdownBlockKind,
} from "../../../registry/default/markdown-blocks/markdown-blocks"
