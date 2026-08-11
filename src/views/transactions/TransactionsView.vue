<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Plus, Pencil, Trash2, Wand2, ArrowLeft, ArrowRight } from 'lucide-vue-next'
import { transactionService } from '@/api/services/transactionService'
import { accountService } from '@/api/services/accountService'
import { categoryService } from '@/api/services/categoryService'
import { aiService } from '@/api/services/aiService'
import type { Account, Category, PagedResponse, Transaction, TransactionType } from '@/types'
import { useToast } from '@/composables/useToast'
import { formatCurrency } from '@/utils/currency'
import { formatDate as fmtDate } from '@/utils/date'
import { toApiError } from '@/api/errorService'
import { todayISO } from '@/utils/date'
import DataState from '@/components/ui/DataState.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import Modal from '@/components/ui/Modal.vue'
import ClassificationBadge from '@/components/transactions/ClassificationBadge.vue'

const toast = useToast()

const transactions = ref<Transaction[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const page = ref(1)
const pageSize = 20
const totalItems = ref(0)
const totalPages = ref(0)

const accounts = ref<Account[]>([])
const categories = ref<Category[]>([])

const filters = ref({
  search: '',
  type: '' as TransactionType | '',
  accountId: '',
  categoryId: '',
  from: '',
  to: '',
  isRecurring: '' as '' | 'true' | 'false'
})

const showModal = ref(false)
const editingTx = ref<Transaction | null>(null)
const saving = ref(false)
const classifying = ref(false)

const form = ref({
  description: '',
  amount: 0,
  date: todayISO(),
  accountId: '',
  categoryId: '',
  isRecurring: false
})

const classificationResult = ref<{
  category?: string
  confidence: number
  source: 'rules' | 'cached' | 'llm' | 'external'
} | null>(null)

const typeOptions = [
  { value: '', label: 'Todos os tipos' },
  { value: 'income', label: 'Receitas' },
  { value: 'expense', label: 'Despesas' }
]

const recurringOptions = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Recorrentes' },
  { value: 'false', label: 'Não recorrentes' }
]

async function load() {
  loading.value = true
  error.value = null
  try {
    const res: PagedResponse<Transaction> = await transactionService.list({
      page: page.value,
      pageSize,
      search: filters.value.search || undefined,
      type: filters.value.type || undefined,
      accountId: filters.value.accountId || undefined,
      categoryId: filters.value.categoryId || undefined,
      from: filters.value.from || undefined,
      to: filters.value.to || undefined,
      isRecurring: filters.value.isRecurring === '' ? undefined : filters.value.isRecurring === 'true',
      sortBy: 'date',
      sortOrder: 'desc'
    })
    transactions.value = res.items
    totalItems.value = res.totalItems
    totalPages.value = res.totalPages
  } catch (err) {
    error.value = toApiError(err).message
  } finally {
    loading.value = false
  }
}

async function loadRefs() {
  try {
    const [accs, cats] = await Promise.all([accountService.list(), categoryService.list()])
    accounts.value = accs.items
    categories.value = cats
  } catch {
    // refs opcionais
  }
}

onMounted(() => {
  load()
  loadRefs()
})

function applyFilters() {
  page.value = 1
  load()
}

function openCreate() {
  editingTx.value = null
  classificationResult.value = null
  form.value = {
    description: '',
    amount: 0,
    date: todayISO(),
    accountId: accounts.value[0]?.id ?? '',
    categoryId: '',
    isRecurring: false
  }
  showModal.value = true
}

function openEdit(tx: Transaction) {
  editingTx.value = tx
  classificationResult.value = tx.classification ?? null
  form.value = {
    description: tx.description,
    amount: tx.amount,
    date: tx.date,
    accountId: tx.accountId,
    categoryId: tx.category?.name ? categories.value.find((c) => c.name === tx.category?.name)?.id ?? '' : '',
    isRecurring: tx.isRecurring
  }
  showModal.value = true
}

