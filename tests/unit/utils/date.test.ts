import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime, todayISO, toISODate, monthRange, startOfMonthISO, endOfMonthISO, shortMonthLabel } from '@/utils/date'

describe('utils/date', () => {
  it('formatDate converte ISO para pt-BR', () => {
    // Data ao meio-dia local para ser agnóstico de timezone
    const local = new Date(2026, 7, 10, 12, 0, 0)
    expect(formatDate(local.toISOString())).toContain('10/08/2026')
  })

  it('formatDate retorna em dash para null', () => {
    expect(formatDate(null)).toBe('—')
  })

  it('formatDateTime inclui hora', () => {
    expect(formatDateTime('2026-08-10T14:30:00Z')).toContain('2026')
  })

  it('todayISO retorna yyyy-MM-dd', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('toISODate formata corretamente', () => {
    expect(toISODate(new Date(2026, 7, 5))).toBe('2026-08-05')
  })

  it('monthRange retorna from 1º dia N meses atrás', () => {
    const now = new Date()
    const { from } = monthRange(3)
    const expected = toISODate(new Date(now.getFullYear(), now.getMonth() - 3, 1))
    expect(from).toBe(expected)
  })

  it('startOfMonthISO retorna primeiro dia', () => {
    expect(startOfMonthISO(new Date(2026, 7, 15))).toBe('2026-08-01')
  })

  it('endOfMonthISO retorna último dia', () => {
    expect(endOfMonthISO(new Date(2026, 7, 15))).toBe('2026-08-31')
  })

  it('shortMonthLabel abrevia mês', () => {
    expect(shortMonthLabel('2026-08')).toBe('ago/26')
  })
})
