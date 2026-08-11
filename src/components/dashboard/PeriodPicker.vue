<script setup lang="ts">
import { ref, watch } from 'vue'
import { startOfMonthISO, monthRange, toISODate } from '@/utils/date'

export interface PeriodRange {
  from: string
  to: string
  label: string
}

const props = withDefaults(
  defineProps<{
    modelValue?: PeriodRange
  }>(),
  {
    modelValue: () => ({ from: '', to: '', label: '' })
  }
)

const emit = defineEmits<{ 'update:modelValue': [value: PeriodRange] }>()

const now = new Date()
const presets: { key: string; label: string; range: () => PeriodRange }[] = [
  { key: 'this-month', label: 'Este mês', range: () => ({ from: startOfMonthISO(), to: toISODate(now), label: 'Este mês' }) },
  { key: 'last-month', label: 'Mês passado', range: () => {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const to = new Date(now.getFullYear(), now.getMonth(), 0)
    return { from: toISODate(from), to: toISODate(to), label: 'Mês passado' }
  } },
  { key: '3m', label: 'Últimos 3 meses', range: () => ({ ...monthRange(3), label: 'Últimos 3 meses' }) },
  { key: '6m', label: 'Últimos 6 meses', range: () => ({ ...monthRange(6), label: 'Últimos 6 meses' }) },
  { key: '12m', label: 'Últimos 12 meses', range: () => ({ ...monthRange(12), label: 'Últimos 12 meses' }) }
]

const activeKey = ref('this-month')
const from = ref(startOfMonthISO())
const to = ref(toISODate(now))
const custom = ref(false)

function selectPreset(key: string) {
  const preset = presets.find((p) => p.key === key)
  if (!preset) return
  activeKey.value = key
  custom.value = false
  from.value = preset.range().from
  to.value = preset.range().to
  emit('update:modelValue', { from: from.value, to: to.value, label: preset.label })
}

function applyCustom() {
  custom.value = true
  activeKey.value = ''
  emit('update:modelValue', { from: from.value, to: to.value, label: 'Período customizado' })
}

watch(
  () => props.modelValue,
  () => {
    if (!props.modelValue.from && !props.modelValue.to) {
      selectPreset('this-month')
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <button
      v-for="preset in presets"
      :key="preset.key"
      class="rounded border px-2.5 py-1 text-xs"
      :class="activeKey === preset.key ? 'border-primary bg-primary/10 font-medium text-primary-dark' : 'border-border text-content-muted hover:bg-slate-100'"
      @click="selectPreset(preset.key)"
    >
      {{ preset.label }}
    </button>
    <button
      class="rounded border px-2.5 py-1 text-xs"
      :class="custom ? 'border-primary bg-primary/10 font-medium text-primary-dark' : 'border-border text-content-muted hover:bg-slate-100'"
      @click="custom = !custom"
    >
      Custom
    </button>
    <div v-if="custom" class="flex items-center gap-2">
      <input v-model="from" type="date" class="rounded border border-border px-2 py-1 text-xs" />
      <span class="text-xs text-content-muted">até</span>
      <input v-model="to" type="date" class="rounded border border-border px-2 py-1 text-xs" />
      <button class="rounded bg-primary px-2.5 py-1 text-xs text-white" @click="applyCustom">Aplicar</button>
    </div>
  </div>
</template>
