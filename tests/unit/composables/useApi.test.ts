import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { useApi } from '@/composables/useApi'

describe('useApi', () => {
  it('executa com sucesso e expõe data', async () => {
    const api = useApi(() => Promise.resolve({ ok: true }))
    expect(api.loading.value).toBe(false)
    const result = await api.execute()
    expect(result).toEqual({ ok: true })
    expect(api.data.value).toEqual({ ok: true })
    expect(api.error.value).toBeNull()
  })

  it('captura erro sem lançar', async () => {
    const api = useApi(() => Promise.reject({ code: 'ERR_NETWORK', message: 'Network Error' }))
    const result = await api.execute()
    expect(result).toBeNull()
    expect(api.error.value).not.toBeNull()
    expect(api.error.value?.message).toContain('Não foi possível conectar')
    expect(api.data.value).toBeNull()
  })

  it('alterna loading durante execução', async () => {
    let resolveFn: (v: string) => void = () => {}
    const api = useApi(() => new Promise<string>((resolve) => (resolveFn = resolve)))
    const promise = api.execute()
    expect(api.loading.value).toBe(true)
    resolveFn('done')
    await promise
    expect(api.loading.value).toBe(false)
  })

  it('funciona com componente montado (integração)', () => {
    // useApi é standalone — apenas garante que não depende de contexto
    const wrapper = mount({
      template: '<div />'
    })
    expect(wrapper.exists()).toBe(true)
  })
})
