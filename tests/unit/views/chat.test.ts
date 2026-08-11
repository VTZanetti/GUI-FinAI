import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: false }))
vi.mock('@/api/mocks/demoClient', async () => {
  const actual = await vi.importActual<typeof import('@/api/mocks/demoClient')>('@/api/mocks/demoClient')
  return actual
})

import ChatView from '@/views/ai/ChatView.vue'
import { aiService } from '@/api/services/aiService'

describe('ChatView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('envia pergunta e exibe resposta com sources', async () => {
    vi.spyOn(aiService, 'financialAdvisor').mockResolvedValue({
      answer: 'Seus gastos aumentaram 10%.',
      context: { period: 'Último mês' },
      sources: ['analytics', 'documents']
    })
    const wrapper = mount(ChatView, { global: { plugins: [createPinia()] } })

    await wrapper.find('[data-testid="chat-input"]').setValue('quanto gastei?')
    await wrapper.find('[data-testid="chat-send"]').trigger('click')
    await flushPromises()
    await new Promise((r) => setTimeout(r, 50))

    expect(wrapper.text()).toContain('quanto gastei?')
    expect(wrapper.text()).toContain('aumentaram 10%')
    expect(wrapper.text()).toContain('analytics')
  })

  it('trata 503 com mensagem amigável', async () => {
    vi.spyOn(aiService, 'financialAdvisor').mockRejectedValue({
      response: { status: 503, data: { title: 'AI assistant unavailable', status: 503 } }
    })
    const wrapper = mount(ChatView, { global: { plugins: [createPinia()] } })

    await wrapper.find('[data-testid="chat-input"]').setValue('teste')
    await wrapper.find('[data-testid="chat-send"]').trigger('click')
    await flushPromises()
    await new Promise((r) => setTimeout(r, 50))

    expect(wrapper.text()).toContain('Serviço indisponível')
  })
})
