"use client"

import * as React from "react"

import { samplePages } from "@/components/demos/document-fixtures"
import { PageNavigator } from "@/registry/default/page-navigator/page-navigator"

export function PageNavigatorDemo() {
  const [page, setPage] = React.useState(2)

  return (
    <div className="grid w-full max-w-md gap-3">
      <PageNavigator
        className="w-full"
        orientation="horizontal"
        pages={samplePages}
        activePage={page}
        onActivePageChange={setPage}
      />
      <p className="text-muted-foreground text-center text-xs">
        Showing page {page} of {samplePages.length}
      </p>
    </div>
  )
}
