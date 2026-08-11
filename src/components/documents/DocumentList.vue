<script setup lang="ts">
import { FileText, Trash2 } from 'lucide-vue-next'
import type { FinAIDocument } from '@/types'
import { formatDateTime } from '@/utils/date'
import StatusBadge from './StatusBadge.vue'

defineProps<{
  documents: FinAIDocument[]
}>()

const emit = defineEmits<{ delete: [doc: FinAIDocument] }>()
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-border bg-surface">
    <table class="w-full text-sm">
      <thead class="border-b border-border bg-slate-50 text-left text-xs text-content-muted">
        <tr>
          <th class="px-3 py-2 font-medium">Arquivo</th>
          <th class="px-3 py-2 font-medium">Tipo</th>
          <th class="px-3 py-2 font-medium">Status</th>
          <th class="px-3 py-2 font-medium">Enviado</th>
          <th class="px-3 py-2 font-medium">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="doc in documents" :key="doc.id" class="border-b border-border/50 last:border-0 hover:bg-slate-50">
          <td class="px-3 py-2">
            <span class="flex items-center gap-2 font-medium text-content">
              <FileText class="h-4 w-4 text-content-muted" />
              {{ doc.fileName }}
            </span>
          </td>
          <td class="px-3 py-2 text-xs text-content-muted">{{ doc.contentType }}</td>
          <td class="px-3 py-2">
            <StatusBadge :status="doc.status" />
            <p v-if="doc.status === 'failed' && doc.failureReason" class="mt-0.5 text-xs text-danger">
              {{ doc.failureReason }}
            </p>
          </td>
          <td class="px-3 py-2 text-xs text-content-muted">{{ formatDateTime(doc.uploadedAt) }}</td>
          <td class="px-3 py-2">
            <button
              class="rounded p-1 text-content-muted hover:bg-red-50 hover:text-danger"
              aria-label="Excluir documento"
              @click="emit('delete', doc)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
