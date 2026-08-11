<script setup lang="ts">
import { Loader2, Inbox, AlertCircle } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    loading?: boolean
    empty?: boolean
    error?: string | null
    emptyTitle?: string
    emptyMessage?: string
  }>(),
  {
    loading: false,
    empty: false,
    error: null,
    emptyTitle: 'Nada por aqui',
    emptyMessage: 'Não há dados para exibir.'
  }
)

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-10 text-center" data-testid="data-state">
    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center gap-2">
      <Loader2 class="h-8 w-8 animate-spin text-primary" />
      <p class="text-sm text-content-muted">Carregando…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex flex-col items-center gap-2">
      <AlertCircle class="h-8 w-8 text-danger" />
      <p class="text-sm text-content">{{ error }}</p>
      <button
        class="mt-1 rounded border border-border px-3 py-1.5 text-xs text-content-muted hover:bg-slate-100"
        @click="emit('retry')"
      >
        Tentar novamente
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="empty" class="flex flex-col items-center gap-2">
      <Inbox class="h-8 w-8 text-content-muted/50" />
      <p class="text-sm font-medium text-content">{{ emptyTitle }}</p>
      <p class="text-xs text-content-muted">{{ emptyMessage }}</p>
    </div>

    <!-- Conteúdo real -->
    <slot v-else />
  </div>
</template>
