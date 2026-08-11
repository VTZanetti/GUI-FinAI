<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    label?: string
    type?: 'text' | 'email' | 'password' | 'number' | 'date'
    placeholder?: string
    error?: string
    disabled?: boolean
    required?: boolean
  }>(),
  {
    modelValue: '',
    type: 'text',
    placeholder: '',
    disabled: false,
    required: false
  }
)

const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()

const classes = computed(() => {
  const base =
    'w-full rounded border bg-surface px-3 py-2 text-sm text-content placeholder:text-content-muted/60 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-content-muted'
  return `${base} ${
    props.error
      ? 'border-danger focus:ring-danger/30'
      : 'border-border focus:border-primary focus:ring-primary/30'
  }`
})
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-xs font-medium text-content-muted">
      {{ label }}<span v-if="required" class="text-danger"> *</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="classes"
      :aria-invalid="Boolean(error)"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="text-xs text-danger" data-testid="field-error">{{ error }}</span>
  </div>
</template>
