import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import StatusBadge from '@/components/documents/StatusBadge.vue'

describe('ChatMessage', () => {
  it('renderiza mensagem do usuário', () => {
    const wrapper = mount(ChatMessage, { props: { role: 'user', content: 'oi' } })
    expect(wrapper.text()).toContain('oi')
    expect(wrapper.find('[data-testid="chat-user"]').exists()).toBe(true)
  })

  it('renderiza resposta com sources', () => {
    const wrapper = mount(ChatMessage, {
      props: { role: 'assistant', content: 'resposta', sources: ['analytics', 'documents'] }
    })
    expect(wrapper.text()).toContain('resposta')
    expect(wrapper.text()).toContain('analytics')
    expect(wrapper.text()).toContain('documentos')
  })

  it('não mostra sources quando ausentes', () => {
    const wrapper = mount(ChatMessage, {
      props: { role: 'assistant', content: 'ok' }
    })
    expect(wrapper.find('span').exists()).toBe(false)
  })

  it('mostra erro quando error=true', () => {
    const wrapper = mount(ChatMessage, {
      props: { role: 'assistant', content: 'erro', error: true }
    })
    expect(wrapper.text()).toContain('Erro ao obter resposta')
  })
})

describe('ChatInput', () => {
  it('emite send com texto e includeDocuments', async () => {
    const wrapper = mount(ChatInput, { props: { includeDocuments: true } })
    await wrapper.find('[data-testid="chat-input"]').setValue('quanto gastei?')
    await wrapper.find('[data-testid="chat-send"]').trigger('click')
    expect(wrapper.emitted('send')).toEqual([[{ question: 'quanto gastei?', includeDocuments: true }]])
  })

  it('não emite send com texto vazio', async () => {
    const wrapper = mount(ChatInput)
    await wrapper.find('[data-testid="chat-send"]').trigger('click')
    expect(wrapper.emitted('send')).toBeUndefined()
  })

  it('Enter envia', async () => {
    const wrapper = mount(ChatInput)
    await wrapper.find('[data-testid="chat-input"]').setValue('pergunta')
    await wrapper.find('[data-testid="chat-input"]').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('send')).toHaveLength(1)
  })
})

describe('StatusBadge', () => {
  it('mostra Processando', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'processing' } })
    expect(wrapper.text()).toContain('Processando')
  })

  it('mostra Pronto', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'ready' } })
    expect(wrapper.text()).toContain('Pronto')
  })

  it('mostra Falhou', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'failed' } })
    expect(wrapper.text()).toContain('Falhou')
  })
})
