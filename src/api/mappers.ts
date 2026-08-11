import type {
  Account,
  AnomalyListResponse,
  BehaviorInsight,
  Budget,
  CashFlowForecast,
  Category,
  ClassificationResult,
  FinAIDocument,
  MonthlyTrend,
  OpenFinanceConnection,
  OpenFinanceStatus,
  SpendingSummary,
  Transaction
} from '@/types'

/**
 * Normalização de payloads da API — tolerância a variação de contrato (ADRG-013).
 * Funções puras com fallback/`?.` — payload "sujo" nunca quebra a UI.
 */

export function normalizeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(',', '.'))
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

export function normalizeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

export function normalizeDate(value: unknown): string {
  const s = normalizeString(value)
  if (!s) return ''
  return s.slice(0, 10)
}

export function normalizeAccount(raw: Record<string, unknown>): Account {
  return {
    id: normalizeString(raw.id),
    name: normalizeString(raw.name, 'Sem nome'),
    type: (normalizeString(raw.type, 'Checking') as Account['type']) ?? 'Checking',
    currency: normalizeString(raw.currency, 'BRL'),
    initialBalance: normalizeNumber(raw.initialBalance),
    currentBalance: normalizeNumber(raw.currentBalance),
    createdAt: normalizeString(raw.createdAt)
  }
}

export function normalizeCategory(raw: Record<string, unknown>): Category {
  return {
    id: normalizeString(raw.id),
    name: normalizeString(raw.name, 'Sem categoria'),
    subcategory: raw.subcategory ? normalizeString(raw.subcategory) : null,
    isSystem: Boolean(raw.isSystem)
  }
}

export function normalizeTransaction(raw: Record<string, unknown>): Transaction {
  const cat = raw.category
  const category =
    cat && typeof cat === 'object'
      ? {
          name: normalizeString((cat as Record<string, unknown>).name, 'Sem categoria'),
          subcategory: (cat as Record<string, unknown>).subcategory
            ? normalizeString((cat as Record<string, unknown>).subcategory as string)
            : null
        }
      : null

  const cls = raw.classification
  const classification =
    cls && typeof cls === 'object'
      ? {
          confidence: normalizeNumber((cls as Record<string, unknown>).confidence, 0),
          source: normalizeString((cls as Record<string, unknown>).source as string, 'rules') as
            | 'rules'
            | 'cached'
            | 'llm'
            | 'external'
        }
      : null

  return {
    id: normalizeString(raw.id),
    accountId: normalizeString(raw.accountId),
    description: normalizeString(raw.description, '—'),
    amount: normalizeNumber(raw.amount),
    date: normalizeDate(raw.date),
    category,
    classification,
    isRecurring: Boolean(raw.isRecurring),
    externalId: raw.externalId ? normalizeString(raw.externalId) : null,
    createdAt: normalizeString(raw.createdAt)
  }
}

export function normalizeBudget(raw: Record<string, unknown>): Budget {
  return {
    id: normalizeString(raw.id),
    categoryId: normalizeString(raw.categoryId),
    month: normalizeNumber(raw.month, new Date().getMonth() + 1),
    year: normalizeNumber(raw.year, new Date().getFullYear()),
    limitAmount: normalizeNumber(raw.limitAmount),
    spentAmount: normalizeNumber(raw.spentAmount),
    progressPercent: normalizeNumber(raw.progressPercent),
    categoryName: raw.categoryName ? normalizeString(raw.categoryName) : undefined
  }
}

export function normalizeSpendingSummary(raw: Record<string, unknown>): SpendingSummary {
  const period = raw.period && typeof raw.period === 'object' ? (raw.period as Record<string, unknown>) : {}
  const totals = raw.totals && typeof raw.totals === 'object' ? (raw.totals as Record<string, unknown>) : {}
  const recurring = raw.recurring && typeof raw.recurring === 'object' ? (raw.recurring as Record<string, unknown>) : {}
  const byCategory = Array.isArray(raw.byCategory)
    ? (raw.byCategory as Record<string, unknown>[]).map((c) => ({
        category: normalizeString(c.category, 'Outros'),
        subcategory: c.subcategory ? normalizeString(c.subcategory) : null,
        amount: normalizeNumber(c.amount),
        percentage: normalizeNumber(c.percentage)
      }))
    : []

  return {
    period: { from: normalizeString(period.from), to: normalizeString(period.to) },
    totals: {
      income: normalizeNumber(totals.income),
      expenses: normalizeNumber(totals.expenses),
      balance: normalizeNumber(totals.balance)
    },
    byCategory,
    recurring: {
      amount: normalizeNumber(recurring.amount),
      percentageOfExpenses: normalizeNumber(recurring.percentageOfExpenses)
    }
  }
}

