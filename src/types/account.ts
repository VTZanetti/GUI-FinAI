export type AccountType = 'Checking' | 'Savings' | 'CreditCard' | 'Cash' | 'Investment'

export interface Account {
  id: string
  name: string
  type: AccountType
  currency: string
  initialBalance: number
  currentBalance: number
  createdAt: string
}

export interface AccountPayload {
  name: string
  type: AccountType
  currency: string
  initialBalance: number
}

export interface AccountUpdatePayload {
  name: string
  type: AccountType
  currency: string
}
