import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: false }))
vi.mock('@/api/mocks/demoClient', async () => {
  const actual = await vi.importActual<typeof import('@/api/mocks/demoClient')>('@/api/mocks/demoClient')
  return actual
})

import OpenFinanceView from '@/views/openfinance/OpenFinanceView.vue'
import PluggyConnectButton from '@/components/openfinance/PluggyConnectButton.vue'
import { openFinanceService } from '@/api/services/openFinanceService'

const status = {
  lastSync: {
    status: 'success',
    accountsImported: 2,
    transactionsImported: 34,
    transactionsSkipped: 3,
    error: null,
    startedAt: '2026-08-10T10:00:00Z',
    finishedAt: '2026-08-10T10:05:00Z'
  },
  schedule: { enabled: false, intervalHours: 24, nextRunAt: null }
}

describe('OpenFinanceView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('carrega status e conexões', async () => {
    vi.spyOn(openFinanceService, 'status').mockResolvedValue(status)
    vi.spyOn(openFinanceService, 'listConnections').mockResolvedValue([])
    const wrapper = mount(OpenFinanceView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 30))
    expect(wrapper.text()).toContain('Sucesso')
    expect(wrapper.text()).toContain('Conectar banco')
  })

  it('mostra erro amigável', async () => {
    vi.spyOn(openFinanceService, 'status').mockRejectedValue({ code: 'ERR_NETWORK', message: 'Network Error' })
    vi.spyOn(openFinanceService, 'listConnections').mockRejectedValue({ code: 'ERR_NETWORK', message: 'Network Error' })
    const wrapper = mount(OpenFinanceView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 30))
    expect(wrapper.text()).toContain('Não foi possível conectar')
  })

  it('sincronizar agora chama sync', async () => {
    vi.spyOn(openFinanceService, 'status').mockResolvedValue(status)
    vi.spyOn(openFinanceService, 'listConnections').mockResolvedValue([])
    const syncSpy = vi.spyOn(openFinanceService, 'sync').mockResolvedValue({ status: 'started' })
    const wrapper = mount(OpenFinanceView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 30))
    await wrapper.find('[data-testid="sync-now"]').trigger('click')
    await flushPromises()
    expect(syncSpy).toHaveBeenCalled()
  })
})

describe('PluggyConnectButton', () => {
  it('chama connectToken ao clicar', async () => {
    const connectSpy = vi.spyOn(openFinanceService, 'connectToken').mockResolvedValue({ accessToken: 'tok' })
    const wrapper = mount(PluggyConnectButton, { global: { plugins: [createPinia()] } })
    await wrapper.find('[data-testid="connect-bank"]').trigger('click')
    await flushPromises()
    expect(connectSpy).toHaveBeenCalled()
  })
})
