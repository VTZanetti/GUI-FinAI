import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SummaryCards from '@/components/dashboard/SummaryCards.vue'
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown.vue'
import RecurringCard from '@/components/dashboard/RecurringCard.vue'

const summary = {
  period: { from: '2026-08-01', to: '2026-08-31' },
  totals: { income: 5000, expenses: 2225.02, balance: 2774.98 },
  byCategory: [
    { category: 'Moradia', subcategory: null, amount: 1500, percentage: 67.4 },
    { category: 'Alimentação', subcategory: null, amount: 454.92, percentage: 20.4 }
  ],
  recurring: { amount: 1555.9, percentageOfExpenses: 69.9 }
}

describe('SummaryCards', () => {
  it('exibe receitas, despesas e balanço', () => {
    const wrapper = mount(SummaryCards, { props: { summary } })
    const text = wrapper.text()
    expect(text).toContain('Receitas')
    expect(text).toContain('Despesas')
    expect(text).toContain('Balanço')
    expect(text).toContain('5.000,00')
    expect(text).toContain('2.225,02')
  })

  it('trata summary null', () => {
    const wrapper = mount(SummaryCards, { props: { summary: null } })
    expect(wrapper.findAll('[data-testid="summary-value"]')).toHaveLength(3)
  })
})

describe('CategoryBreakdown', () => {
  it('exibe categorias com percentual', () => {
    const wrapper = mount(CategoryBreakdown, { props: { summary } })
    expect(wrapper.text()).toContain('Moradia')
    expect(wrapper.text()).toContain('67,4%')
  })

  it('mostra vazio sem categorias', () => {
    const wrapper = mount(CategoryBreakdown, { props: { summary: { ...summary, byCategory: [] } } })
    expect(wrapper.text()).toContain('Sem dados')
  })
})

describe('RecurringCard', () => {
  it('exibe valor e percentual recorrente', () => {
    const wrapper = mount(RecurringCard, { props: { summary } })
    expect(wrapper.text()).toContain('1.555,90')
    expect(wrapper.text()).toContain('69,9%')
  })
})