/** Pré-classificação via POST /ai/classify */
async function classify() {
  if (!form.value.description.trim() || !form.value.amount) {
    toast.error('Informe descrição e valor para classificar.')
    return
  }
  classifying.value = true
  try {
    const result = await aiService.classify({
      description: form.value.description,
      amount: Number(form.value.amount)
    })
    classificationResult.value = result
    const match = categories.value.find((c) => c.name === result.category)
    if (match) form.value.categoryId = match.id
    toast.success(`Classificado como ${result.category} (${result.source}).`)
  } catch (err) {
    toast.error(toApiError(err).message)
  } finally {
    classifying.value = false
  }
}

async function save() {
  if (!form.value.description.trim() || !form.value.amount || !form.value.date || !form.value.accountId) {
    toast.error('Preencha descrição, valor, data e conta.')
    return
  }
  saving.value = true
  try {
    const payload = {
      accountId: form.value.accountId,
      description: form.value.description.trim(),
      amount: Number(form.value.amount),
      date: form.value.date,
      categoryId: form.value.categoryId || null,
      isRecurring: form.value.isRecurring
    }
    if (editingTx.value) {
      await transactionService.update(editingTx.value.id, payload)
      toast.success('Transação atualizada.')
    } else {
      const created = await transactionService.create(payload)
      if (created.classification) {
        toast.success('Transação criada e classificada automaticamente.')
      } else {
        toast.success('Transação criada.')
      }
    }
    showModal.value = false
    await load()
  } catch (err) {
    toast.error(toApiError(err).message)
  } finally {
    saving.value = false
  }
}

