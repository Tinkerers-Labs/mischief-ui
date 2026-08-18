"use client"

import {
  TableOfContents,
  type TocSection,
} from "@/registry/default/table-of-contents/table-of-contents"

export type { TocSection }

export function DocsToc({ sections }: { sections: readonly TocSection[] }) {
  return <TableOfContents className="component-toc" sections={sections} />
}
