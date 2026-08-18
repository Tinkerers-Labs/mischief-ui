"use client"

import * as React from "react"
import { ImagePlus } from "lucide-react"

import { FileThumbnail } from "@/registry/default/file-thumbnail/file-thumbnail"

const examples = [
  {
    label: "PNG",
    file: { name: "floating-index.png", type: "image/png" },
    previewImageUrl: "/demo/gallery/floating-index.png",
  },
  {
    label: "PNG",
    file: { name: "shift-button.png", type: "image/png" },
    previewImageUrl: "/demo/gallery/shift-button.png",
  },
  {
    label: "PNG",
    file: { name: "focus-text.png", type: "image/png" },
    previewImageUrl: "/demo/gallery/focus-text.png",
  },
] as const

export function FileThumbnailDemo() {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [localImage, setLocalImage] = React.useState<File>()

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground max-w-md text-sm">
          Use an existing image URL, or choose a local PNG, JPEG, WebP, GIF,
          SVG, or AVIF file.
        </p>
        <button
          className="border-border bg-background hover:bg-muted focus-visible:ring-ring inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold outline-none focus-visible:ring-2"
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus aria-hidden="true" size={16} />
          Choose local image
        </button>
        <input
          ref={inputRef}
          accept="image/*"
          className="hidden"
          type="file"
          onChange={(event) => {
            setLocalImage(event.currentTarget.files?.[0])
            event.currentTarget.value = ""
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        <figure className="min-w-0">
          <FileThumbnail
            file={localImage ?? { name: "cover.png", type: "image/png" }}
            previewImageUrl={
              localImage ? undefined : "/brand/mischief-social-preview.png"
            }
            className="w-full"
            previewAspectRatio={4 / 5}
          />
          <figcaption className="text-muted-foreground mt-2 truncate text-center text-xs">
            {localImage?.name ?? "Image file"}
          </figcaption>
        </figure>

        {examples.map(({ label, ...props }) => (
          <figure className="min-w-0" key={props.file.name}>
            <FileThumbnail
              {...props}
              className="w-full"
              previewAspectRatio={4 / 5}
            />
            <figcaption className="text-muted-foreground mt-2 text-center text-xs">
              {label}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
