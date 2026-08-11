import type { Account, Category, Transaction } from '@/types'

/** Seeds de demonstração — mesmos shapes dos contratos reais (docs/07 §4). */

export const demoAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Nubank',
    type: 'Checking',
    currency: 'BRL',
    initialBalance: 1000,
    currentBalance: 2540.75,
    createdAt: '2026-01-05T10:00:00Z'
  },
  {
    id: 'acc-2',
    name: 'Cartão de Crédito',
    type: 'CreditCard',
    currency: 'BRL',
    initialBalance: 0,
    currentBalance: -1240.3,
    createdAt: '2026-01-05T10:05:00Z'
  },
  {
    id: 'acc-3',
    name: 'Poupança',
    type: 'Savings',
    currency: 'BRL',
    initialBalance: 5000,
    currentBalance: 6200,
    createdAt: '2026-01-06T09:00:00Z'
  }
]

export const demoCategories: Category[] = [
  { id: 'cat-alim', name: 'Alimentação', subcategory: null, isSystem: true },
  { id: 'cat-transp', name: 'Transporte', subcategory: null, isSystem: true },
  { id: 'cat-moradia', name: 'Moradia', subcategory: null, isSystem: true },
  { id: 'cat-saude', name: 'Saúde', subcategory: null, isSystem: true },
  { id: 'cat-lazer', name: 'Lazer', subcategory: null, isSystem: true },
  { id: 'cat-salario', name: 'Salário', subcategory: null, isSystem: true },
  { id: 'cat-servicos', name: 'Serviços', subcategory: 'Assinaturas', isSystem: false },
  { id: 'cat-educ', name: 'Educação', subcategory: null, isSystem: false }
]

const iso = (daysAgo: number): string => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

export const demoTransactions: Transaction[] = [
  {
    id: 'tx-1',
    accountId: 'acc-1',
    description: 'Salário',
    amount: 5000,
    date: iso(25),
    category: { name: 'Salário' },
    classification: { confidence: 0.99, source: 'rules' },
    isRecurring: true,
    createdAt: iso(25)
  },
  {
    id: 'tx-2',
    accountId: 'acc-1',
    description: 'Supermercado Extra',
    amount: -386.42,
    date: iso(20),
    category: { name: 'Alimentação' },
    classification: { confidence: 0.95, source: 'cached' },
    isRecurring: false,
    createdAt: iso(20)
  },
  {
    id: 'tx-3',
    accountId: 'acc-1',
    description: 'UBER *TRIP',
    amount: -27.9,
    date: iso(18),
    category: { name: 'Transporte' },
    classification: { confidence: 0.94, source: 'llm' },
    isRecurring: false,
    createdAt: iso(18)
  },
  {
    id: 'tx-4',
    accountId: 'acc-2',
    description: 'IFOOD *RESTAURANTE',
    amount: -68.5,
    date: iso(15),
    category: { name: 'Alimentação', subcategory: 'Restaurantes' },
    classification: { confidence: 0.91, source: 'llm' },
    isRecurring: false,
    createdAt: iso(15)
  },
  {
    id: 'tx-5',
    accountId: 'acc-1',
    description: 'Aluguel',
    amount: -1500,
    date: iso(12),
    category: { name: 'Moradia' },
    classification: { confidence: 0.98, source: 'rules' },
    isRecurring: true,
    createdAt: iso(12)
  },
  {
    id: 'tx-6',
    accountId: 'acc-2',
    description: 'Netflix',
    amount: -55.9,
    date: iso(10),
    category: { name: 'Serviços', subcategory: 'Assinaturas' },
    classification: { confidence: 0.9, source: 'cached' },
    isRecurring: true,
    createdAt: iso(10)
  },
  {
    id: 'tx-7',
    accountId: 'acc-1',
    description: 'Farmácia Droga Raia',
    amount: -142.3,
    date: iso(7),
    category: { name: 'Saúde' },
    classification: { confidence: 0.93, source: 'llm' },
    isRecurring: false,
    createdAt: iso(7)
  },
  {
    id: 'tx-8',
    accountId: 'acc-1',
    description: 'Cinema Cinemark',
    amount: -45,
    date: iso(4),
    category: { name: 'Lazer' },
    classification: { confidence: 0.88, source: 'llm' },
    isRecurring: false,
    createdAt: iso(4)
  },
  {
    id: 'tx-9',
    accountId: 'acc-3',
    description: 'Rendimento Poupança',
    amount: 42.18,
    date: iso(2),
    category: { name: 'Salário' },
    classification: { confidence: 0.7, source: 'rules' },
    isRecurring: false,
    createdAt: iso(2)
  }
]
