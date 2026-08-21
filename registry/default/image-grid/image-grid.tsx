"use client"

/* eslint-disable @next/next/no-img-element -- This must work outside Next.js. */

import * as React from "react"

import { cn } from "@/lib/utils"

export interface GalleryImage {
  id: string
  src: string
  alt: string
  width?: number
  height?: number
  caption?: React.ReactNode
  description?: React.ReactNode
  downloadUrl?: string
  loading?: "eager" | "lazy"
}

export type ImageGridLayout = "grid" | "masonry"

export interface ImageGridProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onSelect" | "children"
> {
  images: readonly GalleryImage[]
  /** Even cells, or columns that keep each image's own height. */
  layout?: ImageGridLayout
  /** Makes every tile a button. Without it the grid is not interactive. */
  onSelect?: (
    image: GalleryImage,
    event: React.MouseEvent<HTMLButtonElement>
  ) => void
  renderImage?: (image: GalleryImage) => React.ReactNode
  /** Shown in place of the grid when there is nothing to show. */
  emptyState?: React.ReactNode
}

/**
 * The thumbnails on their own, with no dialog and no dependency beyond React.
 * Pair it with Lightbox for a viewer, or use it as a picker.
 */
export function ImageGrid({
  images,
  layout = "grid",
  onSelect,
  renderImage,
  emptyState = "No images yet.",
  className,
  ...rootProps
}: ImageGridProps) {
  if (images.length === 0) {
    return (
      <div
        data-slot="image-grid-empty"
        className={cn(
          "border-border text-muted-foreground rounded-[var(--radius)] border border-dashed px-6 py-12 text-center text-sm",
          className
        )}
        {...rootProps}
      >
        {emptyState}
      </div>
    )
  }

  return (
    <div
      data-slot="image-grid"
      data-layout={layout}
      className={cn(
        layout === "grid"
          ? "grid grid-cols-2 gap-3 md:grid-cols-3"
          : "columns-2 gap-3 md:columns-3",
        className
      )}
      {...rootProps}
    >
      {images.map((image) => {
        const tile = (
          <>
            <span data-slot="image-grid-image" className="contents">
              {renderImage?.(image) ?? (
                <img
                  src={image.src}
                  alt={onSelect ? image.alt : image.alt}
                  width={image.width}
                  height={image.height}
                  loading={image.loading ?? "lazy"}
                  decoding="async"
                  className={cn(
                    "w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:scale-100",
                    layout === "grid" ? "h-full" : "h-auto"
                  )}
                />
              )}
            </span>
            <span
              data-slot="image-grid-caption"
              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pt-10 pb-3 text-sm font-semibold text-white"
            >
              {image.caption ?? image.alt}
            </span>
          </>
        )

        const shape = cn(
          "group bg-muted relative w-full overflow-hidden rounded-[var(--radius)]",
          layout === "grid" ? "aspect-[4/3]" : "mb-3 break-inside-avoid"
        )

        // A tile is only a control when choosing one does something.
        return onSelect ? (
          <button
            key={image.id}
            data-slot="image-grid-item"
            type="button"
            aria-label={`Open ${image.alt}`}
            className={cn(
              shape,
              "focus-visible:ring-ring text-left focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            )}
            onClick={(event) => onSelect(image, event)}
          >
            {tile}
          </button>
        ) : (
          <div key={image.id} data-slot="image-grid-item" className={shape}>
            {tile}
          </div>
        )
      })}
    </div>
  )
}
