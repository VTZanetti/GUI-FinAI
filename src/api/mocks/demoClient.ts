import type {
  Account,
  AnomalyListResponse,
  AuthResponse,
  BehaviorInsight,
  Budget,
  CashFlowForecast,
  Category,
  ClassificationResult,
  DocumentUploadResponse,
  FinAIDocument,
  MonthlyTrend,
  OpenFinanceConnection,
  OpenFinanceStatus,
  PagedResponse,
  SpendingSummary,
  Transaction
} from '@/types'
import { demoAccounts, demoCategories, demoTransactions } from './data'
import { createFakeToken } from '@/utils/jwt'

/** Latência simulada (200–500ms) para o demo mode parecer real. */
function delay(data?: unknown): Promise<unknown> {
  const ms = 200 + Math.random() * 300
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

/** Clone profundo simples para não compartilhar referências entre chamadas. */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

const demoUser = {
  userId: 'demo-user',
  email: 'demo@finai.local',
  firstName: 'Demonstração',
  role: 'User'
}

export const demoClient = {
  // ── Auth ───────────────────────────────────────────────────────────
  async login(): Promise<AuthResponse> {
    return (await delay({
      userId: demoUser.userId,
      email: demoUser.email,
      accessToken: createFakeToken({ sub: demoUser.userId, email: demoUser.email, role: 'User', firstName: 'Demonstração' }),
      expiresIn: 900,
      refreshToken: 'demo-refresh-token'
    })) as AuthResponse
  },

  async register(): Promise<AuthResponse> {
    return (await delay({
      userId: demoUser.userId,
      email: demoUser.email,
      accessToken: createFakeToken({ sub: demoUser.userId, email: demoUser.email, role: 'User', firstName: 'Demonstração' }),
      expiresIn: 900,
      refreshToken: 'demo-refresh-token'
    })) as AuthResponse
  },

  async refresh(): Promise<AuthResponse> {
    return (await delay({
      userId: demoUser.userId,
      email: demoUser.email,
      accessToken: createFakeToken({ sub: demoUser.userId, email: demoUser.email, role: 'User', firstName: 'Demonstração' }),
      expiresIn: 900,
      refreshToken: 'demo-refresh-token-rotated'
    })) as AuthResponse
  },

  // ── Accounts ───────────────────────────────────────────────────────
  async listAccounts(): Promise<PagedResponse<Account>> {
    const items = (await delay(clone(demoAccounts))) as Account[]
    return {
      items,
      page: 1,
      pageSize: items.length,
      totalItems: items.length,
      totalPages: 1
    }
  },

  async createAccount(payload: { name: string; type: string; currency: string; initialBalance: number }): Promise<Account> {
    const created: Account = {
      id: `acc-${Date.now()}`,
      name: payload.name,
      type: payload.type as Account['type'],
      currency: payload.currency,
      initialBalance: payload.initialBalance,
      currentBalance: payload.initialBalance,
      createdAt: new Date().toISOString()
    }
    demoAccounts.unshift(created)
    return (await delay(created)) as Account
  },

  async updateAccount(id: string, payload: { name: string; type: string; currency: string }): Promise<Account> {
    const found = demoAccounts.find((a) => a.id === id)
    if (found) Object.assign(found, payload)
    return (await delay(found ?? demoAccounts[0])) as Account
  },

  async deleteAccount(_id: string): Promise<void> {
    await delay(undefined)
  },

  // ── Categories ─────────────────────────────────────────────────────
  async listCategories(): Promise<Category[]> {
    return (await delay(clone(demoCategories))) as Category[]
  },

  async createCategory(payload: { name: string; subcategory?: string | null }): Promise<Category> {
    const created: Category = {
      id: `cat-${Date.now()}`,
      name: payload.name,
      subcategory: payload.subcategory ?? null,
      isSystem: false
    }
    demoCategories.push(created)
    return (await delay(created)) as Category
  },

  // ── Transactions ───────────────────────────────────────────────────
  async listTransactions(params: Record<string, unknown>): Promise<PagedResponse<Transaction>> {
    let items = clone(demoTransactions)
    if (params.search) {
      const q = String(params.search).toLowerCase()
      items = items.filter((t) => t.description.toLowerCase().includes(q))
    }
    if (params.type) {
      items = items.filter((t) =>
        params.type === 'expense' ? t.amount < 0 : t.amount >= 0
      )
    }
    const page = Number(params.page ?? 1)
    const pageSize = Number(params.pageSize ?? 20)
    const total = items.length
    const start = (page - 1) * pageSize
    return {
      items: items.slice(start, start + pageSize),
      page,
      pageSize,
      totalItems: total,
      totalPages: Math.max(1, Math.ceil(total / pageSize))
    }
  },

  async createTransaction(payload: Record<string, unknown>): Promise<Transaction> {
    const created: Transaction = {
      id: `tx-${Date.now()}`,
      accountId: String(payload.accountId),
      description: String(payload.description),
      amount: Number(payload.amount),
      date: String(payload.date),
      category: payload.categoryId ? { name: 'Categoria' } : { name: 'Alimentação' },
      classification: {
        confidence: 0.85,
        source: 'llm'
      },
      isRecurring: Boolean(payload.isRecurring),
      createdAt: new Date().toISOString()
    }
    demoTransactions.unshift(created)
    return (await delay(created)) as Transaction
  },

  async updateTransaction(id: string, payload: Record<string, unknown>): Promise<Transaction> {
    const found = demoTransactions.find((t) => t.id === id)
    if (found) {
      Object.assign(found, {
        accountId: payload.accountId,
        description: payload.description,
        amount: payload.amount,
        date: payload.date,
        isRecurring: payload.isRecurring
      })
    }
    return (await delay(found ?? demoTransactions[0])) as Transaction
  },

  async deleteTransaction(_id: string): Promise<void> {
    await delay(undefined)
  },

  // ── Budgets ────────────────────────────────────────────────────────
  async listBudgets(): Promise<Budget[]> {
    const budgets: Budget[] = [
      {
        id: 'bud-1',
        categoryId: 'cat-alim',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        limitAmount: 1200,
        spentAmount: 812.4,
        progressPercent: 67.7,
        categoryName: 'Alimentação'
      },
      {
        id: 'bud-2',
        categoryId: 'cat-lazer',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        limitAmount: 300,
        spentAmount: 45,
        progressPercent: 15,
        categoryName: 'Lazer'
      }
    ]
    return (await delay(budgets)) as Budget[]
  },

  async createBudget(payload: { categoryId: string; month: number; year: number; limitAmount: number }): Promise<Budget> {
    const created: Budget = {
      id: `bud-${Date.now()}`,
      categoryId: payload.categoryId,
      month: payload.month,
      year: payload.year,
      limitAmount: payload.limitAmount,
      spentAmount: 0,
      progressPercent: 0
    }
    return (await delay(created)) as Budget
  },

  async updateBudget(id: string, payload: { limitAmount: number }): Promise<Budget> {
    return (await delay({
      id,
      categoryId: 'cat-alim',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      limitAmount: payload.limitAmount,
      spentAmount: 812.4,
      progressPercent: 70
    })) as Budget
  },

  async deleteBudget(_id: string): Promise<void> {
    await delay(undefined)
  },

  // ── Analytics ──────────────────────────────────────────────────────
  async spendingSummary(params: { from: string; to: string }): Promise<SpendingSummary> {
    return (await delay({
      period: { from: params.from, to: params.to },
      totals: { income: 5042.18, expenses: 2225.02, balance: 2817.16 },
      byCategory: [
        { category: 'Moradia', subcategory: null, amount: 1500, percentage: 67.4 },
        { category: 'Alimentação', subcategory: null, amount: 454.92, percentage: 20.4 },
        { category: 'Saúde', subcategory: null, amount: 142.3, percentage: 6.4 },
        { category: 'Transporte', subcategory: null, amount: 27.9, percentage: 1.3 },
        { category: 'Lazer', subcategory: null, amount: 100, percentage: 4.5 }
      ],
      recurring: { amount: 1555.9, percentageOfExpenses: 69.9 }
    })) as SpendingSummary
  },

  async behavior(): Promise<{ insights: BehaviorInsight[] }> {
    return (await delay({
      insights: [
        {
          type: 'category_increase',
          category: 'Alimentação',
          metric: 'total_expenses',
          currentValue: 454.92,
          previousValue: 310.5,
          changePercent: 46.5,
          value: null,
          message: 'Seus gastos com Alimentação aumentaram 46,5% em relação ao período anterior.'
        },
        {
          type: 'recurring_ratio',
          category: null,
          metric: 'recurring_ratio',
          currentValue: 69.9,
          previousValue: 62,
          changePercent: 7.9,
          value: 1555.9,
          message: 'Despesas recorrentes representam 69,9% do total — mantenha atenção aos valores fixos.'
        }
      ]
    })) as { insights: BehaviorInsight[] }
  },

  async monthlyTrend(): Promise<MonthlyTrend> {
    const months: MonthlyTrend['months'] = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        income: 5000 + (i % 3) * 120,
        expenses: 1800 + (i % 4) * 310,
        balance: 3200 - (i % 4) * 190
      })
    }
    return (await delay({ months })) as MonthlyTrend
  },

  // ── Forecast ───────────────────────────────────────────────────────
  async cashFlowForecast(): Promise<CashFlowForecast> {
    const forecast: CashFlowForecast['forecast'] = []
    const now = new Date()
    for (let i = 1; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      forecast.push({
        month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        income: 5000,
        expenses: 2225 + i * 35,
        balance: 2775 - i * 35
      })
    }
    return (await delay({
      method: 'weighted_moving_average',
      generatedAt: new Date().toISOString(),
      forecast,
      confidence: {
        level: 'medium',
        note: 'Previsão baseada nos últimos 12 meses de histórico.'
      }
    })) as CashFlowForecast
  },

  // ── Anomalies ──────────────────────────────────────────────────────
  async listAnomalies(): Promise<AnomalyListResponse> {
    return (await delay({
      method: 'zscore',
      items: [
        {
          transactionId: 'tx-2',
          description: 'Supermercado Extra',
          amount: -386.42,
          date: '2026-07-22',
          category: 'Alimentação',
          anomaly: true,
          score: 0.91,
          reason: 'Valor muito acima da média histórica da categoria.'
        }
      ]
    })) as AnomalyListResponse
  },

  // ── AI ─────────────────────────────────────────────────────────────
  async classify(payload: { description: string; amount: number }): Promise<ClassificationResult> {
    const desc = payload.description.toLowerCase()
    let category = 'Outros'
    if (desc.includes('uber') || desc.includes('99') || desc.includes('combust')) category = 'Transporte'
    else if (desc.includes('ifood') || desc.includes('mercado') || desc.includes('supermercado') || desc.includes('restaurante'))
      category = 'Alimentação'
    else if (desc.includes('farmac') || desc.includes('médic') || desc.includes('doctor')) category = 'Saúde'
    else if (desc.includes('cinema') || desc.includes('jogo') || desc.includes('spotify')) category = 'Lazer'
    else if (desc.includes('aluguel') || desc.includes('condomínio')) category = 'Moradia'
    return (await delay({
      category,
      subcategory: null,
      confidence: 0.85,
      source: 'llm'
    })) as ClassificationResult
  },

  async advisor(payload: { question: string; includeDocuments?: boolean }): Promise<{
    answer: string
    context: { period: string }
    sources: string[]
  }> {
    const sources = payload.includeDocuments ? ['analytics', 'documents'] : ['analytics']
    return (await delay({
      answer: `Analisando sua pergunta: "${payload.question}". Com base nos seus dados do período, suas receitas somaram R$ 5.042,18 e suas despesas R$ 2.225,02, com destaque para Moradia (67%) e Alimentação (20%).${payload.includeDocuments ? ' Consultei também os documentos enviados.' : ''}`,
      context: { period: 'Últimos 30 dias' },
      sources
    })) as { answer: string; context: { period: string }; sources: string[] }
  },

  // ── Documents ──────────────────────────────────────────────────────
  async listDocuments(): Promise<FinAIDocument[]> {
    return (await delay([
      {
        id: 'doc-1',
        fileName: 'extrato-banco.pdf',
        contentType: 'application/pdf',
        status: 'ready',
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        failureReason: null
      }
    ])) as FinAIDocument[]
  },

  async uploadDocument(): Promise<DocumentUploadResponse> {
    return (await delay({
      id: `doc-${Date.now()}`,
      fileName: 'documento.pdf',
      contentType: 'application/pdf',
      status: 'processing',
      uploadedAt: new Date().toISOString()
    })) as DocumentUploadResponse
  },

  async deleteDocument(_id: string): Promise<void> {
    await delay(undefined)
  },

  // ── Open Finance ───────────────────────────────────────────────────
  async openFinanceStatus(): Promise<OpenFinanceStatus> {
    return (await delay({
      lastSync: {
        status: 'success',
        accountsImported: 2,
        transactionsImported: 34,
        transactionsSkipped: 3,
        error: null,
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        finishedAt: new Date().toISOString()
      },
      schedule: { enabled: false, intervalHours: 24, nextRunAt: null }
    })) as OpenFinanceStatus
  },

  async sync(): Promise<{ status: string }> {
    return (await delay({ status: 'started' })) as { status: string }
  },

  async connectToken(): Promise<{ accessToken: string }> {
    return (await delay({ accessToken: 'demo-connect-token' })) as { accessToken: string }
  },

  async listConnections(): Promise<OpenFinanceConnection[]> {
    return (await delay([
      {
        id: 'conn-1',
        itemId: 'item-demo',
        institutionName: 'Banco Demo (sandbox)',
        status: 'connected',
        createdAt: new Date().toISOString()
      }
    ])) as OpenFinanceConnection[]
  },

  async linkConnection(payload: { itemId: string }): Promise<OpenFinanceConnection> {
    return (await delay({
      id: `conn-${Date.now()}`,
      itemId: payload.itemId,
      institutionName: 'Banco sandbox',
      status: 'connected',
      createdAt: new Date().toISOString()
    })) as OpenFinanceConnection
  }
}
