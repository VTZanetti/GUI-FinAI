/** Caminhos da API v1 — único lugar com URLs. */
export const ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout'
  },
  accounts: '/accounts',
  categories: '/categories',
  transactions: '/transactions',
  budgets: '/budgets',
  analytics: {
    spendingSummary: '/analytics/spending-summary',
    behavior: '/analytics/behavior',
    monthlyTrend: '/analytics/monthly-trend'
  },
  forecast: '/forecast/cash-flow',
  anomalies: '/anomalies',
  anomaliesCheck: '/anomalies/check',
  ai: {
    classify: '/ai/classify',
    financialAdvisor: '/ai/financial-advisor'
  },
  documents: '/documents',
  openFinance: {
    sync: '/open-finance/sync',
    status: '/open-finance/status',
    accounts: '/open-finance/accounts',
    connectToken: '/open-finance/connect-token',
    connections: '/open-finance/connections',
    schedule: '/open-finance/sync/schedule'
  },
  admin: {
    auditLogs: '/admin/audit-logs',
    users: '/admin/users'
  },
  health: '/health',
  healthReady: '/health/ready'
} as const
