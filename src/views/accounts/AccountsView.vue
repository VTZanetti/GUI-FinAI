<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { accountService } from '@/api/services/accountService'
import { categoryService } from '@/api/services/categoryService'
import type { Account, AccountType, Category } from '@/types'
import { useToast } from '@/composables/useToast'
import { formatCurrency } from '@/utils/currency'
import { toApiError } from '@/api/errorService'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import DataState from '@/components/ui/DataState.vue'
import Modal from '@/components/ui/Modal.vue'

const toast = useToast()

const accounts = ref<Account[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const categories = ref<Category[]>([])
const categoriesLoading = ref(false)

const showModal = ref(false)
const editingAccount = ref<Account | null>(null)
const saving = ref(false)

const form = ref({
  name: '',
  type: 'Checking' as AccountType,
  currency: 'BRL',
  initialBalance: 0
})

const typeOptions = [
  { value: 'Checking', label: 'Conta Corrente' },
  { value: 'Savings', label: 'Poupança' },
  { value: 'CreditCard', label: 'Cartão de Crédito' },
  { value: 'Cash', label: 'Dinheiro' },
  { value: 'Investment', label: 'Investimento' }
]

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await accountService.list()
    accounts.value = res.items
  } catch (err) {
    error.value = toApiError(err).message
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  categoriesLoading.value = true
  try {
    categories.value = await categoryService.list()
  } catch {
    // categorias opcionais — não bloqueia
  } finally {
    categoriesLoading.value = false
  }
}

onMounted(() => {
  load()
  loadCategories()
})

function openCreate() {
  editingAccount.value = null
  form.value = { name: '', type: 'Checking', currency: 'BRL', initialBalance: 0 }
  showModal.value = true
}

function openEdit(account: Account) {
  editingAccount.value = account
  form.value = {
    name: account.name,
    type: account.type,
    currency: account.currency,
    initialBalance: account.initialBalance
  }
  showModal.value = true
}

async function save() {
  if (!form.value.name.trim()) {
    toast.error('Informe o nome da conta.')
    return
  }
  saving.value = true
  try {
    if (editingAccount.value) {
      await accountService.update(editingAccount.value.id, {
        name: form.value.name,
        type: form.value.type,
        currency: form.value.currency
      })
      toast.success('Conta atualizada.')
    } else {
      await accountService.create({
        name: form.value.name,
        type: form.value.type,
        currency: form.value.currency,
        initialBalance: Number(form.value.initialBalance) || 0
      })
      toast.success('Conta criada.')
    }
    showModal.value = false
    await load()
  } catch (err) {
    toast.error(toApiError(err).message)
  } finally {
    saving.value = false
  }
}

async function remove(account: Account) {
  if (!confirm(`Excluir a conta "${account.name}"?`)) return
  try {
    await accountService.remove(account.id)
    toast.success('Conta excluída.')
    await load()
  } catch (err) {
    toast.error(toApiError(err).message)
  }
}
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">Contas</h1>
        <p class="text-sm text-content-muted">Suas contas e saldos</p>
      </div>
      <BaseButton @click="openCreate">
        <Plus class="h-4 w-4" />
        Nova conta
      </BaseButton>
    </div>

    <DataState
      :loading="loading"
      :error="error"
      :empty="!loading && !error && accounts.length === 0"
      empty-title="Nenhuma conta"
      empty-message="Crie sua primeira conta para começar."
      @retry="load"
    >
      <div v-if="accounts.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <BaseCard v-for="account in accounts" :key="account.id">
          <div class="flex items-start justify-between">
            <div>
              <p class="font-medium text-content">{{ account.name }}</p>
              <p class="text-xs text-content-muted">{{ typeOptions.find((t) => t.value === account.type)?.label ?? account.type }}</p>
            </div>
            <div class="flex gap-1">
              <button class="rounded p-1 text-content-muted hover:bg-slate-100 hover:text-content" aria-label="Editar" @click="openEdit(account)">
                <Pencil class="h-4 w-4" />
              </button>
              <button class="rounded p-1 text-content-muted hover:bg-red-50 hover:text-danger" aria-label="Excluir" @click="remove(account)">
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>
          <p class="mt-2 text-lg font-semibold" :class="account.currentBalance < 0 ? 'text-danger' : 'text-content'">
            {{ formatCurrency(account.currentBalance) }}
          </p>
        </BaseCard>
      </div>
    </DataState>

    <Modal :open="showModal" :title="editingAccount ? 'Editar conta' : 'Nova conta'" @close="showModal = false">
      <form class="flex flex-col gap-4" @submit.prevent="save">
        <BaseInput v-model="form.name" label="Nome" placeholder="Ex.: Nubank" data-testid="account-name" />
        <BaseSelect v-model="form.type" label="Tipo" :options="typeOptions" data-testid="account-type" />
        <BaseInput v-model="form.currency" label="Moeda (ISO-4217)" placeholder="BRL" :disabled="Boolean(editingAccount)" data-testid="account-currency" />
        <BaseInput
          v-if="!editingAccount"
          v-model.number="form.initialBalance"
          label="Saldo inicial"
          type="number"
          step="0.01"
          data-testid="account-balance"
        />
        <div class="flex justify-end gap-2">
          <BaseButton variant="ghost" @click="showModal = false">Cancelar</BaseButton>
          <BaseButton type="submit" :loading="saving">{{ editingAccount ? 'Salvar' : 'Criar' }}</BaseButton>
        </div>
      </form>
    </Modal>
  </div>
</template>
