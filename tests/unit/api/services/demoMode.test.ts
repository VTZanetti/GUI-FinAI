import { describe, it, expect, vi, beforeEach } from 'vitest'

// Demo mode ON — testa o roteamento para os mocks
vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: true }))
vi.mock('@/api/mocks/demoClient', async () => {
  const actual = await vi.importActual<typeof import('@/api/mocks/demoClient')>('@/api/mocks/demoClient')
  return actual
})

import { accountService } from '@/api/services/accountService'
import { categoryService } from '@/api/services/categoryService'
import { transactionService } from '@/api/services/transactionService'
import { budgetService } from '@/api/services/budgetService'
import { analyticsService } from '@/api/services/analyticsService'
import { forecastService } from '@/api/services/forecastService'
import { anomalyService } from '@/api/services/anomalyService'
import { aiService } from '@/api/services/aiService'
import { documentService } from '@/api/services/documentService'
import { openFinanceService } from '@/api/services/openFinanceService'
import { adminService } from '@/api/services/adminService'

describe('services — demo mode (VITE_DEMO_MODE=true)', () => {
  it('accountService roteia para mocks', async () => {
    const res = await accountService.list()
    expect(res.items.length).toBeGreaterThan(0)
    const created = await accountService.create({ name: 'Demo', type: 'Checking', currency: 'BRL', initialBalance: 100 })
    expect(created.id).toBeTruthy()
    await accountService.update('acc-1', { name: 'Demo2', type: 'Checking', currency: 'BRL' })
    await expect(accountService.remove('acc-x')).resolves.toBeUndefined()
  })

  it('categoryService roteia para mocks', async () => {
    const cats = await categoryService.list()
    expect(cats.length).toBeGreaterThan(0)
    const created = await categoryService.create({ name: 'Nova' })
    expect(created.isSystem).toBe(false)
    await categoryService.update('c1', { name: 'x' })
    await expect(categoryService.remove('c1')).resolves.toBeUndefined()
  })

  it('transactionService roteia para mocks', async () => {
    const res = await transactionService.list({ page: 1, pageSize: 5 })
    expect(res.items.length).toBeGreaterThan(0)
    const created = await transactionService.create({
      accountId: 'acc-1',
      description: 'IFOOD',
      amount: -50,
      date: '2026-08-10'
    })
    expect(created.classification).toBeTruthy()
    await transactionService.update(created.id, { accountId: 'acc-1', description: 'x', amount: -10, date: '2026-08-10' })
    await expect(transactionService.remove('tx-1')).resolves.toBeUndefined()
  })

  it('budgetService roteia para mocks', async () => {
    const budgets = await budgetService.list()
    expect(budgets.length).toBeGreaterThan(0)
    await budgetService.create({ categoryId: 'c1', month: 8, year: 2026, limitAmount: 100 })
    await budgetService.update('b1', { limitAmount: 200 })
    await expect(budgetService.remove('b1')).resolves.toBeUndefined()
  })

  it('analyticsService roteia para mocks', async () => {
    const summary = await analyticsService.spendingSummary({ from: '2026-01-01', to: '2026-08-10' })
    expect(summary.totals.income).toBeGreaterThan(0)
    const insights = await analyticsService.behavior()
    expect(insights.length).toBeGreaterThan(0)
    const trend = await analyticsService.monthlyTrend()
    expect(trend.months.length).toBeGreaterThan(0)
  })

  it('forecastService roteia para mocks', async () => {
    const forecast = await forecastService.cashFlow(6)
    expect(forecast.forecast.length).toBeGreaterThan(0)
  })

  it('anomalyService roteia para mocks', async () => {
    const res = await anomalyService.list({ from: '2026-01-01', to: '2026-08-10' })
    expect(res.items.length).toBeGreaterThan(0)
    const check = await anomalyService.check({ description: 'x', amount: -100 })
    expect(check.anomaly).toBe(false)
  })

  it('aiService roteia para mocks', async () => {
    const cls = await aiService.classify({ description: 'UBER', amount: -30 })
    expect(cls.category).toBeTruthy()
    const advisor = await aiService.financialAdvisor({ question: 'quanto gastei?', includeDocuments: true })
    expect(advisor.answer).toBeTruthy()
    expect(advisor.sources).toContain('documents')
  })

  it('documentService roteia para mocks', async () => {
    const docs = await documentService.list()
    expect(docs.length).toBeGreaterThan(0)
    const uploaded = await documentService.upload(new File(['x'], 'a.pdf'))
    expect(uploaded.id).toBeTruthy()
    await expect(documentService.remove('d1')).resolves.toBeUndefined()
  })

  it('openFinanceService roteia para mocks', async () => {
    const status = await openFinanceService.status()
    expect(status.lastSync?.status).toBe('success')
    const token = await openFinanceService.connectToken()
    expect(token.accessToken).toBeTruthy()
    const conns = await openFinanceService.listConnections()
    expect(conns.length).toBeGreaterThan(0)
    await openFinanceService.linkConnection({ itemId: 'i1' })
    const sync = await openFinanceService.sync()
    expect(sync.status).toBe('started')
  })

  it('adminService roteia para mocks', async () => {
    const logs = await adminService.auditLogs()
    expect(logs.items.length).toBeGreaterThan(0)
    const users = await adminService.users()
    expect(users.length).toBeGreaterThan(0)
  })
})
