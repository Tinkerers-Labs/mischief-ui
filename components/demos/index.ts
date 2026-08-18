import type { ComponentType } from "react"

import { AgentChecklistDemo } from "@/components/demos/agent-checklist-demo"
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
  "signature-footer": {
    Demo: SignatureFooterDemo,
    frameClassName: "p-4 md:p-8",
  },
  "image-gallery": { Demo: ImageGalleryDemo, frameClassName: "items-start" },
}
