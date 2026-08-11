<script setup lang="ts">
import { ref } from 'vue'
import AuditLogTable from '@/components/admin/AuditLogTable.vue'
import UsersTable from '@/components/admin/UsersTable.vue'

const tab = ref<'logs' | 'users'>('logs')
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-4">
    <div>
      <h1 class="text-xl font-semibold">Administração</h1>
      <p class="text-sm text-content-muted">Auditoria e usuários do sistema</p>
    </div>

    <div class="flex gap-1 rounded-lg border border-border bg-surface p-1">
      <button
        class="rounded px-3 py-1.5 text-sm"
        :class="tab === 'logs' ? 'bg-primary/10 font-medium text-primary-dark' : 'text-content-muted hover:bg-slate-100'"
        data-testid="tab-logs"
        @click="tab = 'logs'"
      >
        Audit logs
      </button>
      <button
        class="rounded px-3 py-1.5 text-sm"
        :class="tab === 'users' ? 'bg-primary/10 font-medium text-primary-dark' : 'text-content-muted hover:bg-slate-100'"
        data-testid="tab-users"
        @click="tab = 'users'"
      >
        Usuários
      </button>
    </div>

    <AuditLogTable v-if="tab === 'logs'" />
    <UsersTable v-else />
  </div>
</template>
