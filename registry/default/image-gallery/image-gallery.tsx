"use client"

import * as React from "react"
import { Grid2X2, Images, Rows3 } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  ImageGrid,
  type GalleryImage,
  type ImageGridLayout,
} from "@/registry/default/image-grid/image-grid"
import { Lightbox } from "@/registry/default/lightbox/lightbox"

export type ImageGalleryItem = GalleryImage
export type ImageGalleryLayout = ImageGridLayout

export interface ImageGalleryProps extends Omit<
  React.ComponentPropsWithoutRef<"section">,
  "title"
> {
  images: ImageGalleryItem[]
  title?: React.ReactNode
  layout?: ImageGalleryLayout
  defaultLayout?: ImageGalleryLayout
  onLayoutChange?: (layout: ImageGalleryLayout) => void
  selectedId?: string | null
  defaultSelectedId?: string | null
  onSelectedIdChange?: (id: string | null) => void
  showLayoutToggle?: boolean
  emptyState?: React.ReactNode
  renderImage?: (
    image: ImageGalleryItem,
    context: { lightbox: boolean }
  ) => React.ReactNode
}

/*
 * A block: the grid, the lightbox, and the chrome that holds them. Image Grid
 * needs nothing but React, and Lightbox works over any set of images, so reach
 * for those directly when you do not want this arrangement.
 */
export const ImageGallery = React.forwardRef<HTMLElement, ImageGalleryProps>(
  function ImageGallery(
    {
      images,
      title = "Gallery",
      layout: controlledLayout,
      defaultLayout = "grid",
      onLayoutChange,
      selectedId: controlledSelectedId,
      defaultSelectedId = null,
      onSelectedIdChange,
      showLayoutToggle = true,
      emptyState = "No images yet.",
      renderImage,
      className,
      ...sectionProps
    },
    forwardedRef
  ) {
    const [uncontrolledLayout, setUncontrolledLayout] =
      React.useState<ImageGalleryLayout>(defaultLayout)
    const [uncontrolledSelectedId, setUncontrolledSelectedId] = React.useState<
      string | null
    >(defaultSelectedId)
    const lastTriggerRef = React.useRef<HTMLButtonElement>(null)

    const layout = controlledLayout ?? uncontrolledLayout
    const selectedId = controlledSelectedId ?? uncontrolledSelectedId

    function changeLayout(nextLayout: ImageGalleryLayout) {
      if (controlledLayout === undefined) setUncontrolledLayout(nextLayout)
      onLayoutChange?.(nextLayout)
    }

    function changeSelectedId(nextId: string | null) {
      if (controlledSelectedId === undefined) setUncontrolledSelectedId(nextId)
      onSelectedIdChange?.(nextId)
    }

    return (
      <>
        <section
          {...sectionProps}
          data-slot="image-gallery"
          ref={forwardedRef}
          className={cn("w-full space-y-6", className)}
        >
          <header
            data-slot="image-gallery-header"
            className="flex min-h-11 items-center justify-between gap-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <h2 className="truncate text-xl font-semibold">{title}</h2>
              <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap tabular-nums">
                {images.length}
                <span className="hidden sm:inline">
                  {images.length === 1 ? " image" : " images"}
                </span>
              </span>
            </div>

            {showLayoutToggle && images.length > 0 && (
              <button
                type="button"
                data-slot="image-gallery-layout-toggle"
                aria-label={
                  layout === "grid" ? "Use masonry layout" : "Use grid layout"
                }
                className="border-border hover:bg-muted focus-visible:ring-ring inline-flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
                onClick={() =>
                  changeLayout(layout === "grid" ? "masonry" : "grid")
                }
              >
                {layout === "grid" ? (
                  <Rows3 aria-hidden="true" size={18} />
                ) : (
                  <Grid2X2 aria-hidden="true" size={18} />
                )}
              </button>
            )}
          </header>

          <ImageGrid
            emptyState={
              <span className="inline-flex items-center gap-2">
                <Images aria-hidden="true" size={18} />
                {emptyState}
              </span>
            }
            images={images}
            layout={layout}
            renderImage={
              renderImage
                ? (image) => renderImage(image, { lightbox: false })
                : undefined
            }
            onSelect={(image, event) => {
              lastTriggerRef.current = event.currentTarget
              changeSelectedId(image.id)
            }}
          />
        </section>

        <Lightbox
          closeLabel="Close gallery"
          finalFocus={lastTriggerRef}
          images={images}
          openId={selectedId}
          renderImage={
            renderImage
              ? (image) => renderImage(image, { lightbox: true })
              : undefined
          }
          onOpenIdChange={changeSelectedId}
        />
      </>
    )
  }
)
