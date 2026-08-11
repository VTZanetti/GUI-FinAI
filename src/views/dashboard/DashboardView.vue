<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { analyticsService } from '@/api/services/analyticsService'
import type { SpendingSummary } from '@/types'
import { toApiError } from '@/api/errorService'
import { startOfMonthISO, todayISO } from '@/utils/date'
import DataState from '@/components/ui/DataState.vue'
import SummaryCards from '@/components/dashboard/SummaryCards.vue'
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown.vue'
import RecurringCard from '@/components/dashboard/RecurringCard.vue'
import PeriodPicker, { type PeriodRange } from '@/components/dashboard/PeriodPicker.vue'

const summary = ref<SpendingSummary | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const period = ref<PeriodRange>({
  from: startOfMonthISO(),
  to: todayISO(),
  label: 'Este mês'
})

async function load() {
  loading.value = true
  error.value = null
  try {
    summary.value = await analyticsService.spendingSummary({
      from: period.value.from,
      to: period.value.to
    })
  } catch (err) {
    error.value = toApiError(err).message
  } finally {
    loading.value = false
  }
}

function onPeriodChange(newPeriod: PeriodRange) {
  period.value = newPeriod
  load()
}

onMounted(load)
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold">Dashboard</h1>
        <p class="text-sm text-content-muted">Resumo do período: {{ period.label }}</p>
      </div>
      <PeriodPicker :model-value="period" @update:model-value="onPeriodChange" />
    </div>

    <DataState :loading="loading" :error="error" :empty="false" @retry="load">
      <div v-if="summary" class="flex flex-col gap-4">
        <SummaryCards :summary="summary" />
        <div class="grid gap-4 lg:grid-cols-3">
          <div class="lg:col-span-2">
            <CategoryBreakdown :summary="summary" />
          </div>
          <RecurringCard :summary="summary" />
        </div>
      </div>
    </DataState>
  </div>
</template>
