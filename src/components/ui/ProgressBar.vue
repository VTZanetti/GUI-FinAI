<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    percent: number
  }>(),
  { percent: 0 }
)

const clamped = computed(() => Math.min(100, Math.max(0, props.percent)))

const barClass = computed(() => {
  if (props.percent > 100) return 'bg-danger'
  if (props.percent >= 80) return 'bg-warning'
  return 'bg-success'
})

const label = computed(() => `${props.percent.toFixed(1).replace('.', ',')}%`)
</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="h-2 w-full overflow-hidden rounded bg-slate-100">
      <div :class="['h-full rounded transition-all', barClass]" :style="{ width: `${clamped}%` }" data-testid="progress-bar" />
    </div>
    <span class="text-xs text-content-muted">{{ label }}</span>
  </div>
</template>
