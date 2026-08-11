/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_TARGET?: string
  readonly VITE_DEMO_MODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

// Tipagem global do Pluggy Connect Widget (carregado via CDN oficial)
interface Window {
  PluggyConnect?: new (options: PluggyConnectOptions) => PluggyConnectInstance
}

interface PluggyConnectOptions {
  connectToken: string
  includeSandbox?: boolean
  onSuccess: (data: { item: { id: string } }) => void
  onError?: (error: { message?: string }) => void
  onClose?: () => void
}

interface PluggyConnectInstance {
  init: () => void
}
