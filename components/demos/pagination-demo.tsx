"use client"

import * as React from "react"

import { Pagination } from "@/registry/default/pagination/pagination"

export function PaginationDemo() {
  const [page, setPage] = React.useState(7)

  return (
    <div className="grid justify-items-center gap-4">
      <Pagination page={page} pageCount={20} onPageChange={setPage} />
      <p className="text-muted-foreground text-xs" role="status">
        Page {page} of 20
      </p>
    </div>
  )
}
