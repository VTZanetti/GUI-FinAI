import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AnomalyBadge from '@/components/anomalies/AnomalyBadge.vue'
import ForecastSummary from '@/components/forecast/ForecastSummary.vue'

describe('AnomalyBadge', () => {
  it('score alto → crítico', () => {
    const wrapper = mount(AnomalyBadge, { props: { score: 0.95 } })
    expect(wrapper.text()).toContain('95%')
    expect(wrapper.text()).toContain('Crítico')
  })

  it('score médio → alto', () => {
    const wrapper = mount(AnomalyBadge, { props: { score: 0.8 } })
    expect(wrapper.text()).toContain('Alto')
  })

  it('score baixo → moderado', () => {
    const wrapper = mount(AnomalyBadge, { props: { score: 0.5 } })
    expect(wrapper.text()).toContain('Moderado')
  })
})

describe('ForecastSummary', () => {
  const forecast = {
    method: 'weighted_moving_average',
    generatedAt: '2026-08-11T10:00:00Z',
    forecast: [{ month: '2026-09', income: 1, expenses: 2, balance: -1 }],
    confidence: { level: 'medium', note: 'Baseado em 12 meses' }
  }

  it('exibe método e confiança', () => {
    const wrapper = mount(ForecastSummary, { props: { forecast } })
    expect(wrapper.text()).toContain('weighted_moving_average')
    expect(wrapper.text()).toContain('Média')
    expect(wrapper.text()).toContain('Baseado em 12 meses')
  })

  it('confiança alta → badge sucesso', () => {
    const wrapper = mount(ForecastSummary, {
      props: { forecast: { ...forecast, confidence: { level: 'high', note: '' } } }
    })
    expect(wrapper.text()).toContain('Alta')
  })
})
