import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: false }))
vi.mock('@/api/mocks/demoClient', async () => {
  const actual = await vi.importActual<typeof import('@/api/mocks/demoClient')>('@/api/mocks/demoClient')
  return actual
})

import AccountsView from '@/views/accounts/AccountsView.vue'
import { accountService } from '@/api/services/accountService'
import { categoryService } from '@/api/services/categoryService'

const account = {
  id: 'a1',
  name: 'Nubank',
  type: 'Checking' as const,
  currency: 'BRL',
  initialBalance: 1000,
  currentBalance: 1500,
  createdAt: '2026-01-01'
}

describe('AccountsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('lista contas com saldo', async () => {
    vi.spyOn(accountService, 'list').mockResolvedValue({
      items: [account],
      page: 1,
      pageSize: 50,
      totalItems: 1,
      totalPages: 1
    })
    vi.spyOn(categoryService, 'list').mockResolvedValue([])
    const wrapper = mount(AccountsView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    expect(wrapper.text()).toContain('Nubank')
    expect(wrapper.text()).toContain('1.500,00')
  })

  it('mostra estado vazio', async () => {
    vi.spyOn(accountService, 'list').mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 50,
      totalItems: 0,
      totalPages: 0
    })
    vi.spyOn(categoryService, 'list').mockResolvedValue([])
    const wrapper = mount(AccountsView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    expect(wrapper.text()).toContain('Nenhuma conta')
  })

  it('mostra erro com retry', async () => {
    vi.spyOn(accountService, 'list').mockRejectedValue({ code: 'ERR_NETWORK', message: 'Network Error' })
    vi.spyOn(categoryService, 'list').mockResolvedValue([])
    const wrapper = mount(AccountsView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    expect(wrapper.text()).toContain('Não foi possível conectar')
    expect(wrapper.text()).toContain('Tentar novamente')
  })

  it('cria conta ao salvar modal', async () => {
    const createSpy = vi.spyOn(accountService, 'create').mockResolvedValue({ ...account, id: 'a2' })
    vi.spyOn(accountService, 'list').mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 50,
      totalItems: 0,
      totalPages: 0
    })
    vi.spyOn(categoryService, 'list').mockResolvedValue([])
    const wrapper = mount(AccountsView, { global: { plugins: [createPinia()] } })
    await flushPromises()

    // Abre modal (botão "Nova conta")
    await wrapper.findAll('button')[0].trigger('click')
    await flushPromises()
    await new Promise((r) => setTimeout(r, 20))

    // O Modal usa Teleport → conteúdo em document.body
    const modalRoot = document.body.querySelector('[data-testid="modal-overlay"]') as HTMLElement
    expect(modalRoot).toBeTruthy()

    const nameInput = modalRoot.querySelector('[data-testid="account-name"] input') as HTMLInputElement
    nameInput.value = 'BB'
    nameInput.dispatchEvent(new Event('input', { bubbles: true }))
    const balanceInput = modalRoot.querySelector('[data-testid="account-balance"] input') as HTMLInputElement
    balanceInput.value = '500'
    balanceInput.dispatchEvent(new Event('input', { bubbles: true }))
    await new Promise((r) => setTimeout(r, 20))

    const form = modalRoot.querySelector('form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flushPromises()
    await new Promise((r) => setTimeout(r, 50))

    expect(createSpy).toHaveBeenCalledWith({
      name: 'BB',
      type: 'Checking',
      currency: 'BRL',
      initialBalance: 500
    })
  })
})
