<script setup lang="ts">
import { computed } from 'vue'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'

const props = withDefaults(
  defineProps<{
    variant?: BadgeVariant
  }>(),
  { variant: 'default' }
)

const classes = computed(() => {
  const map: Record<BadgeVariant, string> = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-info/10 text-info',
    muted: 'bg-slate-100 text-content-muted'
  }
  return `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${map[props.variant]}`
})
</script>

<template>
  <span :class="classes"><slot /></span>
</template>
