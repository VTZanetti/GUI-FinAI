<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { anomalyService } from '@/api/services/anomalyService'
import type { Anomaly } from '@/types'
import { toApiError } from '@/api/errorService'
import { monthRange } from '@/utils/date'
import DataState from '@/components/ui/DataState.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import AnomalyTable from '@/components/anomalies/AnomalyTable.vue'

const items = ref<Anomaly[]>([])
const method = ref('zscore')
const loading = ref(false)
const error = ref<string | null>(null)
const range = ref(monthRange(3))
const from = ref(range.value.from)
const to = ref(range.value.to)

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await anomalyService.list({
      from: from.value,
      to: to.value,
      method: method.value as 'zscore' | 'iqr'
    })
    items.value = res.items
  } catch (err) {
    error.value = toApiError(err).message
  } finally {
    loading.value = false
  }
}

function applyPeriod() {
  load()
}

onMounted(load)
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold">Anomalias</h1>
        <p class="text-sm text-content-muted">Transações fora do padrão no período</p>
      </div>
      <div class="flex items-end gap-2">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-content-muted">De</label>
          <input v-model="from" type="date" class="rounded border border-border px-2 py-1.5 text-sm" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-content-muted">Até</label>
          <input v-model="to" type="date" class="rounded border border-border px-2 py-1.5 text-sm" />
        </div>
        <BaseButton variant="secondary" @click="applyPeriod">Filtrar</BaseButton>
      </div>
    </div>

    <DataState :loading="loading" :error="error" :empty="false" @retry="load">
      <AnomalyTable :items="items" />
    </DataState>
  </div>
</template>
