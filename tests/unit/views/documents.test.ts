import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: false }))
vi.mock('@/api/mocks/demoClient', async () => {
  const actual = await vi.importActual<typeof import('@/api/mocks/demoClient')>('@/api/mocks/demoClient')
  return actual
})

import DocumentsView from '@/views/documents/DocumentsView.vue'
import { documentService } from '@/api/services/documentService'

const doc = {
  id: 'd1',
  fileName: 'extrato.pdf',
  contentType: 'application/pdf',
  status: 'ready' as const,
  uploadedAt: '2026-08-10T10:00:00Z',
  failureReason: null
}

describe('DocumentsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('lista documentos com status', async () => {
    vi.spyOn(documentService, 'list').mockResolvedValue([doc])
    const wrapper = mount(DocumentsView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 30))
    expect(wrapper.text()).toContain('extrato.pdf')
    expect(wrapper.text()).toContain('Pronto')
  })

  it('mostra estado vazio', async () => {
    vi.spyOn(documentService, 'list').mockResolvedValue([])
    const wrapper = mount(DocumentsView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 30))
    expect(wrapper.text()).toContain('Nenhum documento')
  })

  it('rejeita upload > 20MB', async () => {
    vi.spyOn(documentService, 'list').mockResolvedValue([])
    const uploadSpy = vi.spyOn(documentService, 'upload')
    const wrapper = mount(DocumentsView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 30))

    const bigFile = new File([new ArrayBuffer(21 * 1024 * 1024)], 'big.pdf')
    const uploadComp = wrapper.findComponent({ name: 'DocumentUpload' })
    uploadComp.vm.$emit('upload', bigFile)
    await flushPromises()
    expect(uploadSpy).not.toHaveBeenCalled()
  })
})
