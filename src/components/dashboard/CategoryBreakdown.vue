<script setup lang="ts">
import { computed } from 'vue'
import type { SpendingSummary } from '@/types'
import { formatCurrency } from '@/utils/currency'
import BaseCard from '@/components/ui/BaseCard.vue'

const props = defineProps<{
  summary: SpendingSummary | null
}>()

const items = computed(() => props.summary?.byCategory ?? [])
</script>

<template>
  <BaseCard title="Composição por categoria" subtitle="Despesas do período">
    <div v-if="items.length" class="flex flex-col gap-2">
      <div v-for="item in items" :key="item.category" class="flex flex-col gap-0.5">
        <div class="flex items-center justify-between text-sm">
          <span class="text-content">{{ item.category }}</span>
          <span class="text-xs text-content-muted">
            {{ formatCurrency(item.amount) }} · {{ item.percentage.toFixed(1).replace('.', ',') }}%
          </span>
        </div>
        <div class="h-1.5 w-full overflow-hidden rounded bg-slate-100">
          <div class="h-full rounded bg-primary" :style="{ width: `${Math.min(100, item.percentage)}%` }" />
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-content-muted">Sem dados no período.</p>
  </BaseCard>
</template>
