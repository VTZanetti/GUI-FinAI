import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: false }))
vi.mock('@/api/mocks/demoClient', async () => {
  const actual = await vi.importActual<typeof import('@/api/mocks/demoClient')>('@/api/mocks/demoClient')
  return actual
})

import TransactionsView from '@/views/transactions/TransactionsView.vue'
import { transactionService } from '@/api/services/transactionService'
import { accountService } from '@/api/services/accountService'
import { categoryService } from '@/api/services/categoryService'
import { aiService } from '@/api/services/aiService'

const account = {
  id: 'a1',
  name: 'Nubank',
  type: 'Checking' as const,
  currency: 'BRL',
  initialBalance: 0,
  currentBalance: 0,
  createdAt: ''
}

const category = { id: 'c1', name: 'Alimentação', subcategory: null, isSystem: true }

const tx = {
  id: 't1',
  accountId: 'a1',
  description: 'UBER *TRIP',
  amount: -27.9,
  date: '2026-08-10',
  category: { name: 'Transporte' },
  classification: { confidence: 0.94, source: 'llm' as const },
  isRecurring: false,
  createdAt: '2026-08-10'
}

describe('TransactionsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('lista transações com badge de classificação', async () => {
    vi.spyOn(transactionService, 'list').mockResolvedValue({
      items: [tx],
      page: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1
    })
    vi.spyOn(accountService, 'list').mockResolvedValue({
      items: [account],
      page: 1,
      pageSize: 50,
      totalItems: 1,
      totalPages: 1
    })
    vi.spyOn(categoryService, 'list').mockResolvedValue([category])
    const wrapper = mount(TransactionsView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 20))
    expect(wrapper.text()).toContain('UBER *TRIP')
    expect(wrapper.text()).toContain('IA')
    expect(wrapper.text()).toContain('94%')
  })

  it('exibe erro com retry', async () => {
    vi.spyOn(transactionService, 'list').mockRejectedValue({ code: 'ERR_NETWORK', message: 'Network Error' })
    vi.spyOn(accountService, 'list').mockResolvedValue({ items: [], page: 1, pageSize: 50, totalItems: 0, totalPages: 0 })
    vi.spyOn(categoryService, 'list').mockResolvedValue([])
    const wrapper = mount(TransactionsView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 20))
    expect(wrapper.text()).toContain('Não foi possível conectar')
  })

  it('botão Classificar chama aiService.classify', async () => {
    vi.spyOn(transactionService, 'list').mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0
    })
    vi.spyOn(accountService, 'list').mockResolvedValue({
      items: [account],
      page: 1,
      pageSize: 50,
      totalItems: 1,
      totalPages: 1
    })
    vi.spyOn(categoryService, 'list').mockResolvedValue([category])
    const classifySpy = vi
      .spyOn(aiService, 'classify')
      .mockResolvedValue({ category: 'Transporte', subcategory: null, confidence: 0.9, source: 'llm' })

    const wrapper = mount(TransactionsView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 20))

    // Abre modal
    await wrapper.findAll('button')[0].trigger('click')
    await flushPromises()
    await new Promise((r) => setTimeout(r, 20))

    const modalRoot = document.body.querySelector('[data-testid="modal-overlay"]') as HTMLElement
    expect(modalRoot).toBeTruthy()

    // Preenche descrição, valor e data
    const descInput = modalRoot.querySelector('[data-testid="tx-description"] input') as HTMLInputElement
    descInput.value = 'UBER *TRIP'
    descInput.dispatchEvent(new Event('input', { bubbles: true }))
    const amountInput = modalRoot.querySelector('[data-testid="tx-amount"] input') as HTMLInputElement
    amountInput.value = '-27.9'
    amountInput.dispatchEvent(new Event('input', { bubbles: true }))
    const dateInput = modalRoot.querySelector('[data-testid="tx-date"] input') as HTMLInputElement
    dateInput.value = '2026-08-10'
    dateInput.dispatchEvent(new Event('input', { bubbles: true }))
    await new Promise((r) => setTimeout(r, 20))

    // Clica "Classificar" (botão com texto)
    const buttons = Array.from(modalRoot.querySelectorAll('button'))
    const classifyBtn = buttons.find((b) => b.textContent?.includes('Classificar'))
    expect(classifyBtn).toBeTruthy()
    classifyBtn?.click()
    await flushPromises()
    await new Promise((r) => setTimeout(r, 50))

    expect(classifySpy).toHaveBeenCalledWith({ description: 'UBER *TRIP', amount: -27.9 })
  })
})
