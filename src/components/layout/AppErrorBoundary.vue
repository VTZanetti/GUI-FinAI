<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'

defineProps<{
  error?: Error | null
}>()

const emit = defineEmits<{ reset: [] }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 rounded-lg border border-danger/30 bg-danger/5 p-8 text-center">
    <AlertTriangle class="h-8 w-8 text-danger" />
    <p class="text-sm font-medium text-content">Algo deu errado nesta tela.</p>
    <p class="max-w-md text-xs text-content-muted">
      {{ error?.message ?? 'Ocorreu um erro inesperado. Tente novamente.' }}
    </p>
    <button
      class="rounded border border-border bg-surface px-3 py-1.5 text-xs text-content-muted hover:bg-slate-100"
      data-testid="error-boundary-reset"
      @click="emit('reset')"
    >
      Tentar novamente
    </button>
  </div>
</template>