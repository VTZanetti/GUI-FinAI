import { describe, it, expect } from 'vitest'
import { useFormat } from '@/composables/useFormat'

describe('useFormat', () => {
  it('expõe currency/percent/date helpers', () => {
    const fmt = useFormat()
    expect(fmt.currency(100)).toContain('100,00')
    expect(fmt.percent(50)).toContain('50')
    expect(fmt.date('2026-08-10T12:00:00Z')).toContain('2026')
    expect(fmt.dateTime('2026-08-10T12:00:00Z')).toContain('2026')
  })

  it('parseCurrency converte pt-BR', () => {
    const fmt = useFormat()
    expect(fmt.parseCurrency('1.234,56')).toBe(1234.56)
  })
})
