import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: false }))
vi.mock('@/api/mocks/demoClient', async () => {
  const actual = await vi.importActual<typeof import('@/api/mocks/demoClient')>('@/api/mocks/demoClient')
  return actual
})

import ForecastView from '@/views/forecast/ForecastView.vue'
import { forecastService } from '@/api/services/forecastService'

const forecast = {
  method: 'weighted_moving_average',
  generatedAt: '2026-08-11T10:00:00Z',
  forecast: [
    { month: '2026-09', income: 5000, expenses: 2000, balance: 3000 },
    { month: '2026-10', income: 5000, expenses: 2200, balance: 2800 }
  ],
  confidence: { level: 'medium', note: 'Baseado em 12 meses' }
}

describe('ForecastView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('carrega forecast e exibe resumo', async () => {
    const spy = vi.spyOn(forecastService, 'cashFlow').mockResolvedValue(forecast)
    const wrapper = mount(ForecastView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 50))
    expect(spy).toHaveBeenCalledWith(6)
    expect(wrapper.text()).toContain('weighted_moving_average')
    expect(wrapper.text()).toContain('Média')
  })

  it('mostra erro amigável', async () => {
    vi.spyOn(forecastService, 'cashFlow').mockRejectedValue({ code: 'ERR_NETWORK', message: 'Network Error' })
    const wrapper = mount(ForecastView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 50))
    expect(wrapper.text()).toContain('Não foi possível conectar')
  })
})
