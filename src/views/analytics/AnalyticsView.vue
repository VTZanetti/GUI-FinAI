<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { analyticsService } from '@/api/services/analyticsService'
import type { BehaviorInsight, MonthlyTrend } from '@/types'
import { toApiError } from '@/api/errorService'
import DataState from '@/components/ui/DataState.vue'
import MonthlyTrendChart from '@/components/charts/MonthlyTrendChart.vue'
import BehaviorInsights from '@/components/analytics/BehaviorInsights.vue'

const insights = ref<BehaviorInsight[]>([])
const trend = ref<MonthlyTrend | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    const [ins, tr] = await Promise.all([
      analyticsService.behavior(3),
      analyticsService.monthlyTrend(12)
    ])
    insights.value = ins
    trend.value = tr
  } catch (err) {
    error.value = toApiError(err).message
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-4">
    <div>
      <h1 class="text-xl font-semibold">Analytics</h1>
      <p class="text-sm text-content-muted">Comportamento e tendência dos seus gastos</p>
    </div>

    <DataState :loading="loading" :error="error" :empty="false" @retry="load">
      <div class="flex flex-col gap-4">
        <MonthlyTrendChart :trend="trend" />
        <BehaviorInsights :insights="insights" />
      </div>
    </DataState>
  </div>
</template>
