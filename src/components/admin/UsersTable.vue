<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { adminService } from '@/api/services/adminService'
import type { AdminUser } from '@/types'
import { toApiError } from '@/api/errorService'
import { formatDate } from '@/utils/date'
import DataState from '@/components/ui/DataState.vue'

const users = ref<AdminUser[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    users.value = await adminService.users()
  } catch (err) {
    error.value = toApiError(err).message
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <DataState
    :loading="loading"
    :error="error"
    :empty="!loading && !error && users.length === 0"
    empty-title="Nenhum usuário"
    empty-message="Nenhum usuário cadastrado."
    @retry="load"
  >
    <div v-if="users.length" class="overflow-x-auto rounded-lg border border-border bg-surface">
      <table class="w-full text-sm">
        <thead class="border-b border-border bg-slate-50 text-left text-xs text-content-muted">
          <tr>
            <th class="px-3 py-2 font-medium">Nome</th>
            <th class="px-3 py-2 font-medium">E-mail</th>
            <th class="px-3 py-2 font-medium">Papéis</th>
            <th class="px-3 py-2 font-medium">Criado em</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="border-b border-border/50 last:border-0 hover:bg-slate-50">
            <td class="px-3 py-2 font-medium text-content">{{ user.firstName }} {{ user.lastName }}</td>
            <td class="px-3 py-2 text-content-muted">{{ user.email }}</td>
            <td class="px-3 py-2">
              <span
                v-for="role in user.roles"
                :key="role"
                class="mr-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
              >
                {{ role }}
              </span>
            </td>
            <td class="px-3 py-2 text-xs text-content-muted">{{ formatDate(user.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </DataState>
</template>
