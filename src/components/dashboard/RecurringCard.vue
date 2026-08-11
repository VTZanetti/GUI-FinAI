<script setup lang="ts">
import { computed } from 'vue'
import { Repeat } from 'lucide-vue-next'
import type { SpendingSummary } from '@/types'
import { formatCurrency, formatPercent } from '@/utils/currency'
import BaseCard from '@/components/ui/BaseCard.vue'

const props = defineProps<{
  summary: SpendingSummary | null
}>()

const recurring = computed(() => props.summary?.recurring)
</script>

<template>
  <BaseCard title="Despesas recorrentes">
    <div class="flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded bg-info/10">
        <Repeat class="h-5 w-5 text-info" />
      </div>
      <div>
        <p class="text-lg font-semibold text-content">{{ formatCurrency(recurring?.amount ?? 0) }}</p>
        <p class="text-xs text-content-muted">
          {{ formatPercent(recurring?.percentageOfExpenses ?? 0) }} das despesas
        </p>
      </div>
    </div>
  </BaseCard>
</template>
