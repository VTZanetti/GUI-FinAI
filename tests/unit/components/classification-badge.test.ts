import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ClassificationBadge from '@/components/transactions/ClassificationBadge.vue'

describe('ClassificationBadge', () => {
  it('mostra rótulo IA para llm', () => {
    const wrapper = mount(ClassificationBadge, { props: { source: 'llm', confidence: 0.94 } })
    expect(wrapper.text()).toContain('IA')
    expect(wrapper.text()).toContain('94%')
  })

  it('mostra rótulo Regras', () => {
    const wrapper = mount(ClassificationBadge, { props: { source: 'rules' } })
    expect(wrapper.text()).toContain('Regras')
  })

  it('mostra rótulo Cache', () => {
    const wrapper = mount(ClassificationBadge, { props: { source: 'cached' } })
    expect(wrapper.text()).toContain('Cache')
  })

  it('mostra rótulo Externo', () => {
    const wrapper = mount(ClassificationBadge, { props: { source: 'external' } })
    expect(wrapper.text()).toContain('Externo')
  })
})
