export interface OpenFinanceSyncStatus {
  status: 'running' | 'success' | 'failed' | 'never' | string
  accountsImported: number
  transactionsImported: number
  transactionsSkipped: number
  error?: string | null
  startedAt?: string | null
  finishedAt?: string | null
}

export interface OpenFinanceStatus {
  lastSync: OpenFinanceSyncStatus | null
  schedule?: {
    enabled: boolean
    intervalHours: number
    nextRunAt?: string | null
  } | null
}

export interface OpenFinanceConnection {
  id: string
  itemId: string
  institutionName?: string | null
  status?: string | null
  createdAt: string
}

export interface OpenFinanceConnectionPayload {
  itemId: string
}

export interface OpenFinanceAccount {
  id: string
  name: string
  type: string
  number?: string | null
  balance: number
  currency: string
}
