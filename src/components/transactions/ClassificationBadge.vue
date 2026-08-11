<script setup lang="ts">
import { computed } from 'vue'

type Source = 'rules' | 'cached' | 'llm' | 'external'

const props = defineProps<{
  source: Source
  confidence?: number
}>()

const sourceLabel = computed(() => {
  const map: Record<Source, string> = {
    rules: 'Regras',
    cached: 'Cache',
    llm: 'IA',
    external: 'Externo'
  }
  return map[props.source] ?? props.source
})

const variant = computed(() => {
  const map: Record<Source, string> = {
    rules: 'bg-slate-100 text-slate-600',
    cached: 'bg-info/10 text-info',
    llm: 'bg-primary/10 text-primary-dark',
    external: 'bg-warning/10 text-warning'
  }
  return map[props.source] ?? 'bg-slate-100 text-slate-600'
})
</script>

<template>
  <span
    :class="['inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', variant]"
    :title="source === 'llm' ? 'Classificado pela IA' : `Classificado por ${sourceLabel.toLowerCase()}`"
    data-testid="classification-badge"
  >
    {{ sourceLabel }}
    <span v-if="confidence !== undefined" class="opacity-75">{{ (confidence * 100).toFixed(0) }}%</span>
  </span>
</template>
