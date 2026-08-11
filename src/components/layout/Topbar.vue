<script setup lang="ts">
import { LogOut } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

async function handleLogout() {
  await auth.logout()
  toast.info('Você saiu da sua conta.')
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="flex h-14 items-center justify-between border-b border-border bg-surface px-4">
    <h1 class="text-sm font-semibold text-content">
      {{ auth.user?.firstName ? `Olá, ${auth.user.firstName}` : 'FinAI' }}
    </h1>
    <div class="flex items-center gap-3">
      <span class="text-xs text-content-muted">{{ auth.user?.email }}</span>
      <span
        v-if="auth.isAdmin"
        class="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"
      >
        Admin
      </span>
      <button
        class="flex items-center gap-1 rounded px-2 py-1 text-xs text-content-muted hover:bg-slate-100 hover:text-content"
        data-testid="logout-button"
        @click="handleLogout"
      >
        <LogOut class="h-3.5 w-3.5" />
        Sair
      </button>
    </div>
  </header>
</template>