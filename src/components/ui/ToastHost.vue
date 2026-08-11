<script setup lang="ts">
import { CheckCircle2, XCircle, Info } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2" data-testid="toast-host">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-center gap-2 rounded-lg border bg-surface px-4 py-3 shadow-lg"
          :class="{
            'border-success/30': toast.type === 'success',
            'border-danger/30': toast.type === 'error',
            'border-info/30': toast.type === 'info'
          }"
          role="status"
        >
          <component :is="icons[toast.type]" class="h-4 w-4 shrink-0" :class="{
            'text-success': toast.type === 'success',
            'text-danger': toast.type === 'error',
            'text-info': toast.type === 'info'
          }" />
          <span class="text-sm text-content">{{ toast.message }}</span>
          <button class="ml-2 text-content-muted hover:text-content" aria-label="Fechar" @click="remove(toast.id)">
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
