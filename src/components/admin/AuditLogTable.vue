<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { adminService } from '@/api/services/adminService'
import type { AuditLog, AuditLogFilters } from '@/types'
import { toApiError } from '@/api/errorService'
import { formatDateTime } from '@/utils/date'
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'
import DataState from '@/components/ui/DataState.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const props = defineProps<{
  filters?: Partial<AuditLogFilters>
}>()

const logs = ref<AuditLog[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const page = ref(1)
const pageSize = 50
const totalPages = ref(0)
const totalItems = ref(0)

const actionFilter = ref('')
const from = ref('')
const to = ref('')

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await adminService.auditLogs({
      page: page.value,
      pageSize,
      action: actionFilter.value || undefined,
      from: from.value || undefined,
      to: to.value || undefined,
      ...props.filters
    })
    logs.value = res.items
    totalPages.value = res.totalPages
    totalItems.value = res.totalItems
  } catch (err) {
    error.value = toApiError(err).message
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  page.value = 1
  load()
}

onMounted(load)
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-end gap-2">
      <BaseInput v-model="actionFilter" label="Ação" placeholder="ex.: transaction.create" @keyup.enter="applyFilters" />
      <BaseInput v-model="from" label="De" type="date" />
      <BaseInput v-model="to" label="Até" type="date" />
      <BaseButton variant="secondary" size="sm" @click="applyFilters">Filtrar</BaseButton>
    </div>

    <DataState
      :loading="loading"
      :error="error"
      :empty="!loading && !error && logs.length === 0"
      empty-title="Nenhum log"
      empty-message="Nenhuma auditoria encontrada."
      @retry="load"
    >
      <div v-if="logs.length" class="overflow-x-auto rounded-lg border border-border bg-surface">
        <table class="w-full text-sm">
          <thead class="border-b border-border bg-slate-50 text-left text-xs text-content-muted">
            <tr>
              <th class="px-3 py-2 font-medium">Data</th>
              <th class="px-3 py-2 font-medium">Usuário</th>
              <th class="px-3 py-2 font-medium">Ação</th>
              <th class="px-3 py-2 font-medium">Entidade</th>
              <th class="px-3 py-2 font-medium">IP</th>
              <th class="px-3 py-2 font-medium">Metadata</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id" class="border-b border-border/50 last:border-0 hover:bg-slate-50">
              <td class="px-3 py-2 text-xs text-content-muted">{{ formatDateTime(log.occurredAt) }}</td>
              <td class="px-3 py-2 text-xs text-content-muted">{{ log.userId.slice(0, 8) }}</td>
              <td class="px-3 py-2">
                <span class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-content">{{ log.action }}</span>
              </td>
              <td class="px-3 py-2 text-xs text-content-muted">{{ log.entityType }}{{ log.entityId ? ` #${log.entityId.slice(0, 8)}` : '' }}</td>
              <td class="px-3 py-2 text-xs text-content-muted">{{ log.ipAddress ?? '—' }}</td>
              <td class="max-w-[200px] truncate px-3 py-2 font-mono text-[10px] text-content-muted">
                {{ log.metadata ? JSON.stringify(log.metadata) : '—' }}
              </td>
            </tr>
          </tbody>
        </table>

        <div class="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-content-muted">
          <span>{{ totalItems }} registro(s)</span>
          <div class="flex items-center gap-2">
            <BaseButton size="sm" variant="ghost" :disabled="page <= 1" @click="page--; load()">
              <ArrowLeft class="h-3 w-3" />
            </BaseButton>
            <span>Página {{ page }} de {{ totalPages || 1 }}</span>
            <BaseButton size="sm" variant="ghost" :disabled="page >= totalPages" @click="page++; load()">
              <ArrowRight class="h-3 w-3" />
            </BaseButton>
          </div>
        </div>
      </div>
    </DataState>
  </div>
</template>
