<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import type { CashFlowForecast } from '@/types'
import { shortMonthLabel } from '@/utils/date'
import BaseCard from '@/components/ui/BaseCard.vue'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const props = defineProps<{
  forecast: CashFlowForecast | null
}>()

const chartData = computed(() => ({
  labels: (props.forecast?.forecast ?? []).map((f) => shortMonthLabel(f.month)),
  datasets: [
    {
      label: 'Receitas',
      data: (props.forecast?.forecast ?? []).map((f) => f.income),
      borderColor: 'rgb(34 197 94)',
      backgroundColor: 'rgb(34 197 94 / 0.1)',
      tension: 0.3
    },
    {
      label: 'Despesas',
      data: (props.forecast?.forecast ?? []).map((f) => f.expenses),
      borderColor: 'rgb(239 68 68)',
      backgroundColor: 'rgb(239 68 68 / 0.1)',
      tension: 0.3
    },
    {
      label: 'Saldo',
      data: (props.forecast?.forecast ?? []).map((f) => f.balance),
      borderColor: 'rgb(37 99 235)',
      backgroundColor: 'rgb(37 99 235 / 0.1)',
      tension: 0.3
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const }
  }
}
</script>

<template>
  <BaseCard title="Previsão de fluxo de caixa">
    <div v-if="(forecast?.forecast ?? []).length" class="h-72">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <p v-else class="text-sm text-content-muted">Sem dados suficientes para previsão.</p>
  </BaseCard>
</template>
