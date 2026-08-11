<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Anomaly } from '@/types'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import AnomalyBadge from './AnomalyBadge.vue'

defineProps<{
  items: Anomaly[]
}>()

const router = useRouter()

function goToTransaction(anomaly: Anomaly) {
  router.push({ name: 'transactions', query: { search: anomaly.description } })
}
</script>

<template>
  <div v-if="items.length" class="overflow-x-auto rounded-lg border border-border bg-surface">
    <table class="w-full text-sm">
      <thead class="border-b border-border bg-slate-50 text-left text-xs text-content-muted">
        <tr>
          <th class="px-3 py-2 font-medium">Data</th>
          <th class="px-3 py-2 font-medium">Descrição</th>
          <th class="px-3 py-2 font-medium">Categoria</th>
          <th class="px-3 py-2 text-right font-medium">Valor</th>
          <th class="px-3 py-2 font-medium">Score</th>
          <th class="px-3 py-2 font-medium">Motivo</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in items"
          :key="item.transactionId"
          class="cursor-pointer border-b border-border/50 last:border-0 hover:bg-slate-50"
          @click="goToTransaction(item)"
        >
          <td class="px-3 py-2 text-content-muted">{{ formatDate(item.date) }}</td>
          <td class="px-3 py-2 font-medium text-content">{{ item.description }}</td>
          <td class="px-3 py-2 text-content-muted">{{ item.category ?? '—' }}</td>
          <td class="px-3 py-2 text-right font-semibold text-danger">{{ formatCurrency(item.amount) }}</td>
          <td class="px-3 py-2"><AnomalyBadge :score="item.score" /></td>
          <td class="max-w-xs px-3 py-2 text-xs text-content-muted">{{ item.reason }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <p v-else class="rounded-lg border border-border bg-surface p-4 text-center text-sm text-content-muted">
    Nenhuma anomalia no período.
  </p>
</template>