async function remove(tx: Transaction) {
  if (!confirm(`Excluir a transação "${tx.description}"?`)) return
  try {
    await transactionService.remove(tx.id)
    toast.success('Transação excluída.')
    await load()
  } catch (err) {
    toast.error(toApiError(err).message)
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">Transações</h1>
        <p class="text-sm text-content-muted">Registre e filtre suas movimentações</p>
      </div>
      <BaseButton @click="openCreate">
        <Plus class="h-4 w-4" />
        Nova transação
      </BaseButton>
    </div>

    <!-- Filtros -->
    <div class="mb-4 grid gap-2 rounded-lg border border-border bg-surface p-3 sm:grid-cols-2 lg:grid-cols-6">
      <BaseInput v-model="filters.search" label="Buscar" placeholder="Descrição…" @keyup.enter="applyFilters" />
      <BaseSelect v-model="filters.type" label="Tipo" :options="typeOptions" />
      <BaseSelect
        v-model="filters.accountId"
        label="Conta"
        :options="[{ value: '', label: 'Todas' }, ...accounts.map((a) => ({ value: a.id, label: a.name }))]"
      />
      <BaseSelect
        v-model="filters.categoryId"
        label="Categoria"
        :options="[{ value: '', label: 'Todas' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]"
      />
      <div class="flex gap-2">
        <BaseInput v-model="filters.from" label="De" type="date" />
        <BaseInput v-model="filters.to" label="Até" type="date" />
      </div>
      <div class="flex items-end gap-2">
        <BaseSelect v-model="filters.isRecurring" label="Recorrente" :options="recurringOptions" />
        <BaseButton size="sm" variant="secondary" @click="applyFilters">Filtrar</BaseButton>
      </div>
    </div>

    <DataState
      :loading="loading"
      :error="error"
      :empty="!loading && !error && transactions.length === 0"
      empty-title="Nenhuma transação"
      empty-message="Crie uma transação ou ajuste os filtros."
      @retry="load"
    >
      <div v-if="transactions.length" class="overflow-x-auto rounded-lg border border-border bg-surface">
        <table class="w-full text-sm">
          <thead class="border-b border-border bg-slate-50 text-left text-xs text-content-muted">
            <tr>
              <th class="px-3 py-2 font-medium">Data</th>
              <th class="px-3 py-2 font-medium">Descrição</th>
              <th class="px-3 py-2 font-medium">Categoria</th>
              <th class="px-3 py-2 font-medium">Classificação</th>
              <th class="px-3 py-2 text-right font-medium">Valor</th>
              <th class="px-3 py-2 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in transactions" :key="tx.id" class="border-b border-border/50 last:border-0 hover:bg-slate-50">
              <td class="px-3 py-2 text-content-muted">{{ fmtDate(tx.date) }}</td>
              <td class="px-3 py-2 font-medium text-content">
                {{ tx.description }}
                <span v-if="tx.isRecurring" class="ml-1 rounded bg-primary/10 px-1 py-0.5 text-[10px] text-primary">recorrente</span>
              </td>
              <td class="px-3 py-2 text-content-muted">{{ tx.category?.name ?? '—' }}</td>
              <td class="px-3 py-2">
                <ClassificationBadge v-if="tx.classification" :source="tx.classification.source" :confidence="tx.classification.confidence" />
                <span v-else class="text-xs text-content-muted">—</span>
              </td>
              <td class="px-3 py-2 text-right font-semibold" :class="tx.amount < 0 ? 'text-danger' : 'text-success'">
                {{ formatCurrency(tx.amount) }}
              </td>
              <td class="px-3 py-2">
                <div class="flex gap-1">
                  <button class="rounded p-1 text-content-muted hover:bg-slate-100 hover:text-content" aria-label="Editar" @click="openEdit(tx)">
                    <Pencil class="h-3.5 w-3.5" />
                  </button>
                  <button class="rounded p-1 text-content-muted hover:bg-red-50 hover:text-danger" aria-label="Excluir" @click="remove(tx)">
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginação -->
        <div class="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-content-muted">
          <span>{{ totalItems }} transação(ões)</span>
          <div class="flex items-center gap-2">
            <BaseButton size="sm" variant="ghost" :disabled="page <= 1" @click="page--; load()">
              <ArrowLeft class="h-3 w-3" />
            </BaseButton>
            <span>Página {{ page }} de {{ totalPages }}</span>
            <BaseButton size="sm" variant="ghost" :disabled="page >= totalPages" @click="page++; load()">
              <ArrowRight class="h-3 w-3" />
            </BaseButton>
          </div>
        </div>
      </div>
    </DataState>

    <!-- Modal form -->
    <Modal :open="showModal" :title="editingTx ? 'Editar transação' : 'Nova transação'" @close="showModal = false">
      <form class="flex flex-col gap-4" @submit.prevent="save">
        <BaseInput v-model="form.description" label="Descrição" placeholder="Ex.: UBER *TRIP" data-testid="tx-description" />
        <div class="grid grid-cols-2 gap-3">
          <BaseInput v-model.number="form.amount" label="Valor (negativo = despesa)" type="number" step="0.01" data-testid="tx-amount" />
          <BaseInput v-model="form.date" label="Data" type="date" data-testid="tx-date" />
        </div>
        <BaseSelect
          v-model="form.accountId"
          label="Conta"
          :options="accounts.map((a) => ({ value: a.id, label: a.name }))"
        />
        <BaseSelect
          v-model="form.categoryId"
          label="Categoria"
          :options="[
            { value: '', label: 'Automática (IA)' },
            ...categories.filter((c) => !c.isSystem).map((c) => ({ value: c.id, label: c.name }))
          ]"
        />

        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 text-sm text-content-muted">
            <input v-model="form.isRecurring" type="checkbox" class="h-4 w-4" />
            Recorrente
          </label>
          <BaseButton type="button" size="sm" variant="secondary" :loading="classifying" @click="classify">
            <Wand2 class="h-3.5 w-3.5" />
            Classificar
          </BaseButton>
        </div>

        <div
          v-if="classificationResult"
          class="flex items-center justify-between rounded border border-primary/30 bg-primary/5 px-3 py-2"
        >
          <span class="text-sm text-content">{{ classificationResult.category }}</span>
          <ClassificationBadge :source="classificationResult.source" :confidence="classificationResult.confidence" />
        </div>

        <div class="flex justify-end gap-2">
          <BaseButton variant="ghost" @click="showModal = false">Cancelar</BaseButton>
          <BaseButton type="submit" :loading="saving">{{ editingTx ? 'Salvar' : 'Criar' }}</BaseButton>
        </div>
      </form>
    </Modal>
  </div>
</template>
