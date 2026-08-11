import type { AdminUser, AuditLog, AuditLogFilters, PagedResponse } from '@/types'
import { ENDPOINTS } from '../endpoints'
import { apiClient } from '../client'
import { withRetry, RETRY_GET_DEFAULT } from '../retry'
import { IS_DEMO_MODE } from '../mocks'

export const adminService = {
  async auditLogs(filters: AuditLogFilters = {}): Promise<PagedResponse<AuditLog>> {
    if (IS_DEMO_MODE) {
      return {
        items: [
          {
            id: 'demo-1',
            userId: 'demo-user',
            action: 'transaction.create',
            entityType: 'Transaction',
            entityId: 'tx-1',
            metadata: { amount: '***' },
            ipAddress: '127.0.0.1',
            occurredAt: new Date().toISOString()
          }
        ],
        page: 1,
        pageSize: 50,
        totalItems: 1,
        totalPages: 1
      }
    }
    const params: Record<string, string | number> = {}
    if (filters.page) params.page = filters.page
    if (filters.pageSize) params.pageSize = filters.pageSize
    if (filters.action) params.action = filters.action
    if (filters.userId) params.userId = filters.userId
    if (filters.from) params.from = filters.from
    if (filters.to) params.to = filters.to
    const data = await withRetry(
      () => apiClient.get<PagedResponse<Record<string, unknown>>>(ENDPOINTS.admin.auditLogs, { params }),
      RETRY_GET_DEFAULT
    )
    const raw = data.data
    return {
      items: (raw.items ?? []).map((log) => ({
        id: String(log.id ?? ''),
        userId: String(log.userId ?? ''),
        action: String(log.action ?? ''),
        entityType: String(log.entityType ?? ''),
        entityId: log.entityId ? String(log.entityId) : null,
        metadata: log.metadata && typeof log.metadata === 'object' ? (log.metadata as Record<string, unknown>) : null,
        ipAddress: log.ipAddress ? String(log.ipAddress) : null,
        occurredAt: String(log.occurredAt ?? '')
      })),
      page: raw.page ?? 1,
      pageSize: raw.pageSize ?? 50,
      totalItems: raw.totalItems ?? 0,
      totalPages: raw.totalPages ?? 0
    }
  },

  async users(): Promise<AdminUser[]> {
    if (IS_DEMO_MODE) {
      return [
        {
          id: 'demo-user',
          email: 'demo@finai.local',
          firstName: 'Demonstração',
          lastName: 'FinAI',
          createdAt: new Date().toISOString(),
          roles: ['User']
        }
      ]
    }
    const data = await withRetry(() => apiClient.get<Record<string, unknown>[]>(ENDPOINTS.admin.users), RETRY_GET_DEFAULT)
    return (data.data ?? []).map((u) => ({
      id: String(u.id ?? ''),
      email: String(u.email ?? ''),
      firstName: String(u.firstName ?? ''),
      lastName: String(u.lastName ?? ''),
      createdAt: String(u.createdAt ?? ''),
      roles: Array.isArray(u.roles) ? u.roles.map(String) : []
    }))
  }
}
