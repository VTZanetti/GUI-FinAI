export interface AuditLog {
  id: string
  userId: string
  action: string
  entityType: string
  entityId?: string | null
  metadata?: Record<string, unknown> | null
  ipAddress?: string | null
  occurredAt: string
}

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  createdAt: string
  roles: string[]
}

export interface AuditLogFilters {
  page?: number
  pageSize?: number
  action?: string
  userId?: string
  from?: string
  to?: string
}
