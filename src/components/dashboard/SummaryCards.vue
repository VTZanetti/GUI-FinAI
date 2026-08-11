<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-vue-next'
import type { SpendingSummary } from '@/types'
import { formatCurrency } from '@/utils/currency'
import BaseCard from '@/components/ui/BaseCard.vue'

const props = defineProps<{
  summary: SpendingSummary | null
}>()

const cards = computed(() => [
  {
    label: 'Receitas',
    value: formatCurrency(props.summary?.totals.income ?? 0),
    icon: TrendingUp,
    class: 'text-success'
  },
  {
    label: 'Despesas',
    value: formatCurrency(props.summary?.totals.expenses ?? 0),
    icon: TrendingDown,
    class: 'text-danger'
  },
  {
    label: 'Balanço',
    value: formatCurrency(props.summary?.totals.balance ?? 0),
    icon: Wallet,
    class: (props.summary?.totals.balance ?? 0) < 0 ? 'text-danger' : 'text-primary'
  }
])
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-3">
    <BaseCard v-for="card in cards" :key="card.label">
      <div class="flex items-center justify-between">
        <p class="text-xs font-medium text-content-muted">{{ card.label }}</p>
        <component :is="card.icon" class="h-4 w-4" :class="card.class" />
      </div>
      <p class="mt-1 text-xl font-semibold text-content" data-testid="summary-value">{{ card.value }}</p>
    </BaseCard>
  </div>
</template>
