import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analyticsService } from '@/api/services/analyticsService'
import { forecastService } from '@/api/services/forecastService'
import { anomalyService } from '@/api/services/anomalyService'
import { aiService } from '@/api/services/aiService'
import { documentService } from '@/api/services/documentService'
import { adminService } from '@/api/services/adminService'
import { openFinanceService } from '@/api/services/openFinanceService'
import { apiClient } from '@/api/client'

vi.mock('@/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/client')>()
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }
  }
})

vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: false }))

const mockGet = apiClient.get as ReturnType<typeof vi.fn>
const mockPost = apiClient.post as ReturnType<typeof vi.fn>
const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>

describe('analyticsService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('spendingSummary normaliza', async () => {
    mockGet.mockResolvedValue({
      data: {
        period: { from: '2026-01-01', to: '2026-08-10' },
        totals: { income: 5000, expenses: 2000, balance: 3000 },
        byCategory: [{ category: 'A', subcategory: null, amount: 100, percentage: 5 }],
        recurring: { amount: 500, percentageOfExpenses: 25 }
      }
    })
    const s = await analyticsService.spendingSummary({ from: '2026-01-01', to: '2026-08-10' })
    expect(s.totals.balance).toBe(3000)
    expect(mockGet).toHaveBeenCalledWith('/analytics/spending-summary', expect.objectContaining({ params: { from: '2026-01-01', to: '2026-08-10' } }))
  })

  it('behavior normaliza insights', async () => {
    mockGet.mockResolvedValue({ data: { insights: [{ type: 'x', metric: 'm', currentValue: 1, previousValue: 2, message: 'msg' }] } })
    const insights = await analyticsService.behavior(3)
    expect(insights[0].metric).toBe('m')
    expect(mockGet).toHaveBeenCalledWith('/analytics/behavior', expect.objectContaining({ params: { months: 3 } }))
  })

  it('monthlyTrend normaliza', async () => {
    mockGet.mockResolvedValue({ data: { months: [{ month: '2026-08', income: 1, expenses: 2, balance: -1 }] } })
    const t = await analyticsService.monthlyTrend(12)
    expect(t.months).toHaveLength(1)
  })
})

describe('forecastService', () => {
  it('cashFlow normaliza', async () => {
    mockGet.mockResolvedValue({
      data: {
        method: 'weighted_moving_average',
        generatedAt: '2026-08-11',
        forecast: [{ month: '2026-09', income: 1, expenses: 2, balance: -1 }],
        confidence: { level: 'medium', note: 'ok' }
      }
    })
    const f = await forecastService.cashFlow(6)
    expect(f.method).toBe('weighted_moving_average')
    expect(mockGet).toHaveBeenCalledWith('/forecast/cash-flow', expect.objectContaining({ params: { months: 6 } }))
  })
})

describe('anomalyService', () => {
  it('list com filtros', async () => {
    mockGet.mockResolvedValue({ data: { method: 'zscore', items: [] } })
    const r = await anomalyService.list({ from: '2026-01-01', to: '2026-08-10', method: 'zscore' })
    expect(r.method).toBe('zscore')
    expect(mockGet).toHaveBeenCalledWith('/anomalies', expect.objectContaining({ params: { from: '2026-01-01', to: '2026-08-10', method: 'zscore' } }))
  })

  it('check envia payload', async () => {
    mockPost.mockResolvedValue({ data: { anomaly: true, score: 0.9, reason: 'r', suggestedAction: 'review', method: 'zscore' } })
    const c = await anomalyService.check({ description: 'x', amount: -100 })
    expect(c.anomaly).toBe(true)
    expect(mockPost).toHaveBeenCalledWith('/anomalies/check', { description: 'x', amount: -100 })
  })
})

describe('aiService', () => {
  it('classify normaliza', async () => {
    mockPost.mockResolvedValue({ data: { category: 'Alimentação', subcategory: null, confidence: 0.85, source: 'llm' } })
    const c = await aiService.classify({ description: 'IFOOD', amount: -50 })
    expect(c.source).toBe('llm')
  })

  it('financialAdvisor normaliza sources', async () => {
    mockPost.mockResolvedValue({ data: { answer: 'resposta', context: { period: 'x' }, sources: ['analytics', 'documents'] } })
    const a = await aiService.financialAdvisor({ question: 'q?', includeDocuments: true })
    expect(a.sources).toContain('documents')
    expect(a.answer).toBe('resposta')
  })
})

