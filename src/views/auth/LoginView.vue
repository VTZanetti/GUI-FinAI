<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Form, Field } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import { LogIn } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { loginSchema } from '@/utils/validation'
import { useToast } from '@/composables/useToast'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const submitting = ref(false)
const apiError = ref('')

// Toast de sessão expirada (redirecionado pelo interceptor)
if (route.query.expired === '1') {
  toast.error('Sessão expirada. Entre novamente.')
}

async function onSubmit(formValues: Record<string, unknown>) {
  submitting.value = true
  apiError.value = ''
  try {
    await auth.login({
      email: String(formValues.email ?? ''),
      password: String(formValues.password ?? '')
    })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    router.push(redirect)
  } catch (error) {
    const err = error as { message?: string }
    apiError.value = err.message ?? 'Não foi possível entrar.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background p-4">
    <div class="w-full max-w-sm">
      <div class="mb-6 text-center">
        <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded bg-primary text-xl font-bold text-white">
          F
        </div>
        <h1 class="text-xl font-semibold text-content">Entrar no FinAI</h1>
        <p class="mt-1 text-sm text-content-muted">Acesse seu painel financeiro</p>
      </div>

      <Form
        :validation-schema="toTypedSchema(loginSchema)"
        class="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-sm"
        @submit="onSubmit"
      >
        <Field v-slot="{ field, errorMessage }" name="email">
          <BaseInput
            :model-value="field.value"
            label="E-mail"
            type="email"
            placeholder="voce@exemplo.com"
            autocomplete="email"
            data-testid="email-input"
            :error="errorMessage"
            @input="field.onInput"
          />
        </Field>
        <Field v-slot="{ field, errorMessage }" name="password">
          <BaseInput
            :model-value="field.value"
            label="Senha"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            data-testid="password-input"
            :error="errorMessage"
            @input="field.onInput"
          />
        </Field>

        <div
          v-if="apiError"
          class="rounded border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
          data-testid="login-error"
        >
          {{ apiError }}
        </div>

        <BaseButton type="submit" :loading="submitting" data-testid="login-submit">
          <LogIn class="h-4 w-4" />
          Entrar
        </BaseButton>
      </Form>

      <p class="mt-4 text-center text-sm text-content-muted">
        Ainda não tem conta?
        <RouterLink class="font-medium text-primary hover:underline" :to="{ name: 'register' }">
          Criar conta
        </RouterLink>
      </p>
    </div>
  </div>
</template>
