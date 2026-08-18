"use client"

import { FileUpload } from "@/registry/default/file-upload/file-upload"

export function FileUploadDemo() {
  return (
    <FileUpload
      accept="image/*,.pdf"
      className="mx-auto w-full max-w-2xl"
      description="Images or PDF · Up to 10 MB each"
    />
  )
}
