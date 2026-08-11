<script setup lang="ts">
import { Landmark } from 'lucide-vue-next'
import type { OpenFinanceConnection } from '@/types'
import { formatDate } from '@/utils/date'
import BaseCard from '@/components/ui/BaseCard.vue'

defineProps<{
  connections: OpenFinanceConnection[]
}>()
</script>

<template>
  <BaseCard title="Conexões">
    <div v-if="connections.length" class="flex flex-col gap-2">
      <div
        v-for="conn in connections"
        :key="conn.id"
        class="flex items-center gap-2 rounded border border-border/50 p-2"
      >
        <div class="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
          <Landmark class="h-4 w-4 text-primary" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-content">{{ conn.institutionName ?? conn.itemId }}</p>
          <p class="text-xs text-content-muted">Conectado em {{ formatDate(conn.createdAt) }}</p>
        </div>
        <span class="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">Conectado</span>
      </div>
    </div>
    <p v-else class="text-sm text-content-muted">Nenhuma conexão ainda. Use "Conectar banco".</p>
  </BaseCard>
</template>
