export interface Budget {
  id: string
  categoryId: string
  month: number
  year: number
  limitAmount: number
  spentAmount: number
  progressPercent: number
  categoryName?: string
}

export interface BudgetPayload {
  categoryId: string
  month: number
  year: number
  limitAmount: number
}

export interface BudgetFilters {
  month?: number
  year?: number
}
