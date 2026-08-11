import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: false }))
vi.mock('@/api/mocks/demoClient', async () => {
  const actual = await vi.importActual<typeof import('@/api/mocks/demoClient')>('@/api/mocks/demoClient')
  return actual
})

import BudgetsView from '@/views/budgets/BudgetsView.vue'
import { budgetService } from '@/api/services/budgetService'
import { categoryService } from '@/api/services/categoryService'

const budget = {
  id: 'b1',
  categoryId: 'c1',
  month: 8,
  year: 2026,
  limitAmount: 1200,
  spentAmount: 812.4,
  progressPercent: 67.7,
  categoryName: 'Alimentação'
}

describe('BudgetsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('lista orçamentos com progresso', async () => {
    vi.spyOn(budgetService, 'list').mockResolvedValue([budget])
    vi.spyOn(categoryService, 'list').mockResolvedValue([])
    const wrapper = mount(BudgetsView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 20))
    expect(wrapper.text()).toContain('Alimentação')
    expect(wrapper.text()).toContain('67,7%')
  })

  it('mostra estado vazio', async () => {
    vi.spyOn(budgetService, 'list').mockResolvedValue([])
    vi.spyOn(categoryService, 'list').mockResolvedValue([])
    const wrapper = mount(BudgetsView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 20))
    expect(wrapper.text()).toContain('Nenhum orçamento')
  })

  it('cria orçamento', async () => {
    const createSpy = vi
      .spyOn(budgetService, 'create')
      .mockResolvedValue({ ...budget, limitAmount: 500, progressPercent: 0 })
    vi.spyOn(budgetService, 'list').mockResolvedValue([])
    vi.spyOn(categoryService, 'list').mockResolvedValue([{ id: 'c2', name: 'Lazer', subcategory: null, isSystem: false }])
    const wrapper = mount(BudgetsView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 20))

    // Abre modal
    await wrapper.findAll('button')[0].trigger('click')
    await flushPromises()
    await new Promise((r) => setTimeout(r, 20))

    const modalRoot = document.body.querySelector('[data-testid="modal-overlay"]') as HTMLElement
    expect(modalRoot).toBeTruthy()

    // Seleciona categoria
    const select = modalRoot.querySelector('select') as HTMLSelectElement
    select.value = 'c2'
    select.dispatchEvent(new Event('change', { bubbles: true }))

    const limitInput = modalRoot.querySelector('[data-testid="budget-limit"] input') as HTMLInputElement
    limitInput.value = '500'
    limitInput.dispatchEvent(new Event('input', { bubbles: true }))
    await new Promise((r) => setTimeout(r, 20))

    const form = modalRoot.querySelector('form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flushPromises()
    await new Promise((r) => setTimeout(r, 50))

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ limitAmount: 500, categoryId: 'c2' })
    )
  })
})
