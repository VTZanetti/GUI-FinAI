import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: false }))
vi.mock('@/api/mocks/demoClient', async () => {
  const actual = await vi.importActual<typeof import('@/api/mocks/demoClient')>('@/api/mocks/demoClient')
  return actual
})

import AnomaliesView from '@/views/anomalies/AnomaliesView.vue'
import AnomalyTable from '@/components/anomalies/AnomalyTable.vue'
import { anomalyService } from '@/api/services/anomalyService'

const anomalies = {
  method: 'zscore',
  items: [
    {
      transactionId: 't1',
      description: 'Supermercado Extra',
      amount: -386.42,
      date: '2026-07-22',
      category: 'Alimentação',
      anomaly: true,
      score: 0.91,
      reason: 'Valor acima da média'
    }
  ]
}

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/transactions', name: 'transactions', component: { template: '<div />' } },
      { path: '/', redirect: '/transactions' }
    ]
  })
}

describe('AnomaliesView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('carrega e exibe anomalias com score', async () => {
    vi.spyOn(anomalyService, 'list').mockResolvedValue(anomalies)
    const wrapper = mount(AnomaliesView, { global: { plugins: [createPinia(), makeRouter()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 50))
    expect(wrapper.text()).toContain('Supermercado Extra')
    expect(wrapper.text()).toContain('91%')
  })

  it('mostra estado vazio', async () => {
    vi.spyOn(anomalyService, 'list').mockResolvedValue({ method: 'zscore', items: [] })
    const wrapper = mount(AnomaliesView, { global: { plugins: [createPinia(), makeRouter()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 50))
    expect(wrapper.text()).toContain('Nenhuma anomalia')
  })
})

describe('AnomalyTable', () => {
  it('navega para transações ao clicar (com router real)', async () => {
    const { createRouter, createMemoryHistory } = await import('vue-router')
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/transactions', name: 'transactions', component: { template: '<div />' } },
        { path: '/', redirect: '/transactions' }
      ]
    })
    await router.push('/transactions')
    const wrapper = mount(AnomalyTable, {
      props: { items: anomalies.items },
      global: { plugins: [router] }
    })
    await wrapper.find('tbody tr').trigger('click')
    await flushPromises()
    await new Promise((r) => setTimeout(r, 100))
    // A rota atual deve ser transactions com query search
    const current = router.currentRoute.value
    expect(current.name).toBe('transactions')
    expect(String(current.query.search ?? '')).toContain('Supermercado')
  })
})
