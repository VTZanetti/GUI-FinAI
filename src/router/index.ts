import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresAdmin?: boolean
    title?: string
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { title: 'Entrar' }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { title: 'Criar conta' }
  },
  {
    path: '/',
    component: () => import('@/components/layout/AppShell.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { requiresAuth: true, title: 'Dashboard' }
      },
      {
        path: 'accounts',
        name: 'accounts',
        component: () => import('@/views/accounts/AccountsView.vue'),
        meta: { requiresAuth: true, title: 'Contas' }
      },
      {
        path: 'transactions',
        name: 'transactions',
        component: () => import('@/views/transactions/TransactionsView.vue'),
        meta: { requiresAuth: true, title: 'Transações' }
      },
      {
        path: 'budgets',
        name: 'budgets',
        component: () => import('@/views/budgets/BudgetsView.vue'),
        meta: { requiresAuth: true, title: 'Orçamentos' }
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: () => import('@/views/analytics/AnalyticsView.vue'),
        meta: { requiresAuth: true, title: 'Analytics' }
      },
      {
        path: 'forecast',
        name: 'forecast',
        component: () => import('@/views/forecast/ForecastView.vue'),
        meta: { requiresAuth: true, title: 'Previsão' }
      },
      {
        path: 'anomalies',
        name: 'anomalies',
        component: () => import('@/views/anomalies/AnomaliesView.vue'),
        meta: { requiresAuth: true, title: 'Anomalias' }
      },
      {
        path: 'chat',
        name: 'chat',
        component: () => import('@/views/ai/ChatView.vue'),
        meta: { requiresAuth: true, title: 'Assistente IA' }
      },
      {
        path: 'documents',
        name: 'documents',
        component: () => import('@/views/documents/DocumentsView.vue'),
        meta: { requiresAuth: true, title: 'Documentos' }
      },
      {
        path: 'open-finance',
        name: 'open-finance',
        component: () => import('@/views/openfinance/OpenFinanceView.vue'),
        meta: { requiresAuth: true, title: 'Open Finance' }
      },
      {
        path: 'admin',
        name: 'admin',
        component: () => import('@/views/admin/AdminView.vue'),
        meta: { requiresAuth: true, requiresAdmin: true, title: 'Administração' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'dashboard', query: { denied: '1' } }
  }
  if ((to.name === 'login' || to.name === 'register') && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · FinAI` : 'FinAI'
})

export default router
