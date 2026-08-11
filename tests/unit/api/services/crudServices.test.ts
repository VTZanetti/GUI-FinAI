import { describe, it, expect, vi, beforeEach } from 'vitest'
import { accountService } from '@/api/services/accountService'
import { categoryService } from '@/api/services/categoryService'
import { budgetService } from '@/api/services/budgetService'
import { apiClient } from '@/api/client'

// Intercepta chamadas do axios
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

// Evita que o interceptor use o store (não precisa)
vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: false }))

const mockGet = apiClient.get as ReturnType<typeof vi.fn>
const mockPost = apiClient.post as ReturnType<typeof vi.fn>
const mockPut = apiClient.put as ReturnType<typeof vi.fn>
const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>

describe('accountService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('list normaliza contas', async () => {
    mockGet.mockResolvedValue({
      data: { items: [{ id: 'a1', name: 'Nubank', type: 'Checking', currency: 'BRL', initialBalance: 10, currentBalance: 20, createdAt: '2026-01-01' }], page: 1, pageSize: 50, totalItems: 1, totalPages: 1 }
    })
    const res = await accountService.list()
    expect(res.items[0].name).toBe('Nubank')
    expect(res.totalItems).toBe(1)
    expect(mockGet).toHaveBeenCalledWith('/accounts', expect.any(Object))
  })

  it('create envia payload e normaliza', async () => {
    mockPost.mockResolvedValue({ data: { id: 'a2', name: 'BB', type: 'Savings', currency: 'BRL', initialBalance: 500, currentBalance: 500, createdAt: '2026-01-02' } })
    const acc = await accountService.create({ name: 'BB', type: 'Savings', currency: 'BRL', initialBalance: 500 })
    expect(acc.id).toBe('a2')
    expect(mockPost).toHaveBeenCalledWith('/accounts', {
      name: 'BB',
      type: 'Savings',
      currency: 'BRL',
      initialBalance: 500
    })
  })

  it('update e remove chamam endpoints', async () => {
    mockPut.mockResolvedValue({ data: { id: 'a1', name: 'Nubank', type: 'Checking', currency: 'BRL', initialBalance: 10, currentBalance: 20, createdAt: '' } })
    mockDelete.mockResolvedValue({ data: undefined })
    await accountService.update('a1', { name: 'Nubank 2', type: 'Checking', currency: 'BRL' })
    await accountService.remove('a1')
    expect(mockPut).toHaveBeenCalledWith('/accounts/a1', expect.any(Object))
    expect(mockDelete).toHaveBeenCalledWith('/accounts/a1')
  })
})

describe('categoryService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('list normaliza categorias', async () => {
    mockGet.mockResolvedValue({ data: [{ id: 'c1', name: 'Alimentação', subcategory: null, isSystem: true }] })
    const cats = await categoryService.list()
    expect(cats[0].isSystem).toBe(true)
  })

  it('create normaliza nova categoria', async () => {
    mockPost.mockResolvedValue({ data: { id: 'c2', name: 'Mine', subcategory: 'x', isSystem: false } })
    const cat = await categoryService.create({ name: 'Mine', subcategory: 'x' })
    expect(cat.subcategory).toBe('x')
    expect(cat.isSystem).toBe(false)
  })

  it('remove chama delete', async () => {
    mockDelete.mockResolvedValue({ data: undefined })
    await categoryService.remove('c1')
    expect(mockDelete).toHaveBeenCalledWith('/categories/c1')
  })
})

describe('budgetService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('list com filtros mês/ano', async () => {
    mockGet.mockResolvedValue({ data: [{ id: 'b1', categoryId: 'c1', month: 8, year: 2026, limitAmount: 1000, spentAmount: 500, progressPercent: 50 }] })
    const budgets = await budgetService.list({ month: 8, year: 2026 })
    expect(budgets[0].progressPercent).toBe(50)
    expect(mockGet).toHaveBeenCalledWith('/budgets', expect.objectContaining({ params: { month: 8, year: 2026 } }))
  })

  it('create envia payload', async () => {
    mockPost.mockResolvedValue({ data: { id: 'b2', categoryId: 'c2', month: 9, year: 2026, limitAmount: 300, spentAmount: 0, progressPercent: 0 } })
    await budgetService.create({ categoryId: 'c2', month: 9, year: 2026, limitAmount: 300 })
    expect(mockPost).toHaveBeenCalledWith('/budgets', {
      categoryId: 'c2',
      month: 9,
      year: 2026,
      limitAmount: 300
    })
  })

  it('update envia limitAmount', async () => {
    mockPut.mockResolvedValue({ data: { id: 'b1', categoryId: 'c1', month: 8, year: 2026, limitAmount: 2000, spentAmount: 500, progressPercent: 25 } })
    await budgetService.update('b1', { limitAmount: 2000 })
    expect(mockPut).toHaveBeenCalledWith('/budgets/b1', { limitAmount: 2000 })
  })
})
