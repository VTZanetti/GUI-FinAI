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
