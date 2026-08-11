import { describe, it, expect } from 'vitest'
import {
  normalizeAccount,
  normalizeTransaction,
  normalizeSpendingSummary,
  normalizeForecast,
  normalizeAnomalies,
  normalizeClassification,
  normalizeDocument
} from '@/api/mappers'

describe('mappers', () => {
  describe('normalizeAccount', () => {
    it('normaliza payload completo', () => {
      const acc = normalizeAccount({
        id: '1',
        name: 'Nubank',
        type: 'Checking',
        currency: 'BRL',
        initialBalance: 100,
        currentBalance: 250.5,
        createdAt: '2026-01-01'
      })
      expect(acc.name).toBe('Nubank')
      expect(acc.currentBalance).toBe(250.5)
      expect(acc.type).toBe('Checking')
    })

    it('tolera payload sujo (campos ausentes)', () => {
      const acc = normalizeAccount({} as Record<string, unknown>)
      expect(acc.id).toBe('')
      expect(acc.name).toBe('Sem nome')
      expect(acc.initialBalance).toBe(0)
      expect(acc.type).toBe('Checking')
    })

    it('converte string numérica', () => {
      const acc = normalizeAccount({ initialBalance: '150,5' })
      expect(acc.initialBalance).toBe(150.5)
    })
  })

  describe('normalizeTransaction', () => {
    it('normaliza com categoria e classificação', () => {
      const tx = normalizeTransaction({
        id: 't1',
        accountId: 'a1',
        description: 'UBER',
        amount: -27.9,
        date: '2026-08-10T00:00:00Z',
        category: { name: 'Transporte', subcategory: null },
        classification: { confidence: 0.94, source: 'llm' },
        isRecurring: false,
        createdAt: '2026-08-10'
      })
      expect(tx.category?.name).toBe('Transporte')
      expect(tx.classification?.source).toBe('llm')
      expect(tx.date).toBe('2026-08-10')
      expect(tx.amount).toBe(-27.9)
    })

    it('tolera ausência de categoria/classificação', () => {
      const tx = normalizeTransaction({ id: 't', description: 'x', amount: 5 } as Record<string, unknown>)
      expect(tx.category).toBeNull()
      expect(tx.classification).toBeNull()
      expect(tx.isRecurring).toBe(false)
    })
  })

  describe('normalizeSpendingSummary', () => {
    it('normaliza totais e byCategory', () => {
      const s = normalizeSpendingSummary({
        period: { from: '2026-01-01', to: '2026-08-10' },
        totals: { income: 5000, expenses: 2000, balance: 3000 },
        byCategory: [{ category: 'Alimentação', subcategory: null, amount: 800, percentage: 40 }],
        recurring: { amount: 1200, percentageOfExpenses: 60 }
      })
      expect(s.totals.balance).toBe(3000)
      expect(s.byCategory[0].percentage).toBe(40)
      expect(s.recurring.amount).toBe(1200)
    })

    it('tolera payload incompleto', () => {
      const s = normalizeSpendingSummary({} as Record<string, unknown>)
      expect(s.totals.income).toBe(0)
      expect(s.byCategory).toEqual([])
    })
  })

  describe('normalizeForecast', () => {
    it('normaliza forecast e confidence', () => {
      const f = normalizeForecast({
        method: 'weighted_moving_average',
        generatedAt: '2026-08-11',
        forecast: [{ month: '2026-09', income: 100, expenses: 50, balance: 50 }],
        confidence: { level: 'medium', note: 'ok' }
      })
      expect(f.forecast[0].month).toBe('2026-09')
      expect(f.confidence.level).toBe('medium')
    })
  })

  describe('normalizeAnomalies', () => {
    it('normaliza items com score', () => {
      const a = normalizeAnomalies({
        method: 'zscore',
        items: [{ transactionId: 't1', description: 'x', amount: -100, date: '2026-08-01', category: 'Alim', anomaly: true, score: 0.9, reason: 'alta' }]
      })
      expect(a.items[0].score).toBe(0.9)
      expect(a.method).toBe('zscore')
    })
  })

  describe('normalizeClassification', () => {
    it('normaliza resultado de classificação', () => {
      const c = normalizeClassification({ category: 'Alimentação', subcategory: null, confidence: 0.85, source: 'llm' })
      expect(c.category).toBe('Alimentação')
      expect(c.confidence).toBe(0.85)
    })
  })

  describe('normalizeDocument', () => {
    it('normaliza documento com status', () => {
      const d = normalizeDocument({ id: 'd1', fileName: 'a.pdf', contentType: 'application/pdf', status: 'processing', uploadedAt: '2026-08-11' })
      expect(d.status).toBe('processing')
    })

    it('tolera status ausente', () => {
      const d = normalizeDocument({} as Record<string, unknown>)
      expect(d.status).toBe('processing')
    })
  })
})
