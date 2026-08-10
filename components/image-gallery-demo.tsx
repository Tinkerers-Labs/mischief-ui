"use client"

import { ImageGallery } from "@/registry/default/image-gallery/image-gallery"

const images = [
  {
    id: "shift-button",
    src: "/demo/gallery/shift-button.png",
    alt: "Shift Button experiment",
    width: 423,
    height: 345,
    caption: "Shift Button",
    description: "A call to action that makes room for what comes next.",
  },
  {
    id: "floating-deck",
    src: "/demo/gallery/floating-deck.png",
    alt: "Floating Deck experiment",
    width: 658,
    height: 439,
    caption: "Floating Deck",
    description: "A compact home for apps, components, and notes.",
  },
  {
    id: "impossible-checkbox",
    src: "/demo/gallery/impossible-checkbox.png",
    alt: "Impossible Checkbox experiment",
    width: 390,
    height: 417,
    caption: "Impossible Checkbox",
    description: "The bear still refuses to cooperate.",
  },
  {
    id: "floating-index",
    src: "/demo/gallery/floating-index.png",
    alt: "Floating Index experiment",
    width: 487,
    height: 342,
    caption: "Floating Index",
    description: "A small outline that keeps your place.",
  },
  {
    id: "appearance-control",
    src: "/demo/gallery/appearance-control.png",
    alt: "Appearance Control experiment",
    width: 581,
    height: 459,
    caption: "Appearance Control",
    description: "Theme choices gathered into one useful card.",
  },
  {
    id: "focus-text",
    src: "/demo/gallery/focus-text.png",
    alt: "Focus Text experiment",
    width: 900,
    height: 571,
    caption: "Focus Text",
    description: "A sentence that sharpens as you reach it.",
  },
]

export function ImageGalleryDemo() {
  return <ImageGallery images={images} title="From the archive" />
}
