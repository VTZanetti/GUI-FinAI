<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import type { MonthlyTrend } from '@/types'
import { shortMonthLabel } from '@/utils/date'
import BaseCard from '@/components/ui/BaseCard.vue'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{
  trend: MonthlyTrend | null
}>()

const chartData = computed(() => ({
  labels: (props.trend?.months ?? []).map((m) => shortMonthLabel(m.month)),
  datasets: [
    {
      label: 'Receitas',
      data: (props.trend?.months ?? []).map((m) => m.income),
      backgroundColor: 'rgb(34 197 94 / 0.7)'
    },
    {
      label: 'Despesas',
      data: (props.trend?.months ?? []).map((m) => m.expenses),
      backgroundColor: 'rgb(239 68 68 / 0.7)'
    },
    {
      label: 'Balanço',
      data: (props.trend?.months ?? []).map((m) => m.balance),
      backgroundColor: 'rgb(37 99 235 / 0.6)'
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const }
  },
  scales: {
    x: { stacked: false },
    y: { beginAtZero: false }
  }
}
</script>

<template>
  <BaseCard title="Tendência mensal" subtitle="Últimos 12 meses">
    <div v-if="(trend?.months ?? []).length" class="h-72">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
    <p v-else class="text-sm text-content-muted">Sem dados suficientes para exibir.</p>
  </BaseCard>
</template>
