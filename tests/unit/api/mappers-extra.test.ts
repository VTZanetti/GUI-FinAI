import { describe, it, expect } from 'vitest'
import {
  normalizeBudget,
  normalizeBehaviorInsights,
  normalizeMonthlyTrend,
  normalizeOpenFinanceStatus,
  normalizeConnection,
  normalizeString,
  normalizeNumber,
  normalizeDate,
  normalizeCategory
} from '@/api/mappers'

describe('mappers — extras', () => {
  describe('normalizeBudget', () => {
    it('normaliza com mês/ano fallback', () => {
      const b = normalizeBudget({ id: 'b', categoryId: 'c', limitAmount: 100 })
      expect(b.month).toBeGreaterThanOrEqual(1)
      expect(b.year).toBeGreaterThanOrEqual(2020)
      expect(b.limitAmount).toBe(100)
    })

    it('usa valores informados', () => {
      const b = normalizeBudget({ id: 'b', categoryId: 'c', month: 3, year: 2026, limitAmount: 100, spentAmount: 50, progressPercent: 50, categoryName: 'Alim' })
      expect(b.month).toBe(3)
      expect(b.categoryName).toBe('Alim')
    })
  })

  describe('normalizeBehaviorInsights', () => {
    it('mapeia insights', () => {
      const r = normalizeBehaviorInsights({
        insights: [
          { type: 'category_increase', category: 'Alim', metric: 'm', currentValue: 1, previousValue: 2, changePercent: 50, value: null, message: 'msg' }
        ]
      })
      expect(r[0].changePercent).toBe(50)
      expect(r[0].value).toBeNull()
    })

    it('retorna [] para payload inválido', () => {
      expect(normalizeBehaviorInsights({})).toEqual([])
    })
  })

  describe('normalizeMonthlyTrend', () => {
    it('normaliza meses', () => {
      const t = normalizeMonthlyTrend({ months: [{ month: '2026-08', income: 1, expenses: 2, balance: -1 }] })
      expect(t.months[0].month).toBe('2026-08')
    })

    it('tolera ausência', () => {
      expect(normalizeMonthlyTrend({}).months).toEqual([])
    })
  })

  describe('normalizeOpenFinanceStatus', () => {
    it('normaliza status completo', () => {
      const s = normalizeOpenFinanceStatus({
        lastSync: { status: 'success', accountsImported: 2, transactionsImported: 10, transactionsSkipped: 1, error: null, startedAt: '2026-08-10', finishedAt: '2026-08-11' },
        schedule: { enabled: true, intervalHours: 24, nextRunAt: '2026-08-12' }
      })
      expect(s.lastSync?.accountsImported).toBe(2)
      expect(s.schedule?.enabled).toBe(true)
    })

    it('tolera null', () => {
      const s = normalizeOpenFinanceStatus({ lastSync: null, schedule: null })
      expect(s.lastSync).toBeNull()
      expect(s.schedule).toBeNull()
    })
  })

  describe('normalizeConnection', () => {
    it('normaliza conexão', () => {
      const c = normalizeConnection({ id: '1', itemId: 'i1', institutionName: 'Banco', status: 'connected', createdAt: '2026-08-10' })
      expect(c.institutionName).toBe('Banco')
      expect(c.itemId).toBe('i1')
    })
  })

  describe('helpers base', () => {
    it('normalizeString fallback', () => {
      expect(normalizeString(undefined, 'fb')).toBe('fb')
      expect(normalizeString('ok')).toBe('ok')
    })

    it('normalizeNumber tolera string', () => {
      expect(normalizeNumber('10')).toBe(10)
      expect(normalizeNumber('abc', 5)).toBe(5)
      expect(normalizeNumber(undefined)).toBe(0)
    })

    it('normalizeDate corta ISO completo', () => {
      expect(normalizeDate('2026-08-10T12:00:00')).toBe('2026-08-10')
      expect(normalizeDate(null)).toBe('')
    })

    it('normalizeCategory subcategory null', () => {
      const c = normalizeCategory({ id: '1', name: 'X', isSystem: true })
      expect(c.subcategory).toBeNull()
      expect(c.isSystem).toBe(true)
    })
  })
})
