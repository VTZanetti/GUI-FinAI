import { http, HttpResponse } from 'msw'

/** Handlers MSW — reutilizados nos testes de view (mesmos shapes dos contratos). */
export const handlers = [
  http.post('/api/v1/auth/login', () =>
    HttpResponse.json({
      userId: 'test-user',
      email: 'user@test.com',
      accessToken: 'test-access-token',
      expiresIn: 900,
      refreshToken: 'test-refresh-token'
    })
  ),
  http.post('/api/v1/auth/register', () =>
    HttpResponse.json(
      {
        userId: 'test-user',
        email: 'user@test.com',
        accessToken: 'test-access-token',
        expiresIn: 900,
        refreshToken: 'test-refresh-token'
      },
      { status: 201 }
    )
  ),
  http.post('/api/v1/auth/refresh', () =>
    HttpResponse.json({
      userId: 'test-user',
      email: 'user@test.com',
      accessToken: 'new-access-token',
      expiresIn: 900,
      refreshToken: 'new-refresh-token'
    })
  ),
  http.post('/api/v1/auth/logout', () => new HttpResponse(null, { status: 204 })),
  http.get('/api/v1/accounts', () =>
    HttpResponse.json({ items: [], page: 1, pageSize: 20, totalItems: 0, totalPages: 0 })
  ),
  http.get('/api/v1/categories', () => HttpResponse.json([])),
  http.get('/api/v1/transactions', () =>
    HttpResponse.json({ items: [], page: 1, pageSize: 20, totalItems: 0, totalPages: 0 })
  ),
  http.get('/api/v1/budgets', () => HttpResponse.json([])),
  http.get('/api/v1/analytics/spending-summary', () =>
    HttpResponse.json({
      period: { from: '2026-08-01', to: '2026-08-31' },
      totals: { income: 0, expenses: 0, balance: 0 },
      byCategory: [],
      recurring: { amount: 0, percentageOfExpenses: 0 }
    })
  ),
  http.get('/api/v1/analytics/behavior', () => HttpResponse.json({ insights: [] })),
  http.get('/api/v1/analytics/monthly-trend', () => HttpResponse.json({ months: [] })),
  http.get('/api/v1/forecast/cash-flow', () =>
    HttpResponse.json({ method: 'test', generatedAt: '', forecast: [], confidence: { level: 'medium', note: '' } })
  ),
  http.get('/api/v1/anomalies', () => HttpResponse.json({ method: 'zscore', items: [] })),
  http.get('/api/v1/health', () => HttpResponse.json({ status: 'Healthy' })),
  http.get('/api/v1/health/ready', () => HttpResponse.json({ status: 'Ready' }))
]
