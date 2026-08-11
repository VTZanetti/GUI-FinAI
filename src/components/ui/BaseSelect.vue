<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string | number
    label?: string
    error?: string
    disabled?: boolean
    options: { value: string | number; label: string }[]
    placeholder?: string
  }>(),
  {
    modelValue: '',
    disabled: false,
    placeholder: 'Selecione…'
  }
)

const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-xs font-medium text-content-muted">{{ label }}</label>
    <select
      :value="modelValue"
      :disabled="disabled"
      :class="[
        'w-full rounded border bg-surface px-3 py-2 text-sm text-content focus:outline-none focus:ring-2 disabled:bg-slate-50',
        error ? 'border-danger focus:ring-danger/30' : 'border-border focus:border-primary focus:ring-primary/30'
      ]"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="String(opt.value)" :value="opt.value">{{ opt.label }}</option>
    </select>
    <span v-if="error" class="text-xs text-danger">{{ error }}</span>
  </div>
</template>
