import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/vue'
import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Polyfill para atob/btoa (jsdom antigo)
if (typeof globalThis.atob === 'undefined') {
  globalThis.atob = (str: string) => Buffer.from(str, 'base64').toString('binary')
}
if (typeof globalThis.btoa === 'undefined') {
  globalThis.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64')
}

// Polyfill de matchMedia (usado por libs de UI)
if (typeof window.matchMedia === 'undefined') {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    }) as MediaQueryList
}

// Mock de canvas para Chart.js em jsdom (evita warnings "can't acquire context")
HTMLCanvasElement.prototype.getContext = (() => {
  const original = HTMLCanvasElement.prototype.getContext
  return function getContext(
    this: HTMLCanvasElement,
    contextId: string,
    ...args: unknown[]
  ): CanvasRenderingContext2D | null {
    if (contextId === '2d') {
      // Retorna um stub 2D mínimo aceito pelo Chart.js
      const ctx = {
        canvas: this,
        clearRect: () => {},
        fillRect: () => {},
        strokeRect: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        clip: () => {},
        rect: () => {},
        scale: () => {},
        rotate: () => {},
        translate: () => {},
        setTransform: () => {},
        save: () => {},
        restore: () => {},
        drawImage: () => {},
        measureText: () => ({ width: 0 }),
        getImageData: () => ({ data: new Uint8ClampedArray(0), width: 0, height: 0 }),
        putImageData: () => {},
        createLinearGradient: () => ({ addColorStop: () => {} }),
        createRadialGradient: () => ({ addColorStop: () => {} }),
        createPattern: () => null,
        fillText: () => {},
        strokeText: () => {},
        getTransform: () => new DOMMatrix(),
        resetTransform: () => {},
        setLineDash: () => {},
        getLineDash: () => [],
        isPointInPath: () => false,
        isPointInStroke: () => false,
        globalAlpha: 1,
        globalCompositeOperation: 'source-over',
        fillStyle: '#000',
        strokeStyle: '#000',
        lineWidth: 1,
        lineCap: 'butt',
        lineJoin: 'miter',
        font: '10px sans-serif',
        textAlign: 'start',
        textBaseline: 'alphabetic',
        shadowBlur: 0,
        shadowColor: 'transparent',
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        imageSmoothingEnabled: true
      } as unknown as CanvasRenderingContext2D
      return ctx
    }
    return original?.call(this, contextId, ...args) ?? null
  }
})()

// Global stub de Transição (Transitions do Vue não existem em jsdom)
config.global.stubs = {
  transition: false,
  'transition-group': false
}

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
