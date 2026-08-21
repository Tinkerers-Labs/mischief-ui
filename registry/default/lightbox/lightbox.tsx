"use client"

/* eslint-disable @next/next/no-img-element -- This must work outside Next.js. */

import * as React from "react"
import { Dialog } from "@base-ui/react/dialog"
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react"

import { cn } from "@/lib/utils"

/** Structurally the same shape Image Grid uses, so the two interchange. */
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

export interface LightboxProps {
  images: readonly GalleryImage[]
  /** The image being shown. Null closes it. */
  openId: string | null
  onOpenIdChange: (id: string | null) => void
  renderImage?: (image: GalleryImage) => React.ReactNode
  /** Focus lands here on close, usually the tile that opened it. */
  finalFocus?: React.RefObject<HTMLElement | null>
  closeLabel?: string
  className?: string
}

const ICON_BUTTON =
  "focus-visible:ring-ring inline-flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white shadow-sm backdrop-blur-sm transition-colors duration-150 hover:bg-black/75 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"

/**
 * One image at a time, full bleed, with the rest of the set a key away. Base
 * UI supplies the dialog, so the focus trap, the scroll lock, Escape, and
 * focus restoration are not ours to get wrong.
 */
export function Lightbox({
  images,
  openId,
  onOpenIdChange,
  renderImage,
  finalFocus,
  closeLabel = "Close",
  className,
}: LightboxProps) {
  const index = images.findIndex((image) => image.id === openId)
  const image = index >= 0 ? images[index] : null

  function move(direction: -1 | 1) {
    if (images.length < 2 || index < 0) return

    const next = images[(index + direction + images.length) % images.length]
    if (next) onOpenIdChange(next.id)
  }

  return (
    <Dialog.Root
      open={image !== null}
      onOpenChange={(open) => {
        if (!open) onOpenIdChange(null)
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop
          data-slot="lightbox-backdrop"
          className="bg-foreground/85 fixed inset-0 z-[100] transition-opacity duration-200 data-[closed]:pointer-events-none data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none"
        />
        <Dialog.Viewport
          data-slot="lightbox-viewport"
          className="fixed inset-0 z-[101] flex items-center justify-center p-3 data-[closed]:pointer-events-none md:p-6"
        >
          {image && (
            <Dialog.Popup
              data-slot="lightbox"
              finalFocus={finalFocus}
              className={cn(
                "bg-foreground text-background relative flex h-full max-h-[calc(100svh-1.5rem)] w-full max-w-6xl items-center justify-center overflow-hidden rounded-[var(--radius)] border border-white/10 shadow-2xl transition-[opacity,transform] duration-200 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 motion-reduce:transition-none md:max-h-[calc(100svh-3rem)]",
                className
              )}
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
              <Dialog.Title className="sr-only">{image.alt}</Dialog.Title>
              <Dialog.Description className="sr-only">
                Image {index + 1} of {images.length}
              </Dialog.Description>

              <span data-slot="lightbox-image" className="contents">
                {renderImage?.(image) ?? (
                  <img
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    decoding="async"
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </span>

              <div className="absolute top-3 right-3 flex items-center gap-2">
                {image.downloadUrl && (
                  <a
                    href={image.downloadUrl}
                    download
                    aria-label={`Download ${image.alt}`}
                    className={ICON_BUTTON}
                  >
                    <Download aria-hidden="true" size={19} />
                  </a>
                )}
                <Dialog.Close aria-label={closeLabel} className={ICON_BUTTON}>
                  <X aria-hidden="true" size={20} />
                </Dialog.Close>
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    className={cn(
                      ICON_BUTTON,
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
                      ICON_BUTTON,
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
                    {image.caption ?? image.alt}
                  </p>
                  {image.description && (
                    <div className="mt-1 text-sm text-white/65">
                      {image.description}
                    </div>
                  )}
                </div>
                <span className="shrink-0 text-sm font-semibold text-white/65 tabular-nums">
                  {index + 1} / {images.length}
                </span>
              </div>
            </Dialog.Popup>
          )}
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
