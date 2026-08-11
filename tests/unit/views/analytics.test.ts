import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: false }))
vi.mock('@/api/mocks/demoClient', async () => {
  const actual = await vi.importActual<typeof import('@/api/mocks/demoClient')>('@/api/mocks/demoClient')
  return actual
})

import AnalyticsView from '@/views/analytics/AnalyticsView.vue'
import { analyticsService } from '@/api/services/analyticsService'
import BehaviorInsights from '@/components/analytics/BehaviorInsights.vue'

const insights = [
  {
    type: 'category_increase',
    category: 'Alimentação',
    metric: 'total_expenses',
    currentValue: 500,
    previousValue: 300,
    changePercent: 66.7,
    value: null,
    message: 'Seus gastos com Alimentação aumentaram 66,7%.'
  }
]

const trend = {
  months: [
    { month: '2026-07', income: 5000, expenses: 1800, balance: 3200 },
    { month: '2026-08', income: 5000, expenses: 2000, balance: 3000 }
  ]
}

describe('AnalyticsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('carrega behavior e monthly-trend', async () => {
    vi.spyOn(analyticsService, 'behavior').mockResolvedValue(insights)
    vi.spyOn(analyticsService, 'monthlyTrend').mockResolvedValue(trend)
    const wrapper = mount(AnalyticsView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 50))
    expect(wrapper.text()).toContain('Alimentação')
    expect(wrapper.text()).toContain('Tendência mensal')
  })

  it('mostra erro amigável', async () => {
    vi.spyOn(analyticsService, 'behavior').mockRejectedValue({ code: 'ERR_NETWORK', message: 'Network Error' })
    vi.spyOn(analyticsService, 'monthlyTrend').mockRejectedValue({ code: 'ERR_NETWORK', message: 'Network Error' })
    const wrapper = mount(AnalyticsView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 50))
    expect(wrapper.text()).toContain('Não foi possível conectar')
  })
})

describe('BehaviorInsights', () => {
  it('renderiza mensagens de insights', () => {
    const wrapper = mount(BehaviorInsights, { props: { insights } })
    expect(wrapper.text()).toContain('aumentaram 66,7%')
  })

  it('mostra vazio', () => {
    const wrapper = mount(BehaviorInsights, { props: { insights: [] } })
    expect(wrapper.text()).toContain('Sem insights')
  })
})
