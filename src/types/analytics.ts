export interface SpendingSummary {
  period: {
    from: string
    to: string
  }
  totals: {
    income: number
    expenses: number
    balance: number
  }
  byCategory: {
    category: string
    subcategory: string | null
    amount: number
    percentage: number
  }[]
  recurring: {
    amount: number
    percentageOfExpenses: number
  }
}

export interface BehaviorInsight {
  type: string
  category?: string | null
  metric: string
  currentValue: number
  previousValue: number
  changePercent?: number | null
  value?: number | null
  message: string
}

export interface MonthlyTrend {
  months: {
    month: string
    income: number
    expenses: number
    balance: number
  }[]
}

export interface SpendingSummaryParams {
  from: string
  to: string
  accountId?: string
}
