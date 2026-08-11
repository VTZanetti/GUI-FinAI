<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { documentService } from '@/api/services/documentService'
import type { FinAIDocument } from '@/types'
import { toApiError } from '@/api/errorService'
import { useToast } from '@/composables/useToast'
import DataState from '@/components/ui/DataState.vue'
import DocumentUpload from '@/components/documents/DocumentUpload.vue'
import DocumentList from '@/components/documents/DocumentList.vue'

const toast = useToast()

const documents = ref<FinAIDocument[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const uploading = ref(false)

let pollTimer: ReturnType<typeof setInterval> | null = null

async function load() {
  loading.value = true
  error.value = null
  try {
    documents.value = await documentService.list()
    managePolling()
  } catch (err) {
    error.value = toApiError(err).message
  } finally {
    loading.value = false
  }
}

/** Polling 3s enquanto houver documentos processing. */
function managePolling() {
  const hasProcessing = documents.value.some((d) => d.status === 'processing')
  if (hasProcessing && !pollTimer) {
    pollTimer = setInterval(async () => {
      try {
        documents.value = await documentService.list()
        const stillProcessing = documents.value.some((d) => d.status === 'processing')
        if (!stillProcessing && pollTimer) {
          clearInterval(pollTimer)
          pollTimer = null
        }
      } catch {
        // mantém polling
      }
    }, 3000)
  } else if (!hasProcessing && pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

async function upload(file: File) {
  if (file.size > 20 * 1024 * 1024) {
    toast.error('Arquivo muito grande (máx. 20MB).')
    return
  }
  uploading.value = true
  try {
    await documentService.upload(file)
    toast.success('Documento enviado. Processando…')
    await load()
  } catch (err) {
    toast.error(toApiError(err).message)
  } finally {
    uploading.value = false
  }
}

async function remove(doc: FinAIDocument) {
  if (!confirm(`Excluir o documento "${doc.fileName}"?`)) return
  try {
    await documentService.remove(doc.id)
    toast.success('Documento excluído.')
    await load()
  } catch (err) {
    toast.error(toApiError(err).message)
  }
}

onMounted(load)
onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold">Documentos</h1>
        <p class="text-sm text-content-muted">Envie extratos para consultar no assistente IA</p>
      </div>
      <DocumentUpload :uploading="uploading" @upload="upload" />
    </div>

    <DataState
      :loading="loading"
      :error="error"
      :empty="!loading && !error && documents.length === 0"
      empty-title="Nenhum documento"
      empty-message="Envie um PDF ou texto para começar."
      @retry="load"
    >
      <DocumentList v-if="documents.length" :documents="documents" @delete="remove" />
    </DataState>
  </div>
</template>
