import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: false }))
vi.mock('@/api/mocks/demoClient', async () => {
  const actual = await vi.importActual<typeof import('@/api/mocks/demoClient')>('@/api/mocks/demoClient')
  return actual
})

import AdminView from '@/views/admin/AdminView.vue'
import AuditLogTable from '@/components/admin/AuditLogTable.vue'
import UsersTable from '@/components/admin/UsersTable.vue'
import { adminService } from '@/api/services/adminService'

const log = {
  id: '1',
  userId: 'user-1',
  action: 'transaction.create',
  entityType: 'Transaction',
  entityId: 'tx-1',
  metadata: { amount: '***' },
  ipAddress: '127.0.0.1',
  occurredAt: '2026-08-10T10:00:00Z'
}

const user = {
  id: 'u1',
  email: 'ana@test.com',
  firstName: 'Ana',
  lastName: 'Silva',
  createdAt: '2026-01-01',
  roles: ['Admin']
}

describe('AdminView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('alterna entre audit logs e usuários', async () => {
    vi.spyOn(adminService, 'auditLogs').mockResolvedValue({
      items: [log],
      page: 1,
      pageSize: 50,
      totalItems: 1,
      totalPages: 1
    })
    vi.spyOn(adminService, 'users').mockResolvedValue([user])
    const wrapper = mount(AdminView, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 30))
    expect(wrapper.text()).toContain('transaction.create')

    await wrapper.find('[data-testid="tab-users"]').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Usuários')
  })
})

describe('AuditLogTable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('lista audit logs com metadata mascarado', async () => {
    vi.spyOn(adminService, 'auditLogs').mockResolvedValue({
      items: [log],
      page: 1,
      pageSize: 50,
      totalItems: 1,
      totalPages: 1
    })
    const wrapper = mount(AuditLogTable, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 30))
    expect(wrapper.text()).toContain('transaction.create')
    expect(wrapper.text()).toContain('***')
  })

  it('mostra estado vazio', async () => {
    vi.spyOn(adminService, 'auditLogs').mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 50,
      totalItems: 0,
      totalPages: 0
    })
    const wrapper = mount(AuditLogTable, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 30))
    expect(wrapper.text()).toContain('Nenhum log')
  })
})

describe('UsersTable', () => {
  it('lista usuários com papéis', async () => {
    setActivePinia(createPinia())
    vi.spyOn(adminService, 'users').mockResolvedValue([user])
    const wrapper = mount(UsersTable, { global: { plugins: [createPinia()] } })
    await flushPromises()
    await new Promise((r) => setTimeout(r, 30))
    expect(wrapper.text()).toContain('ana@test.com')
    expect(wrapper.text()).toContain('Admin')
  })
})
