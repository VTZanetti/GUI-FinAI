<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { forecastService } from '@/api/services/forecastService'
import type { CashFlowForecast } from '@/types'
import { toApiError } from '@/api/errorService'
import DataState from '@/components/ui/DataState.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import CashFlowChart from '@/components/charts/CashFlowChart.vue'
import ForecastSummary from '@/components/forecast/ForecastSummary.vue'

const forecast = ref<CashFlowForecast | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const months = ref(6)

const monthOptions = [
  { value: 3, label: '3 meses' },
  { value: 6, label: '6 meses' },
  { value: 12, label: '12 meses' }
]

async function load() {
  loading.value = true
  error.value = null
  try {
    forecast.value = await forecastService.cashFlow(Number(months.value))
  } catch (err) {
    error.value = toApiError(err).message
  } finally {
    loading.value = false
  }
}

function onMonthsChange() {
  load()
}

onMounted(load)
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold">Previsão de Fluxo de Caixa</h1>
        <p class="text-sm text-content-muted">Projeção baseada no seu histórico</p>
      </div>
      <div class="w-40">
        <BaseSelect v-model="months" label="Horizonte" :options="monthOptions" @update:model-value="onMonthsChange" />
      </div>
    </div>

    <DataState :loading="loading" :error="error" :empty="false" @retry="load">
      <div v-if="forecast" class="grid gap-4 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <CashFlowChart :forecast="forecast" />
        </div>
        <ForecastSummary :forecast="forecast" />
      </div>
    </DataState>
  </div>
</template>
