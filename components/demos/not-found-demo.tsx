"use client"

import { NotFound } from "@/registry/default/not-found/not-found"

const action =
  "border-border hover:bg-muted inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold no-underline"

export function NotFoundDemo() {
  return (
    <div className="w-full">
      <NotFound
        className="px-0 py-0"
        code="404"
        title="That page moved, or never existed."
        description="Component pages live under /docs/components. If you followed a link, the component may have been renamed."
        actions={
          <>
            <a className={action} href="#">
              Browse the docs
            </a>
            <a className="text-sm underline underline-offset-4" href="#">
              Go home
            </a>
          </>
        }
      />
    </div>
  )
}
