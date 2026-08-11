<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PiggyBank,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Bot,
  FileText,
  Landmark,
  ShieldCheck
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { IS_DEMO_MODE } from '@/api/mocks'

const route = useRoute()
const auth = useAuthStore()

const items = computed(() => {
  const base = [
    { name: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { name: 'accounts', label: 'Contas', icon: Wallet },
    { name: 'transactions', label: 'Transações', icon: ArrowLeftRight },
    { name: 'budgets', label: 'Orçamentos', icon: PiggyBank },
    { name: 'analytics', label: 'Analytics', icon: BarChart3 },
    { name: 'forecast', label: 'Previsão', icon: TrendingUp },
    { name: 'anomalies', label: 'Anomalias', icon: AlertTriangle },
    { name: 'chat', label: 'Assistente IA', icon: Bot },
    { name: 'documents', label: 'Documentos', icon: FileText },
    { name: 'open-finance', label: 'Open Finance', icon: Landmark }
  ]
  if (auth.isAdmin) {
    base.push({ name: 'admin', label: 'Administração', icon: ShieldCheck })
  }
  return base
})
</script>

<template>
  <aside class="flex h-full w-56 flex-col border-r border-border bg-surface">
    <div class="flex items-center gap-2 border-b border-border px-4 py-4">
      <div class="flex h-8 w-8 items-center justify-center rounded bg-primary text-sm font-bold text-white">
        F
      </div>
      <div>
        <p class="text-sm font-semibold text-content">FinAI</p>
        <p class="text-[10px] text-content-muted">Painel financeiro</p>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto p-2">
      <RouterLink
        v-for="item in items"
        :key="item.name"
        :to="{ name: item.name }"
        class="mb-0.5 flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors"
        :class="
          route.name === item.name
            ? 'bg-primary-light font-medium text-primary-dark'
            : 'text-content-muted hover:bg-slate-100 hover:text-content'
        "
      >
        <component :is="item.icon" class="h-4 w-4" />
        {{ item.label }}
        <span
          v-if="item.name === 'admin'"
          class="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary"
        >
          Admin
        </span>
      </RouterLink>
    </nav>

    <div v-if="IS_DEMO_MODE" class="border-t border-border p-3">
      <p class="rounded bg-warning/10 px-2 py-1.5 text-[11px] text-warning">
        Modo demonstração — dados fictícios
      </p>
    </div>
  </aside>
</template>