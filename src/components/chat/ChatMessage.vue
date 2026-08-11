<script setup lang="ts">
import { Bot, User, AlertCircle } from 'lucide-vue-next'
import Badge from '@/components/ui/Badge.vue'

defineProps<{
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  error?: boolean
}>()
</script>

<template>
  <div class="flex items-start gap-2" :data-testid="`chat-${role}`">
    <div
      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
      :class="role === 'assistant' ? 'bg-primary/10' : 'bg-slate-200'"
    >
      <Bot v-if="role === 'assistant'" class="h-4 w-4 text-primary" />
      <User v-else class="h-4 w-4 text-content-muted" />
    </div>
    <div class="max-w-[80%] flex flex-col gap-1">
      <div
        class="rounded-lg border px-3 py-2"
        :class="[
          role === 'assistant' ? 'border-border bg-surface' : 'border-primary/20 bg-primary/5',
          error ? 'border-danger/30 bg-danger/5' : ''
        ]"
      >
        <!-- Conteúdo tratado como texto puro (sem v-html) -->
        <p class="whitespace-pre-wrap text-sm text-content" data-testid="chat-content">{{ content }}</p>
      </div>
      <div v-if="sources && sources.length" class="flex gap-1">
        <Badge v-for="src in sources" :key="src" :variant="src === 'documents' ? 'info' : 'success'">
          {{ src === 'documents' ? '📄 documentos' : '📊 analytics' }}
        </Badge>
      </div>
      <p v-if="error" class="flex items-center gap-1 text-xs text-danger">
        <AlertCircle class="h-3 w-3" />
        Erro ao obter resposta
      </p>
    </div>
  </div>
</template>
