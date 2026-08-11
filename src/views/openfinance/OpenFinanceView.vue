<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { openFinanceService } from '@/api/services/openFinanceService'
import type { OpenFinanceConnection, OpenFinanceStatus } from '@/types'
import { toApiError } from '@/api/errorService'
import { useToast } from '@/composables/useToast'
import DataState from '@/components/ui/DataState.vue'
import PluggyConnectButton from '@/components/openfinance/PluggyConnectButton.vue'
import SyncStatusCard from '@/components/openfinance/SyncStatusCard.vue'
import ConnectionsList from '@/components/openfinance/ConnectionsList.vue'

const toast = useToast()

const status = ref<OpenFinanceStatus | null>(null)
const connections = ref<OpenFinanceConnection[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const syncing = ref(false)

async function load() {
  loading.value = true
  error.value = null
  try {
    const [s, conns] = await Promise.all([
      openFinanceService.status(),
      openFinanceService.listConnections()
    ])
    status.value = s
    connections.value = conns
  } catch (err) {
    error.value = toApiError(err).message
  } finally {
    loading.value = false
  }
}

/** Sync manual + polling do status até terminar. */
async function sync() {
  syncing.value = true
  try {
    await openFinanceService.sync()
    toast.info('Sincronização iniciada…')
    await pollUntilDone()
  } catch (err) {
    toast.error(toApiError(err).message)
  } finally {
    syncing.value = false
  }
}

async function pollUntilDone() {
  // Polling 3s até success|failed (máx ~2 min)
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 3000))
    try {
      const s = await openFinanceService.status()
      status.value = s
      const last = s.lastSync
      if (last && (last.status === 'success' || last.status === 'failed')) {
        if (last.status === 'success') toast.success('Sincronização concluída.')
        return
      }
    } catch {
      return
    }
  }
}

async function onConnected() {
  await load()
}

onMounted(load)
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold">Open Finance</h1>
        <p class="text-sm text-content-muted">Conecte seu banco e sincronize transações</p>
      </div>
      <PluggyConnectButton @connected="onConnected" />
    </div>

    <DataState :loading="loading" :error="error" :empty="false" @retry="load">
      <div class="grid gap-4 lg:grid-cols-2">
        <SyncStatusCard :status="status" :syncing="syncing" @sync="sync" />
        <ConnectionsList :connections="connections" />
      </div>
    </DataState>
  </div>
</template>