export function normalizeBehaviorInsights(raw: Record<string, unknown>): BehaviorInsight[] {
  if (!Array.isArray(raw.insights)) return []
  return (raw.insights as Record<string, unknown>[]).map((i) => ({
    type: normalizeString(i.type, 'info'),
    category: i.category ? normalizeString(i.category) : null,
    metric: normalizeString(i.metric),
    currentValue: normalizeNumber(i.currentValue),
    previousValue: normalizeNumber(i.previousValue),
    changePercent: i.changePercent === null || i.changePercent === undefined ? null : normalizeNumber(i.changePercent),
    value: i.value === null || i.value === undefined ? null : normalizeNumber(i.value),
    message: normalizeString(i.message, 'Insight.')
  }))
}

export function normalizeMonthlyTrend(raw: Record<string, unknown>): MonthlyTrend {
  const months = Array.isArray(raw.months)
    ? (raw.months as Record<string, unknown>[]).map((m) => ({
        month: normalizeString(m.month),
        income: normalizeNumber(m.income),
        expenses: normalizeNumber(m.expenses),
        balance: normalizeNumber(m.balance)
      }))
    : []
  return { months }
}

export function normalizeForecast(raw: Record<string, unknown>): CashFlowForecast {
  const confidence = raw.confidence && typeof raw.confidence === 'object' ? (raw.confidence as Record<string, unknown>) : {}
  const forecast = Array.isArray(raw.forecast)
    ? (raw.forecast as Record<string, unknown>[]).map((f) => ({
        month: normalizeString(f.month),
        income: normalizeNumber(f.income),
        expenses: normalizeNumber(f.expenses),
        balance: normalizeNumber(f.balance)
      }))
    : []
  return {
    method: normalizeString(raw.method, 'desconhecido'),
    generatedAt: normalizeString(raw.generatedAt),
    forecast,
    confidence: {
      level: normalizeString(confidence.level, 'medium'),
      note: normalizeString(confidence.note, '')
    }
  }
}

export function normalizeAnomalies(raw: Record<string, unknown>): AnomalyListResponse {
  const items = Array.isArray(raw.items)
    ? (raw.items as Record<string, unknown>[]).map((a) => ({
        transactionId: normalizeString(a.transactionId),
        description: normalizeString(a.description, '—'),
        amount: normalizeNumber(a.amount),
        date: normalizeDate(a.date),
        category: a.category ? normalizeString(a.category) : null,
        anomaly: Boolean(a.anomaly),
        score: normalizeNumber(a.score),
        reason: normalizeString(a.reason, '')
      }))
    : []
  return { method: normalizeString(raw.method, 'zscore'), items }
}

export function normalizeClassification(raw: Record<string, unknown>): ClassificationResult {
  return {
    category: normalizeString(raw.category, ''),
    subcategory: raw.subcategory ? normalizeString(raw.subcategory) : null,
    confidence: normalizeNumber(raw.confidence, 0),
    source: normalizeString(raw.source as string, 'rules') as ClassificationResult['source']
  }
}

export function normalizeDocument(raw: Record<string, unknown>): FinAIDocument {
  return {
    id: normalizeString(raw.id),
    fileName: normalizeString(raw.fileName, '—'),
    contentType: normalizeString(raw.contentType),
    status: (normalizeString(raw.status, 'processing') as FinAIDocument['status']) ?? 'processing',
    uploadedAt: normalizeString(raw.uploadedAt),
    failureReason: raw.failureReason ? normalizeString(raw.failureReason) : null
  }
}

export function normalizeOpenFinanceStatus(raw: Record<string, unknown>): OpenFinanceStatus {
  const lastSync =
    raw.lastSync && typeof raw.lastSync === 'object' ? (raw.lastSync as Record<string, unknown>) : null
  const schedule = raw.schedule && typeof raw.schedule === 'object' ? (raw.schedule as Record<string, unknown>) : null
  return {
    lastSync: lastSync
      ? {
          status: normalizeString(lastSync.status, 'never'),
          accountsImported: normalizeNumber(lastSync.accountsImported),
          transactionsImported: normalizeNumber(lastSync.transactionsImported),
          transactionsSkipped: normalizeNumber(lastSync.transactionsSkipped),
          error: lastSync.error ? normalizeString(lastSync.error) : null,
          startedAt: lastSync.startedAt ? normalizeString(lastSync.startedAt) : null,
          finishedAt: lastSync.finishedAt ? normalizeString(lastSync.finishedAt) : null
        }
      : null,
    schedule: schedule
      ? {
          enabled: Boolean(schedule.enabled),
          intervalHours: normalizeNumber(schedule.intervalHours),
          nextRunAt: schedule.nextRunAt ? normalizeString(schedule.nextRunAt) : null
        }
      : null
  }
}

export function normalizeConnection(raw: Record<string, unknown>): OpenFinanceConnection {
  return {
    id: normalizeString(raw.id),
    itemId: normalizeString(raw.itemId),
    institutionName: raw.institutionName ? normalizeString(raw.institutionName) : null,
    status: raw.status ? normalizeString(raw.status) : null,
    createdAt: normalizeString(raw.createdAt)
  }
}
