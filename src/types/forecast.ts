export interface CashFlowForecast {
  method: string
  generatedAt: string
  forecast: {
    month: string
    income: number
    expenses: number
    balance: number
  }[]
  confidence: {
    level: 'low' | 'medium' | 'high' | string
    note: string
  }
}
