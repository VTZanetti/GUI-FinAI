<script setup lang="ts">
import { X } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    open?: boolean
    title?: string
  }>(),
  {
    open: false,
    title: ''
  }
)

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      data-testid="modal-overlay"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-md rounded-lg bg-surface p-5 shadow-xl" role="dialog" aria-modal="true">
        <header class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-content">{{ title }}</h3>
          <button class="text-content-muted hover:text-content" aria-label="Fechar" @click="emit('close')">
            <X class="h-5 w-5" />
          </button>
        </header>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
