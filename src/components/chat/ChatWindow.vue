<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Bot, Loader2 } from 'lucide-vue-next'
import ChatMessage from './ChatMessage.vue'

export interface ChatEntry {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  error?: boolean
}

const props = withDefaults(
  defineProps<{
    messages: ChatEntry[]
    loading?: boolean
  }>(),
  { loading: false }
)

const scrollRef = ref<HTMLElement | null>(null)

watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    const el = scrollRef.value
    if (el && typeof el.scrollTo === 'function') {
      el.scrollTo({ top: el.scrollHeight })
    } else if (el) {
      el.scrollTop = el.scrollHeight
    }
  }
)
</script>

<template>
  <div ref="scrollRef" class="flex h-full flex-col gap-3 overflow-y-auto p-4">
    <div v-if="messages.length === 0" class="flex flex-col items-center gap-2 py-10 text-center">
      <Bot class="h-10 w-10 text-primary/40" />
      <p class="text-sm font-medium text-content">Assistente financeiro</p>
      <p class="max-w-sm text-xs text-content-muted">
        Pergunte sobre seus gastos, receitas e tendências. Posso consultar seus dados e documentos.
      </p>
    </div>

    <ChatMessage
      v-for="(msg, i) in messages"
      :key="i"
      :role="msg.role"
      :content="msg.content"
      :sources="msg.sources"
      :error="msg.error"
    />

    <div v-if="loading" class="flex items-start gap-2" data-testid="chat-loading">
      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Bot class="h-4 w-4 text-primary" />
      </div>
      <div class="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
        <Loader2 class="h-4 w-4 animate-spin text-primary" />
        <span class="text-sm text-content-muted">Pensando…</span>
      </div>
    </div>
  </div>
</template>