describe('documentService', () => {
  it('list normaliza', async () => {
    mockGet.mockResolvedValue({ data: [{ id: 'd', fileName: 'a.pdf', contentType: 'pdf', status: 'ready', uploadedAt: 'x' }] })
    const docs = await documentService.list()
    expect(docs[0].status).toBe('ready')
  })

  it('upload envia FormData', async () => {
    mockPost.mockResolvedValue({ data: { id: 'd', fileName: 'b.pdf', contentType: 'pdf', status: 'processing', uploadedAt: 'x' } })
    const file = new File(['content'], 'b.pdf', { type: 'application/pdf' })
    const up = await documentService.upload(file)
    expect(up.fileName).toBe('b.pdf')
    expect(mockPost).toHaveBeenCalledWith('/documents', expect.any(FormData), expect.objectContaining({ timeout: 120000 }))
  })

  it('upload tolera campos ausentes na resposta', async () => {
    mockPost.mockResolvedValue({ data: {} })
    const file = new File(['x'], 'c.pdf', { type: 'application/pdf' })
    const up = await documentService.upload(file)
    expect(up.fileName).toBe('c.pdf')
    expect(up.status).toBe('processing')
  })

  it('remove chama delete', async () => {
    mockDelete.mockResolvedValue({ data: undefined })
    await documentService.remove('d')
    expect(mockDelete).toHaveBeenCalledWith('/documents/d')
  })
})

describe('adminService', () => {
  it('auditLogs normaliza paginação', async () => {
    mockGet.mockResolvedValue({
      data: {
        items: [{ id: '1', userId: 'u', action: 'transaction.create', entityType: 'Transaction', occurredAt: 'x' }],
        page: 1, pageSize: 50, totalItems: 1, totalPages: 1
      }
    })
    const logs = await adminService.auditLogs({ page: 1, pageSize: 50, action: 'transaction.create' })
    expect(logs.items[0].action).toBe('transaction.create')
    expect(mockGet).toHaveBeenCalledWith('/admin/audit-logs', expect.objectContaining({ params: { page: 1, pageSize: 50, action: 'transaction.create' } }))
  })

  it('auditLogs sem filtros usa default', async () => {
    mockGet.mockResolvedValue({ data: { items: [], page: 1, pageSize: 50, totalItems: 0, totalPages: 0 } })
    const logs = await adminService.auditLogs()
    expect(logs.totalItems).toBe(0)
  })

  it('auditLogs inclui entityId/metadata quando presentes', async () => {
    mockGet.mockResolvedValue({
      data: {
        items: [{ id: '1', userId: 'u', action: 'a', entityType: 'T', entityId: 'e1', metadata: { amount: '***' }, ipAddress: '127.0.0.1', occurredAt: 'x' }],
        page: 1, pageSize: 50, totalItems: 1, totalPages: 1
      }
    })
    const logs = await adminService.auditLogs()
    expect(logs.items[0].entityId).toBe('e1')
    expect(logs.items[0].metadata?.amount).toBe('***')
  })

  it('users normaliza', async () => {
    mockGet.mockResolvedValue({ data: [{ id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', createdAt: 'x', roles: ['User'] }] })
    const users = await adminService.users()
    expect(users[0].roles).toEqual(['User'])
  })
})

describe('openFinanceService', () => {
  it('status normaliza', async () => {
    mockGet.mockResolvedValue({ data: { lastSync: { status: 'success', accountsImported: 1, transactionsImported: 2, transactionsSkipped: 0 }, schedule: null } })
    const s = await openFinanceService.status()
    expect(s.lastSync?.transactionsImported).toBe(2)
  })

  it('connectToken retorna accessToken', async () => {
    mockPost.mockResolvedValue({ data: { accessToken: 'tok' } })
    const t = await openFinanceService.connectToken()
    expect(t.accessToken).toBe('tok')
  })

  it('listConnections e linkConnection', async () => {
    mockGet.mockResolvedValue({ data: [{ id: 'c', itemId: 'i', createdAt: 'x' }] })
    const conns = await openFinanceService.listConnections()
    expect(conns[0].itemId).toBe('i')
    mockPost.mockResolvedValue({ data: { id: 'c2', itemId: 'i2', createdAt: 'y' } })
    const linked = await openFinanceService.linkConnection({ itemId: 'i2' })
    expect(linked.itemId).toBe('i2')
    expect(mockPost).toHaveBeenCalledWith('/open-finance/connections', { itemId: 'i2' })
  })

  it('sync retorna status', async () => {
    mockPost.mockResolvedValue({ data: { status: 'started' } })
    const s = await openFinanceService.sync()
    expect(s.status).toBe('started')
  })
})
