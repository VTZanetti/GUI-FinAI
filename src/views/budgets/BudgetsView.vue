<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { budgetService } from '@/api/services/budgetService'
import { categoryService } from '@/api/services/categoryService'
import type { Budget, Category } from '@/types'
import { useToast } from '@/composables/useToast'
import { formatCurrency } from '@/utils/currency'
import { toApiError } from '@/api/errorService'
import DataState from '@/components/ui/DataState.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import Modal from '@/components/ui/Modal.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'

const toast = useToast()

const budgets = ref<Budget[]>([])
const categories = ref<Category[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const now = new Date()
const selectedMonth = ref(now.getMonth() + 1)
const selectedYear = ref(now.getFullYear())

const showModal = ref(false)
const editingBudget = ref<Budget | null>(null)
const saving = ref(false)

const form = ref({
  categoryId: '',
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  limitAmount: 0
})

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: new Date(2000, i, 1).toLocaleDateString('pt-BR', { month: 'long' })
}))
const yearOptions = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => ({
  value: y,
  label: String(y)
}))

async function load() {
  loading.value = true
  error.value = null
  try {
    budgets.value = await budgetService.list({
      month: selectedMonth.value,
      year: selectedYear.value
    })
  } catch (err) {
    error.value = toApiError(err).message
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    categories.value = await categoryService.list()
  } catch {
    // opcional
  }
}

onMounted(() => {
  load()
  loadCategories()
})

function openCreate() {
  editingBudget.value = null
  form.value = {
    categoryId: '',
    month: selectedMonth.value,
    year: selectedYear.value,
    limitAmount: 0
  }
  showModal.value = true
}

function openEdit(budget: Budget) {
  editingBudget.value = budget
  form.value = {
    categoryId: budget.categoryId,
    month: budget.month,
    year: budget.year,
    limitAmount: budget.limitAmount
  }
  showModal.value = true
}

async function save() {
  if (!form.value.categoryId || !form.value.limitAmount) {
    toast.error('Informe categoria e limite.')
    return
  }
  saving.value = true
  try {
    if (editingBudget.value) {
      await budgetService.update(editingBudget.value.id, { limitAmount: Number(form.value.limitAmount) })
      toast.success('Orçamento atualizado.')
    } else {
      await budgetService.create({
        categoryId: form.value.categoryId,
        month: form.value.month,
        year: form.value.year,
        limitAmount: Number(form.value.limitAmount)
      })
      toast.success('Orçamento criado.')
    }
    showModal.value = false
    await load()
  } catch (err) {
    toast.error(toApiError(err).message)
  } finally {
    saving.value = false
  }
}

async function remove(budget: Budget) {
  if (!confirm('Excluir este orçamento?')) return
  try {
    await budgetService.remove(budget.id)
    toast.success('Orçamento excluído.')
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
        <h1 class="text-xl font-semibold">Orçamentos</h1>
        <p class="text-sm text-content-muted">Limites por categoria e progresso</p>
      </div>
      <BaseButton @click="openCreate">
        <Plus class="h-4 w-4" />
        Novo orçamento
      </BaseButton>
    </div>

    <div class="mb-4 flex items-end gap-3 rounded-lg border border-border bg-surface p-3">
      <BaseSelect v-model="selectedMonth" label="Mês" :options="monthOptions" />
      <BaseSelect v-model="selectedYear" label="Ano" :options="yearOptions" />
      <BaseButton variant="secondary" @click="load">Buscar</BaseButton>
    </div>

    <DataState
      :loading="loading"
      :error="error"
      :empty="!loading && !error && budgets.length === 0"
      empty-title="Nenhum orçamento"
      empty-message="Crie um orçamento para acompanhar seus limites."
      @retry="load"
    >
      <div v-if="budgets.length" class="flex flex-col gap-3">
        <div v-for="budget in budgets" :key="budget.id" class="rounded-lg border border-border bg-surface p-4">
          <div class="mb-2 flex items-center justify-between">
            <div>
              <p class="font-medium text-content">{{ budget.categoryName ?? categories.find((c) => c.id === budget.categoryId)?.name ?? 'Categoria' }}</p>
              <p class="text-xs text-content-muted">
                Gasto {{ formatCurrency(budget.spentAmount) }} de {{ formatCurrency(budget.limitAmount) }}
              </p>
            </div>
            <div class="flex gap-1">
              <button class="rounded p-1 text-content-muted hover:bg-slate-100 hover:text-content" aria-label="Editar" @click="openEdit(budget)">
                <Pencil class="h-4 w-4" />
              </button>
              <button class="rounded p-1 text-content-muted hover:bg-red-50 hover:text-danger" aria-label="Excluir" @click="remove(budget)">
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>
          <ProgressBar :percent="budget.progressPercent" />
        </div>
      </div>
    </DataState>

    <Modal :open="showModal" :title="editingBudget ? 'Editar orçamento' : 'Novo orçamento'" @close="showModal = false">
      <form class="flex flex-col gap-4" @submit.prevent="save">
        <BaseSelect
          v-model="form.categoryId"
          label="Categoria"
          :options="categories.filter((c) => !c.isSystem).map((c) => ({ value: c.id, label: c.name }))"
          :disabled="Boolean(editingBudget)"
        />
        <div class="grid grid-cols-2 gap-3">
          <BaseSelect v-model="form.month" label="Mês" :options="monthOptions" :disabled="Boolean(editingBudget)" />
          <BaseSelect v-model="form.year" label="Ano" :options="yearOptions" :disabled="Boolean(editingBudget)" />
        </div>
        <BaseInput v-model.number="form.limitAmount" label="Limite" type="number" step="0.01" data-testid="budget-limit" />
        <div class="flex justify-end gap-2">
          <BaseButton variant="ghost" @click="showModal = false">Cancelar</BaseButton>
          <BaseButton type="submit" :loading="saving">{{ editingBudget ? 'Salvar' : 'Criar' }}</BaseButton>
        </div>
      </form>
    </Modal>
  </div>
</template>
