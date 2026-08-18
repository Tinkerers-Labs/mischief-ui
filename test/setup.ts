import "@testing-library/jest-dom/vitest"

import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

afterEach(() => cleanup())

Object.defineProperty(window, "matchMedia", {
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }),
})

Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
  configurable: true,
  value: () => undefined,
})

Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", {
  configurable: true,
  value: () => undefined,
})

Object.defineProperty(URL, "createObjectURL", {
  configurable: true,
  value: () => "blob:preview",
})

Object.defineProperty(URL, "revokeObjectURL", {
  configurable: true,
  value: () => undefined,
})

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, "ResizeObserver", {
  configurable: true,
  value: ResizeObserverStub,
})

Object.defineProperty(globalThis, "ResizeObserver", {
  configurable: true,
  value: ResizeObserverStub,
})

window.requestAnimationFrame = (callback) =>
  window.setTimeout(() => callback(performance.now()), 0)
window.cancelAnimationFrame = (handle) => window.clearTimeout(handle)
