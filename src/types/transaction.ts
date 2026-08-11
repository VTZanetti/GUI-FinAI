export type ClassificationSource = 'rules' | 'cached' | 'llm' | 'external'
export type TransactionType = 'income' | 'expense'

export interface TransactionCategory {
  name: string
  subcategory?: string | null
}

export interface Transaction {
  id: string
  accountId: string
  description: string
  amount: number
  date: string
  category: TransactionCategory | null
  classification?: {
    confidence: number
    source: ClassificationSource
  } | null
  isRecurring: boolean
  externalId?: string | null
  createdAt: string
}

export interface TransactionPayload {
  accountId: string
  description: string
  amount: number
  date: string
  categoryId?: string | null
  isRecurring?: boolean
  externalId?: string | null
}

export interface TransactionFilters {
  accountId?: string
  categoryId?: string
  type?: TransactionType
  from?: string
  to?: string
  minAmount?: number
  maxAmount?: number
  search?: string
  isRecurring?: boolean
  page?: number
  pageSize?: number
  sortBy?: 'date' | 'amount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}
