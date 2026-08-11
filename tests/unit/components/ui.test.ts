import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DataState from '@/components/ui/DataState.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import Badge from '@/components/ui/Badge.vue'

describe('DataState', () => {
  it('renderiza loading', () => {
    const wrapper = mount(DataState, { props: { loading: true } })
    expect(wrapper.text()).toContain('Carregando')
  })

  it('renderiza erro com botão retry', async () => {
    const wrapper = mount(DataState, { props: { error: 'Erro de teste' } })
    expect(wrapper.text()).toContain('Erro de teste')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('renderiza empty', () => {
    const wrapper = mount(DataState, { props: { empty: true, emptyTitle: 'Sem dados' } })
    expect(wrapper.text()).toContain('Sem dados')
  })

  it('renderiza slot quando tem dados', () => {
    const wrapper = mount(DataState, {
      slots: { default: '<p>conteúdo</p>' }
    })
    expect(wrapper.text()).toContain('conteúdo')
  })
})

describe('ProgressBar', () => {
  it('renderiza percentual', () => {
    const wrapper = mount(ProgressBar, { props: { percent: 67.7 } })
    expect(wrapper.text()).toContain('67,7%')
  })

  it('usa classe danger acima de 100', () => {
    const wrapper = mount(ProgressBar, { props: { percent: 120 } })
    expect(wrapper.find('[data-testid="progress-bar"]').classes()).toContain('bg-danger')
  })

  it('usa classe warning entre 80 e 100', () => {
    const wrapper = mount(ProgressBar, { props: { percent: 90 } })
    expect(wrapper.find('[data-testid="progress-bar"]').classes()).toContain('bg-warning')
  })

  it('usa classe success abaixo de 80', () => {
    const wrapper = mount(ProgressBar, { props: { percent: 40 } })
    expect(wrapper.find('[data-testid="progress-bar"]').classes()).toContain('bg-success')
  })
})

describe('Badge', () => {
  it('renderiza texto', () => {
    const wrapper = mount(Badge, { props: { variant: 'info' }, slots: { default: 'LLM' } })
    expect(wrapper.text()).toBe('LLM')
  })

  it('aplica variante danger', () => {
    const wrapper = mount(Badge, { props: { variant: 'danger' }, slots: { default: 'x' } })
    expect(wrapper.classes()).toContain('bg-danger/10')
  })
})
