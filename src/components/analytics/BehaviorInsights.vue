<script setup lang="ts">
import { computed } from 'vue'
import { Info, TrendingUp, TrendingDown, AlertTriangle, Repeat } from 'lucide-vue-next'
import type { BehaviorInsight } from '@/types'
import BaseCard from '@/components/ui/BaseCard.vue'

const props = defineProps<{
  insights: BehaviorInsight[]
}>()

function iconFor(type: string) {
  if (type.includes('increase') || type.includes('growth')) return TrendingUp
  if (type.includes('decrease') || type.includes('reduction')) return TrendingDown
  if (type.includes('anomaly') || type.includes('alert')) return AlertTriangle
  if (type.includes('recurring')) return Repeat
  return Info
}

function classFor(type: string) {
  if (type.includes('increase') || type.includes('alert')) return 'text-warning'
  if (type.includes('decrease')) return 'text-success'
  return 'text-info'
}

const items = computed(() => props.insights ?? [])
</script>

<template>
  <BaseCard title="Insights de comportamento">
    <div v-if="items.length" class="flex flex-col gap-2">
      <div
        v-for="(insight, i) in items"
        :key="i"
        class="flex items-start gap-2 rounded border border-border/50 p-2"
      >
        <component :is="iconFor(insight.type)" class="mt-0.5 h-4 w-4 shrink-0" :class="classFor(insight.type)" />
        <p class="text-sm text-content">{{ insight.message }}</p>
      </div>
    </div>
    <p v-else class="text-sm text-content-muted">Sem insights no momento.</p>
  </BaseCard>
</template>
