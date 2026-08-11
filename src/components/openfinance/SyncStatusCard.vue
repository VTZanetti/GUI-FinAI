<script setup lang="ts">
import { computed } from 'vue'
import { RefreshCw, CheckCircle2, XCircle, Clock, Database } from 'lucide-vue-next'
import type { OpenFinanceStatus } from '@/types'
import { formatDateTime } from '@/utils/date'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import Badge from '@/components/ui/Badge.vue'

const props = defineProps<{
  status: OpenFinanceStatus | null
  syncing?: boolean
}>()

const emit = defineEmits<{ sync: [] }>()

const lastSync = computed(() => props.status?.lastSync)

const statusVariant = computed(() => {
  const s = lastSync.value?.status
  if (s === 'success') return 'success'
  if (s === 'failed') return 'danger'
  if (s === 'running') return 'info'
  return 'muted'
})

const statusLabel = computed(() => {
  const s = lastSync.value?.status
  if (s === 'success') return 'Sucesso'
  if (s === 'failed') return 'Falhou'
  if (s === 'running') return 'Sincronizando…'
  return 'Nunca sincronizado'
})
</script>

<template>
  <BaseCard title="Sincronização Open Finance">
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <Badge :variant="statusVariant">{{ statusLabel }}</Badge>
        <BaseButton :loading="syncing" size="sm" data-testid="sync-now" @click="emit('sync')">
          <RefreshCw class="h-3.5 w-3.5" />
          Sincronizar agora
        </BaseButton>
      </div>

      <div v-if="lastSync" class="grid grid-cols-3 gap-2 text-center">
        <div class="rounded border border-border/50 p-2">
          <Database class="mx-auto mb-1 h-4 w-4 text-content-muted" />
          <p class="text-sm font-semibold text-content">{{ lastSync.accountsImported }}</p>
          <p class="text-[10px] text-content-muted">Contas</p>
        </div>
        <div class="rounded border border-border/50 p-2">
          <CheckCircle2 class="mx-auto mb-1 h-4 w-4 text-success" />
          <p class="text-sm font-semibold text-content">{{ lastSync.transactionsImported }}</p>
          <p class="text-[10px] text-content-muted">Importadas</p>
        </div>
        <div class="rounded border border-border/50 p-2">
          <XCircle class="mx-auto mb-1 h-4 w-4 text-content-muted" />
          <p class="text-sm font-semibold text-content">{{ lastSync.transactionsSkipped }}</p>
          <p class="text-[10px] text-content-muted">Puladas</p>
        </div>
      </div>

      <div v-if="lastSync?.error" class="rounded border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
        {{ lastSync.error }}
      </div>

      <div v-if="lastSync?.finishedAt" class="flex items-center gap-1 text-xs text-content-muted">
        <Clock class="h-3 w-3" />
        Última sincronização: {{ formatDateTime(lastSync.finishedAt) }}
      </div>

      <p v-else class="text-xs text-content-muted">
        Clique em "Sincronizar agora" para importar transações do banco.
      </p>
    </div>
  </BaseCard>
</template>
