<script setup lang="ts">
import { ref } from 'vue'
import { aiService } from '@/api/services/aiService'
import { toApiError } from '@/api/errorService'
import ChatWindow, { type ChatEntry } from '@/components/chat/ChatWindow.vue'
import ChatInput from '@/components/chat/ChatInput.vue'

const messages = ref<ChatEntry[]>([])
const loading = ref(false)
const includeDocuments = ref(false)

const suggestions = [
  'Quanto gastei este mês?',
  'Onde posso economizar?',
  'Quais categorias mais cresceram?'
]

async function send(payload: { question: string; includeDocuments: boolean }) {
  messages.value.push({ role: 'user', content: payload.question })
  loading.value = true
  try {
    const res = await aiService.financialAdvisor({
      question: payload.question,
      includeDocuments: payload.includeDocuments
    })
    messages.value.push({
      role: 'assistant',
      content: res.answer,
      sources: res.sources ?? []
    })
  } catch (err) {
    const apiError = toApiError(err)
    messages.value.push({
      role: 'assistant',
      content: apiError.message,
      sources: [],
      error: true
    })
  } finally {
    loading.value = false
  }
}

function askSuggestion(suggestion: string) {
  send({ question: suggestion, includeDocuments: includeDocuments.value })
}
</script>

<template>
  <div class="mx-auto flex h-full max-w-4xl flex-col">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h1 class="text-xl font-semibold">Assistente IA</h1>
        <p class="text-sm text-content-muted">Pergunte sobre suas finanças</p>
      </div>
      <div v-if="messages.length === 0" class="flex flex-wrap gap-1">
        <button
          v-for="s in suggestions"
          :key="s"
          class="rounded-full border border-border px-2.5 py-1 text-xs text-content-muted hover:bg-slate-100 hover:text-content"
          @click="askSuggestion(s)"
        >
          {{ s }}
        </button>
      </div>
    </div>

    <div class="flex-1 rounded-lg border border-border bg-surface/50" style="min-height: 60vh">
      <ChatWindow :messages="messages" :loading="loading" />
    </div>

    <ChatInput
      v-model:include-documents="includeDocuments"
      :disabled="loading"
      @send="send"
    />
  </div>
</template>
