import { describe, it, expect } from 'vitest'
import { toQueryParams } from '@/api/services/transactionService'

describe('toQueryParams', () => {
  it('mapeia filtros preenchidos', () => {
    const params = toQueryParams({
      accountId: 'a1',
      type: 'expense',
      from: '2026-01-01',
      to: '2026-08-10',
      search: 'uber',
      page: 2,
      pageSize: 50,
      sortBy: 'date',
      sortOrder: 'desc'
    })
    expect(params.accountId).toBe('a1')
    expect(params.type).toBe('expense')
    expect(params.page).toBe(2)
    expect(params.sortOrder).toBe('desc')
  })

  it('remove filtros vazios', () => {
    const params = toQueryParams({ page: 1, pageSize: 20 })
    expect(params.accountId).toBeUndefined()
    expect(params.search).toBeUndefined()
    expect(params.page).toBe(1)
  })

  it('converte isRecurring em string', () => {
    const params = toQueryParams({ isRecurring: true, page: 1, pageSize: 20 })
    expect(params.isRecurring).toBe('true')
  })
})
