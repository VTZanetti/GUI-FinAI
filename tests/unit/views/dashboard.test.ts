import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: false }))
vi.mock('@/api/mocks/demoClient', async () => {
  const actual = await vi.importActual<typeof import('@/api/mocks/demoClient')>('@/api/mocks/demoClient')
  return actual
})

import DashboardView from '@/views/dashboard/DashboardView.vue'
import { analyticsService } from '@/api/services/analyticsService'

const summary = {
  period: { from: '2026-08-01', to: '2026-08-31' },
  totals: { income: 5000, expenses: 2000, balance: 3000 },
  byCategory: [{ category: 'Moradia', subcategory: null, amount: 1500, percentage: 75 }],
  recurring: { amount: 1000, percentageOfExpenses: 50 }
}

describe('DashboardView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('carrega spending-summary e exibe cards', async () => {
    const spy = vi.spyOn(analyticsService, 'spendingSummary').mockResolvedValue(summary)
    const wrapper = mount(DashboardView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 30))
    expect(spy).toHaveBeenCalled()
    expect(wrapper.text()).toContain('3.000,00')
    expect(wrapper.text()).toContain('Moradia')
  })

  it('mostra erro amigável', async () => {
    vi.spyOn(analyticsService, 'spendingSummary').mockRejectedValue({
      code: 'ERR_NETWORK',
      message: 'Network Error'
    })
    const wrapper = mount(DashboardView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 30))
    expect(wrapper.text()).toContain('Não foi possível conectar')
  })
})
