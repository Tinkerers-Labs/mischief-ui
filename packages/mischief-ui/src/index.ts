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
  JsonViewer,
  type JsonViewerProps,
} from "../../../registry/default/json-viewer/json-viewer"

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
  rankCommandItem,
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
  Orb,
  type OrbProps,
  type OrbState,
} from "../../../registry/default/orb/orb"

export {
  Matrix,
  type MatrixProps,
} from "../../../registry/default/matrix/matrix"

export {
  TranscriptViewer,
  type TranscriptViewerProps,
  type TranscriptCue,
} from "../../../registry/default/transcript-viewer/transcript-viewer"

export {
  ShimmeringText,
  type ShimmeringTextProps,
} from "../../../registry/default/shimmering-text/shimmering-text"

export {
  ScrubBar,
  type ScrubBarProps,
} from "../../../registry/default/scrub-bar/scrub-bar"

export {
  VoiceInput,
  type VoiceInputProps,
  type VoiceInputStatus,
} from "../../../registry/default/voice-input/voice-input"

export {
  AudioPlayer,
  type AudioPlayerProps,
  type TranscriptLine,
} from "../../../registry/default/audio-player/audio-player"

export {
  BarVisualizer,
  type BarVisualizerProps,
  type BarVisualizerSource,
  type BarVisualizerState,
} from "../../../registry/default/bar-visualizer/bar-visualizer"

export {
  MicSelector,
  type MicSelectorProps,
  type MicSelectorStatus,
} from "../../../registry/default/mic-selector/mic-selector"

export {
  ChainOfThought,
  type ChainOfThoughtProps,
  type Thought,
  type ThoughtStatus,
} from "../../../registry/default/chain-of-thought/chain-of-thought"

export {
  WebPreview,
  type PreviewSize,
  type WebPreviewProps,
} from "../../../registry/default/web-preview/web-preview"

export {
  VideoPlayer,
  type VideoPlayerProps,
  type VideoTrack,
} from "../../../registry/default/video-player/video-player"

export {
  ReviewableDiff,
  type ReviewableDiffProps,
} from "../../../registry/default/reviewable-diff/reviewable-diff"

export {
  SubagentTree,
  type AgentRun,
  type AgentRunStatus,
  type SubagentTreeProps,
} from "../../../registry/default/subagent-tree/subagent-tree"

export {
  StoppedRun,
  type StoppedReason,
  type StoppedRunProps,
} from "../../../registry/default/stopped-run/stopped-run"

export {
  MemoryChips,
  type Memory,
  type MemoryChipsProps,
} from "../../../registry/default/memory-chips/memory-chips"

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

export {
  Spinner,
  type SpinnerProps,
} from "../../../registry/default/spinner/spinner"

export {
  Skeleton,
  type SkeletonProps,
} from "../../../registry/default/skeleton/skeleton"

export {
  StatusPill,
  type StatusPillProps,
  type StatusTone,
} from "../../../registry/default/status-pill/status-pill"

export {
  CopyButton,
  type CopyButtonProps,
} from "../../../registry/default/copy-button/copy-button"

export {
  SecretField,
  type SecretFieldProps,
} from "../../../registry/default/secret-field/secret-field"

export {
  Pagination,
  paginationRange,
  type PaginationProps,
  type PaginationLink,
} from "../../../registry/default/pagination/pagination"

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

export {
  RenderSurface,
  createQuadProgram,
  resolveColor,
  useThemeColors,
  colorOf,
  type RenderSurfaceProps,
  type SurfaceArgs,
  type SurfaceColor,
  type SurfaceContextType,
  type SurfaceSize,
  type QuadProgram,
} from "../../../registry/default/render-surface/render-surface"

export {
  AuroraField,
  type AuroraFieldProps,
} from "../../../registry/default/aurora-field/aurora-field"

export {
  GrainOverlay,
  type GrainOverlayProps,
} from "../../../registry/default/grain-overlay/grain-overlay"

export {
  SpotlightCard,
  type SpotlightCardProps,
} from "../../../registry/default/spotlight-card/spotlight-card"

export {
  ConstellationField,
  type ConstellationFieldProps,
} from "../../../registry/default/constellation-field/constellation-field"

export {
  LatticeField,
  type LatticeFieldProps,
} from "../../../registry/default/lattice-field/lattice-field"

export {
  Burst,
  type BurstHandle,
  type BurstOptions,
  type BurstProps,
} from "../../../registry/default/burst/burst"

export {
  ShaderSurface,
  type ShaderSurfaceProps,
  type ShaderSurfaceVariant,
} from "../../../registry/default/shader-surface/shader-surface"

export {
  DisplacementImage,
  type DisplacementImageProps,
} from "../../../registry/default/displacement-image/displacement-image"

export {
  ScrollScene,
  type ScrollSceneProps,
  type ScrollRange,
} from "../../../registry/default/scroll-scene/scroll-scene"

export {
  Reveal,
  type RevealProps,
  type RevealDirection,
} from "../../../registry/default/reveal/reveal"

export {
  Marquee,
  type MarqueeProps,
} from "../../../registry/default/marquee/marquee"

export {
  SplitText,
  type SplitTextProps,
  type SplitBy,
  type SplitAnimation,
} from "../../../registry/default/split-text/split-text"

export {
  NumberTicker,
  type NumberTickerProps,
} from "../../../registry/default/number-ticker/number-ticker"

export {
  TiltCard,
  type TiltCardProps,
} from "../../../registry/default/tilt-card/tilt-card"

export {
  CursorTrail,
  type CursorTrailProps,
} from "../../../registry/default/cursor-trail/cursor-trail"

export {
  ConnectionBeam,
  type ConnectionBeamProps,
} from "../../../registry/default/connection-beam/connection-beam"

export {
  Metaballs,
  type MetaballsProps,
} from "../../../registry/default/metaballs/metaballs"

export {
  DitherImage,
  type DitherImageProps,
} from "../../../registry/default/dither-image/dither-image"

export {
  AsciiImage,
  type AsciiImageProps,
} from "../../../registry/default/ascii-image/ascii-image"

export {
  PresenceField,
  type PresenceFieldProps,
  type AgentPresence,
} from "../../../registry/default/presence-field/presence-field"

export {
  StreamGlow,
  type StreamGlowProps,
} from "../../../registry/default/stream-glow/stream-glow"

export {
  OtpInput,
  type OtpInputProps,
} from "../../../registry/default/otp-input/otp-input"

export {
  TagInput,
  type TagInputProps,
} from "../../../registry/default/tag-input/tag-input"

export {
  Combobox,
  rankComboboxOption,
  type ComboboxMultipleProps,
  type ComboboxOption,
  type ComboboxProps,
  type ComboboxRanker,
  type ComboboxSingleProps,
} from "../../../registry/default/combobox/combobox"

export {
  SortableList,
  type SortableListProps,
} from "../../../registry/default/sortable-list/sortable-list"

export {
  ResizablePanels,
  type ResizablePanelsProps,
} from "../../../registry/default/resizable-panels/resizable-panels"

export {
  Stepper,
  type StepperProps,
  type Step,
} from "../../../registry/default/stepper/stepper"

export {
  AvatarStack,
  type AvatarStackProps,
  type Person,
} from "../../../registry/default/avatar-stack/avatar-stack"

export {
  Timeline,
  type TimelineProps,
  type TimelineEntry,
  type TimelineTone,
} from "../../../registry/default/timeline/timeline"

export {
  DataTable,
  type Column,
  type DataTableProps,
  type DataTableSort,
  type SortDirection,
  type SortValue,
} from "../../../registry/default/data-table/data-table"
