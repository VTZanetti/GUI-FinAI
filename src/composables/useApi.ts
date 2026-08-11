import { ref, shallowRef, type Ref } from 'vue'
import { toApiError } from '@/api/errorService'
import type { ApiError } from '@/api/error'

export interface UseApiState<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<ApiError | null>
  execute: (() => Promise<T | null>) & { reset: () => void }
}

/**
 * Wrapper padronizado para chamadas de API: { data, loading, error, execute }.
 * Nunca lança — o erro fica em `error` (mensagem amigável já resolvida).
 */
export function useApi<T>(fn: () => Promise<T>): {
  data: Readonly<Ref<T | null>>
  loading: Readonly<Ref<boolean>>
  error: Readonly<Ref<ApiError | null>>
  execute: () => Promise<T | null>
} {
  const data = shallowRef<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  async function execute(): Promise<T | null> {
    loading.value = true
    error.value = null
    try {
      const result = await fn()
      data.value = result
      return result
    } catch (err) {
      error.value = toApiError(err)
      return null
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, execute }
}
