<script setup lang="ts">
import { computed } from 'vue'
import { Cpu } from 'lucide-vue-next'
import type { CashFlowForecast } from '@/types'
import BaseCard from '@/components/ui/BaseCard.vue'
import Badge from '@/components/ui/Badge.vue'

const props = defineProps<{
  forecast: CashFlowForecast | null
}>()

const levelVariant = computed(() => {
  const level = props.forecast?.confidence.level
  if (level === 'high') return 'success'
  if (level === 'low') return 'danger'
  return 'warning'
})

const levelLabel = computed(() => {
  const level = props.forecast?.confidence.level
  if (level === 'high') return 'Alta'
  if (level === 'low') return 'Baixa'
  return 'Média'
})
</script>

<template>
  <BaseCard title="Sobre a previsão">
    <div class="flex flex-col gap-2 text-sm">
      <div class="flex items-center gap-2">
        <Cpu class="h-4 w-4 text-content-muted" />
        <span class="text-content-muted">Método:</span>
        <span class="font-medium text-content">{{ forecast?.method ?? '—' }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-content-muted">Confiança:</span>
        <Badge :variant="levelVariant">{{ levelLabel }}</Badge>
      </div>
      <p class="text-xs text-content-muted">{{ forecast?.confidence.note }}</p>
      <p v-if="forecast?.generatedAt" class="text-xs text-content-muted">
        Gerado em {{ new Date(forecast.generatedAt).toLocaleString('pt-BR') }}
      </p>
    </div>
  </BaseCard>
</template>
