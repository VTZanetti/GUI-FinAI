<script setup lang="ts">
import { computed } from 'vue'
import type { Account } from '@/types'

const props = withDefaults(
  defineProps<{
    accounts: Account[]
    modelValue?: string
  }>(),
  { modelValue: '' }
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const options = computed(() => props.accounts.map((a) => ({ value: a.id, label: a.name })))
</script>

<template>
  <div class="flex flex-col gap-1">
    <label class="text-xs font-medium text-content-muted">Conta</label>
    <select
      class="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-content focus:outline-none focus:ring-2 focus:ring-primary/30"
      :value="modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="" disabled>Selecione a conta…</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </div>
</template>
