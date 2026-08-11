<script setup lang="ts">
import { ref } from 'vue'
import { openFinanceService } from '@/api/services/openFinanceService'
import { useToast } from '@/composables/useToast'
import { toApiError } from '@/api/errorService'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
  }>(),
  { disabled: false }
)

const emit = defineEmits<{ connected: [itemId: string] }>()

const toast = useToast()
const loading = ref(false)
let scriptLoaded = false

/** Carrega o script do CDN oficial uma única vez. */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (scriptLoaded) {
      resolve()
      return
    }
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      scriptLoaded = true
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = () => {
      scriptLoaded = true
      resolve()
    }
    script.onerror = () => reject(new Error('Falha ao carregar o widget da Pluggy.'))
    document.head.appendChild(script)
  })
}

async function connectBank() {
  if (props.disabled || loading.value) return
  loading.value = true
  try {
    // 1. connect-token do backend (usuário autenticado)
    const { accessToken } = await openFinanceService.connectToken()

    // 2. Carregar widget do CDN
    await loadScript('https://cdn.pluggy.ai/connect/v2/pluggy-connect.js')

    // 3. Inicializar widget
    const PluggyConnect = window.PluggyConnect
    if (!PluggyConnect) {
      throw new Error('Widget da Pluggy indisponível.')
    }
    const widget = new PluggyConnect({
      connectToken: accessToken,
      includeSandbox: true,
      onSuccess: async (data) => {
        await openFinanceService.linkConnection({ itemId: data.item.id })
        toast.success('Banco conectado com sucesso!')
        emit('connected', data.item.id)
      },
      onError: (error) => {
        toast.error(error?.message ?? 'Falha ao conectar o banco.')
      }
    })
    widget.init()
  } catch (err) {
    toast.error(toApiError(err).message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseButton :loading="loading" :disabled="disabled" data-testid="connect-bank" @click="connectBank">
    Conectar banco
  </BaseButton>
</template>
