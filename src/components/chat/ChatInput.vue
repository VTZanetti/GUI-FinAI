<script setup lang="ts">
import { ref } from 'vue'
import { SendHorizonal } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    includeDocuments?: boolean
    disabled?: boolean
  }>(),
  {
    includeDocuments: false,
    disabled: false
  }
)

const emit = defineEmits<{
  send: [payload: { question: string; includeDocuments: boolean }]
  'update:includeDocuments': [value: boolean]
}>()

const question = ref('')

function submit() {
  const text = question.value.trim()
  if (!text || props.disabled) return
  emit('send', { question: text, includeDocuments: props.includeDocuments })
  question.value = ''
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    submit()
  }
}
</script>

<template>
  <div class="flex flex-col gap-2 border-t border-border bg-surface p-3">
    <div class="flex items-center gap-2">
      <textarea
        v-model="question"
        rows="2"
        class="flex-1 resize-none rounded border border-border bg-surface px-3 py-2 text-sm text-content placeholder:text-content-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
        placeholder="Pergunte sobre suas finanças… (Enter envia, Shift+Enter quebra linha)"
        data-testid="chat-input"
        :disabled="disabled"
        @keydown="onKeydown"
      />
      <button
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
        :disabled="disabled || !question.trim()"
        aria-label="Enviar"
        data-testid="chat-send"
        @click="submit"
      >
        <SendHorizonal class="h-4 w-4" />
      </button>
    </div>
    <label class="flex w-fit items-center gap-2 text-xs text-content-muted">
      <input
        type="checkbox"
        :checked="includeDocuments"
        class="h-3.5 w-3.5"
        data-testid="include-documents"
        @change="emit('update:includeDocuments', ($event.target as HTMLInputElement).checked)"
      />
      Incluir documentos (RAG)
    </label>
  </div>
</template>
