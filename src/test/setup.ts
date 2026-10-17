import '@testing-library/jest-dom/vitest'

const captured = new WeakMap<Element, Set<number>>()

Element.prototype.setPointerCapture = function (pointerId: number) {
  captured.set(this, (captured.get(this) ?? new Set()).add(pointerId))
}
Element.prototype.hasPointerCapture = function (pointerId: number) {
  return captured.get(this)?.has(pointerId) ?? false
}
Element.prototype.releasePointerCapture = function (pointerId: number) {
  captured.get(this)?.delete(pointerId)
}

Object.defineProperties(HTMLElement.prototype, {
  clientWidth: { configurable: true, get: () => 1024 },
  clientHeight: { configurable: true, get: () => 768 },
})

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
