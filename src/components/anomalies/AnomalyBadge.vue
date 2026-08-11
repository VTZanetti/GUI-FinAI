<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  score: number
}>()

const variant = computed(() => {
  if (props.score >= 0.9) return { class: 'bg-danger/10 text-danger', label: 'Crítico' }
  if (props.score >= 0.7) return { class: 'bg-warning/10 text-warning', label: 'Alto' }
  return { class: 'bg-warning/5 text-warning', label: 'Moderado' }
})
</script>

<template>
  <span :class="['inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', variant.class]">
    {{ (score * 100).toFixed(0) }}% · {{ variant.label }}
  </span>
</template>
