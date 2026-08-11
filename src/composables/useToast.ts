import { ref } from 'vue'

export interface ToastItem {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}

const toasts = ref<ToastItem[]>([])
let nextId = 1

function push(type: ToastItem['type'], message: string, duration = 5000): void {
  const id = nextId++
  toasts.value.push({ id, type, message })
  setTimeout(() => remove(id), duration)
}

function remove(id: number): void {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

function clear(): void {
  toasts.value = []
}

/** Fila global de toasts (sucesso/erro/info) — host em App.vue. */
export function useToast() {
  return {
    toasts,
    success(message: string) {
      push('success', message)
    },
    error(message: string) {
      push('error', message)
    },
    info(message: string) {
      push('info', message)
    },
    remove,
    clear
  }
}
