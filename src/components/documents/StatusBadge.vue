<script setup lang="ts">
import { computed } from 'vue'

type Status = 'processing' | 'ready' | 'failed'

const props = defineProps<{
  status: Status
}>()

const classes = computed(() => {
  const map: Record<Status, string> = {
    processing: 'bg-info/10 text-info',
    ready: 'bg-success/10 text-success',
    failed: 'bg-danger/10 text-danger'
  }
  return map[props.status] ?? 'bg-slate-100 text-slate-600'
})

const labels: Record<Status, string> = {
  processing: 'Processando',
  ready: 'Pronto',
  failed: 'Falhou'
}
</script>

<template>
  <span :class="['inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', classes]" data-testid="doc-status">
    <span
      v-if="status === 'processing'"
      class="h-1.5 w-1.5 animate-pulse rounded-full bg-info"
    />
    {{ labels[status] }}
  </span>
</template>
