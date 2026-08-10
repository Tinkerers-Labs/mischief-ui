"use client"

/* eslint-disable @next/next/no-img-element -- This registry block must work outside Next.js. */

import * as React from "react"
import { Dialog } from "@base-ui/react/dialog"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Grid2X2,
  Images,
  Rows3,
  X,
} from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ImageGalleryItem {
  id: string
  src: string
  alt: string
  width?: number
  height?: number
  caption?: React.ReactNode
  description?: React.ReactNode
  downloadUrl?: string
}

export type ImageGalleryLayout = "grid" | "masonry"

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
}

export function ImageGallery({
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
  className,
  ...sectionProps
}: ImageGalleryProps) {
  const [uncontrolledLayout, setUncontrolledLayout] =
    React.useState<ImageGalleryLayout>(defaultLayout)
  const [uncontrolledSelectedId, setUncontrolledSelectedId] = React.useState<
    string | null
  >(defaultSelectedId)
  const lastTriggerRef = React.useRef<HTMLButtonElement>(null)
  const layout = controlledLayout ?? uncontrolledLayout
  const selectedId = controlledSelectedId ?? uncontrolledSelectedId
  const selectedIndex = images.findIndex((image) => image.id === selectedId)
  const selectedImage = selectedIndex >= 0 ? images[selectedIndex] : null

  function changeLayout(nextLayout: ImageGalleryLayout) {
    if (controlledLayout === undefined) setUncontrolledLayout(nextLayout)
    onLayoutChange?.(nextLayout)
  }

  function changeSelectedId(nextId: string | null) {
    if (controlledSelectedId === undefined) setUncontrolledSelectedId(nextId)
    onSelectedIdChange?.(nextId)
  }

  function move(direction: -1 | 1) {
    if (images.length < 2 || selectedIndex < 0) return
    const nextIndex =
      (selectedIndex + direction + images.length) % images.length
    const nextImage = images[nextIndex]
    if (nextImage) changeSelectedId(nextImage.id)
  }

  const iconButtonClass =
    "focus-visible:ring-ring inline-flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white shadow-sm backdrop-blur-sm transition-colors duration-150 hover:bg-black/75 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"

  return (
    <Dialog.Root
      open={selectedImage !== null}
      onOpenChange={(open) => {
        if (!open) changeSelectedId(null)
      }}
    >
      <section
        {...sectionProps}
        data-slot="image-gallery"
        className={cn("w-full space-y-6", className)}
      >
        <header className="flex min-h-11 items-center justify-between gap-4">
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
              aria-label={
                layout === "grid"
                  ? "Use masonry layout"
                  : "Use equal grid layout"
              }
              className="border-border hover:bg-muted focus-visible:ring-ring inline-flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
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

        {images.length === 0 ? (
          <div className="border-border text-muted-foreground flex min-h-56 flex-col items-center justify-center gap-3 rounded-[var(--radius)] border border-dashed p-8 text-center">
            <Images aria-hidden="true" size={24} />
            <p>{emptyState}</p>
          </div>
        ) : (
          <div
            className={cn(
              layout === "grid"
                ? "grid grid-cols-2 gap-3 md:grid-cols-3"
                : "columns-2 gap-3 md:columns-3"
            )}
          >
            {images.map((image, index) => (
              <button
                type="button"
                aria-label={`Open ${image.alt}`}
                className={cn(
                  "group focus-visible:ring-ring bg-muted relative w-full overflow-hidden rounded-[var(--radius)] text-left focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                  layout === "grid" ? "aspect-[4/3]" : "mb-3 break-inside-avoid"
                )}
                key={image.id}
                onClick={(event) => {
                  lastTriggerRef.current = event.currentTarget
                  changeSelectedId(image.id)
                }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  loading={index < 3 ? "eager" : "lazy"}
                  className={cn(
                    "w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:scale-100",
                    layout === "grid" ? "h-full" : "h-auto"
                  )}
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pt-10 pb-3 text-sm font-semibold text-white">
                  {image.caption ?? image.alt}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <Dialog.Portal>
        <Dialog.Backdrop className="bg-foreground/85 fixed inset-0 z-[100] transition-opacity duration-200 data-[closed]:pointer-events-none data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
        <Dialog.Viewport className="fixed inset-0 z-[101] flex items-center justify-center p-3 data-[closed]:pointer-events-none md:p-6">
          {selectedImage && (
            <Dialog.Popup
              finalFocus={lastTriggerRef}
              className="bg-foreground text-background relative flex h-full max-h-[calc(100svh-1.5rem)] w-full max-w-6xl items-center justify-center overflow-hidden rounded-[var(--radius)] border border-white/10 shadow-2xl transition-[opacity,transform] duration-200 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 motion-reduce:transition-none md:max-h-[calc(100svh-3rem)]"
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                  event.preventDefault()
                  move(-1)
                }
                if (event.key === "ArrowRight") {
                  event.preventDefault()
                  move(1)
                }
              }}
            >
              <Dialog.Title className="sr-only">
                {selectedImage.alt}
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                Image {selectedIndex + 1} of {images.length}
              </Dialog.Description>

              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                width={selectedImage.width}
                height={selectedImage.height}
                className="max-h-full max-w-full object-contain"
              />

              <div className="absolute top-3 right-3 flex items-center gap-2">
                {selectedImage.downloadUrl && (
                  <a
                    href={selectedImage.downloadUrl}
                    download
                    aria-label={`Download ${selectedImage.alt}`}
                    className={iconButtonClass}
                  >
                    <Download aria-hidden="true" size={19} />
                  </a>
                )}
                <Dialog.Close
                  aria-label="Close gallery"
                  className={iconButtonClass}
                >
                  <X aria-hidden="true" size={20} />
                </Dialog.Close>
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    className={cn(
                      iconButtonClass,
                      "absolute top-1/2 left-3 -translate-y-1/2"
                    )}
                    onClick={() => move(-1)}
                  >
                    <ChevronLeft aria-hidden="true" size={22} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    className={cn(
                      iconButtonClass,
                      "absolute top-1/2 right-3 -translate-y-1/2"
                    )}
                    onClick={() => move(1)}
                  >
                    <ChevronRight aria-hidden="true" size={22} />
                  </button>
                </>
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/80 to-transparent px-4 pt-16 pb-4 text-white md:px-6 md:pb-6">
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {selectedImage.caption ?? selectedImage.alt}
                  </p>
                  {selectedImage.description && (
                    <div className="mt-1 text-sm text-white/65">
                      {selectedImage.description}
                    </div>
                  )}
                </div>
                <span className="shrink-0 text-sm font-semibold text-white/65 tabular-nums">
                  {selectedIndex + 1} / {images.length}
                </span>
              </div>
            </Dialog.Popup>
          )}
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
