import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ToastHost from '@/components/ui/ToastHost.vue'
import { useToast } from '@/composables/useToast'

beforeEach(() => {
  useToast().clear()
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('useToast', () => {
  it('exibe toast de sucesso no host', async () => {
    const toast = useToast()
    toast.success('Tudo certo!')
    mount(ToastHost)
    expect(document.body.textContent).toContain('Tudo certo!')
  })

  it('remove toast via função remove', () => {
    const toast = useToast()
    toast.success('Remover me')
    expect(toast.toasts.value).toHaveLength(1)
    toast.remove(toast.toasts.value[0].id)
    expect(toast.toasts.value).toHaveLength(0)
  })

  it('exibe toast de erro', () => {
    const toast = useToast()
    toast.error('Algo deu errado')
    mount(ToastHost)
    expect(document.body.textContent).toContain('Algo deu errado')
  })
})
