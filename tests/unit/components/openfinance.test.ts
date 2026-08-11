import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SyncStatusCard from '@/components/openfinance/SyncStatusCard.vue'
import ConnectionsList from '@/components/openfinance/ConnectionsList.vue'

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

describe('SyncStatusCard', () => {
  it('exibe contagens do último sync', () => {
    const wrapper = mount(SyncStatusCard, { props: { status } })
    expect(wrapper.text()).toContain('Sucesso')
    expect(wrapper.text()).toContain('34')
    expect(wrapper.text()).toContain('2')
    expect(wrapper.text()).toContain('3')
  })

  it('emite sync ao clicar', async () => {
    const wrapper = mount(SyncStatusCard, { props: { status } })
    await wrapper.find('[data-testid="sync-now"]').trigger('click')
    expect(wrapper.emitted('sync')).toHaveLength(1)
  })

  it('mostra estado nunca sincronizado', () => {
    const wrapper = mount(SyncStatusCard, { props: { status: { lastSync: null, schedule: null } } })
    expect(wrapper.text()).toContain('Nunca sincronizado')
  })

  it('mostra erro do sync', () => {
    const failed = {
      lastSync: { ...status.lastSync, status: 'failed', error: 'Pluggy indisponível' },
      schedule: null
    }
    const wrapper = mount(SyncStatusCard, { props: { status: failed } })
    expect(wrapper.text()).toContain('Falhou')
    expect(wrapper.text()).toContain('Pluggy indisponível')
  })
})

describe('ConnectionsList', () => {
  const connections = [
    { id: 'c1', itemId: 'i1', institutionName: 'Banco Demo', status: 'connected', createdAt: '2026-08-10' }
  ]

  it('lista conexões', () => {
    const wrapper = mount(ConnectionsList, { props: { connections } })
    expect(wrapper.text()).toContain('Banco Demo')
    expect(wrapper.text()).toContain('Conectado')
  })

  it('mostra vazio', () => {
    const wrapper = mount(ConnectionsList, { props: { connections: [] } })
    expect(wrapper.text()).toContain('Nenhuma conexão')
  })
})
