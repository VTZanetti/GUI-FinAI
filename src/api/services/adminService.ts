import type { AdminUser, AuditLog, AuditLogFilters, PagedResponse } from '@/types'
import { ENDPOINTS } from '../endpoints'
import { apiClient } from '../client'
import { withRetry, RETRY_GET_DEFAULT } from '../retry'

export const adminService = {
  async auditLogs(filters: AuditLogFilters = {}): Promise<PagedResponse<AuditLog>> {
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
