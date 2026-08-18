"use client"

import * as React from "react"
import { FileImage } from "lucide-react"
import { cn } from "@/lib/utils"

export type FileThumbnailFile = {
  name: string
  type?: string
}

export type FileThumbnailProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  file: FileThumbnailFile | File
  previewImageUrl?: string | null
  previewAspectRatio?: number
  previewClassName?: string
  fit?: "cover" | "contain"
  alt?: string
  isLoading?: boolean
  hasError?: boolean
}

function extensionFromName(name: string) {
  const extension = name.includes(".") ? name.split(".").pop() : undefined
  return extension?.slice(0, 5).toUpperCase() || "IMAGE"
}

function isImageFile(file: FileThumbnailFile | File) {
  const extension = extensionFromName(file.name).toLowerCase()
  return (
    file.type?.toLowerCase().startsWith("image/") === true ||
    /^(png|jpe?g|gif|webp|svg|avif)$/.test(extension)
  )
}

export const FileThumbnail = React.forwardRef<
  HTMLDivElement,
  FileThumbnailProps
>(function FileThumbnail(
  {
    file,
    previewImageUrl,
    previewAspectRatio = 1,
    previewClassName,
    fit = "cover",
    alt = "",
    isLoading = false,
    hasError = false,
    className,
    style,
    ...rootProps
  },
  forwardedRef
) {
  const [filePreview, setFilePreview] = React.useState<{
    file: File
    url: string
  }>()
  const [imageResult, setImageResult] = React.useState<{
    url: string
    state: "loaded" | "error"
  }>()
  const browserFile =
    typeof File !== "undefined" && file instanceof File ? file : undefined

  React.useEffect(() => {
    if (
      previewImageUrl !== undefined ||
      !browserFile ||
      !isImageFile(browserFile)
    ) {
      return
    }

    const nextUrl = URL.createObjectURL(browserFile)
    const frame = requestAnimationFrame(() => {
      setFilePreview({ file: browserFile, url: nextUrl })
    })

    return () => {
      cancelAnimationFrame(frame)
      URL.revokeObjectURL(nextUrl)
    }
  }, [browserFile, previewImageUrl])

  const fileUrl = filePreview?.file === file ? filePreview.url : undefined
  const imageUrl =
    previewImageUrl === undefined ? fileUrl : previewImageUrl || undefined
  const imageState =
    imageUrl && imageResult?.url === imageUrl
      ? imageResult.state
      : imageUrl
        ? "loading"
        : "error"
  const showImage = Boolean(imageUrl) && !hasError && imageState !== "error"
  const showLoading =
    isLoading ||
    (!hasError &&
      ((Boolean(browserFile) &&
        previewImageUrl === undefined &&
        !filePreview) ||
        (Boolean(imageUrl) && imageState === "loading")))
  const showFallback = !showImage && !showLoading
  const handleImageRef = React.useCallback(
    (image: HTMLImageElement | null) => {
      if (!image || !imageUrl || !image.complete) return
      const state = image.naturalWidth > 0 ? "loaded" : "error"
      setImageResult((current) =>
        current?.url === imageUrl && current.state === state
          ? current
          : { url: imageUrl, state }
      )
    },
    [imageUrl]
  )

  return (
    <div
      className={cn(
        "border-border bg-muted text-muted-foreground relative isolate overflow-hidden rounded-[var(--radius)] border",
        className
      )}
      data-slot="file-thumbnail"
      data-state={showLoading ? "loading" : showFallback ? "fallback" : "ready"}
      style={{ aspectRatio: previewAspectRatio, ...style }}
      ref={forwardedRef}
      {...rootProps}
    >
      {imageUrl && !hasError ? (
        // A native image keeps this registry item independent of framework image loaders.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          data-slot="file-thumbnail-image"
          ref={handleImageRef}
          alt={alt}
          className={cn(
            "absolute inset-0 size-full transition-opacity duration-200 motion-reduce:transition-none",
            fit === "contain" ? "object-contain" : "object-cover",
            imageState === "loaded" ? "opacity-100" : "opacity-0",
            previewClassName
          )}
          src={imageUrl}
          onError={() => setImageResult({ url: imageUrl, state: "error" })}
          onLoad={() => setImageResult({ url: imageUrl, state: "loaded" })}
        />
      ) : null}

      {showLoading ? (
        <div
          data-slot="file-thumbnail-loading"
          aria-label={`Loading preview for ${file.name}`}
          className="absolute inset-0 overflow-hidden"
          role="status"
        >
          <span className="sr-only">Loading preview</span>
          <span className="bg-muted absolute inset-0" />
          <span className="bg-background/60 absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-12deg] motion-safe:animate-[mischief-file-thumbnail-shimmer_1.4s_ease-in-out_infinite]" />
        </div>
      ) : null}

      {showFallback ? (
        <div
          data-slot="file-thumbnail-fallback"
          aria-label={`${file.name} image preview unavailable`}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          role="img"
        >
          <FileImage aria-hidden="true" size={24} strokeWidth={1.7} />
          <span className="bg-background/80 border-border rounded-md border px-1.5 py-0.5 text-[0.625rem] leading-none font-semibold tracking-[0.08em]">
            {extensionFromName(file.name)}
          </span>
          <span
            aria-hidden="true"
            className="border-border bg-background absolute top-0 right-0 size-6 origin-top-right translate-x-3 -translate-y-3 rotate-45 border"
          />
        </div>
      ) : null}
    </div>
  )
})
