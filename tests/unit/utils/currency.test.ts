import { describe, it, expect } from 'vitest'
import { formatCurrency, parseCurrency, formatPercent } from '@/utils/currency'

describe('formatCurrency', () => {
  it('formata valores positivos em BRL', () => {
    expect(formatCurrency(1234.56)).toBe('R$ 1.234,56')
  })

  it('formata valores negativos', () => {
    expect(formatCurrency(-27.9)).toContain('-')
    expect(formatCurrency(-27.9)).toContain('27,90')
  })

  it('trata null/undefined como zero', () => {
    expect(formatCurrency(null)).toContain('0,00')
    expect(formatCurrency(undefined)).toContain('0,00')
  })

  it('formata zero', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00')
  })
})

describe('parseCurrency', () => {
  it('converte "1.234,56" em número', () => {
    expect(parseCurrency('1.234,56')).toBe(1234.56)
  })

  it('converte "R$ 1.234,56" em número', () => {
    expect(parseCurrency('R$ 1.234,56')).toBe(1234.56)
  })

  it('converte "27,90" em número', () => {
    expect(parseCurrency('27,90')).toBe(27.9)
  })

  it('retorna 0 para vazio', () => {
    expect(parseCurrency('')).toBe(0)
  })

  it('retorna 0 para texto inválido', () => {
    expect(parseCurrency('abc')).toBe(0)
  })
})

describe('formatPercent', () => {
  it('formata percentual (0–100 → %)', () => {
    expect(formatPercent(12.34)).toContain('12')
  })

  it('trata null como 0%', () => {
    expect(formatPercent(null)).toContain('0')
  })
})
