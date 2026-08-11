<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
  }>(),
  {
    title: '',
    subtitle: ''
  }
)
</script>

<template>
  <section class="rounded-lg border border-border bg-surface p-4 shadow-sm">
    <header v-if="title || subtitle" class="mb-3">
      <h3 v-if="title" class="text-sm font-semibold text-content">{{ title }}</h3>
      <p v-if="subtitle" class="mt-0.5 text-xs text-content-muted">{{ subtitle }}</p>
    </header>
    <slot />
  </section>
</template>
