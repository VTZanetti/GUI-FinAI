<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Form, Field } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import { UserPlus } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { registerSchema } from '@/utils/validation'
import { useToast } from '@/composables/useToast'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()
const submitting = ref(false)
const apiError = ref('')

async function onSubmit(formValues: Record<string, unknown>) {
  submitting.value = true
  apiError.value = ''
  try {
    await auth.register({
      email: String(formValues.email ?? ''),
      password: String(formValues.password ?? ''),
      firstName: String(formValues.firstName ?? ''),
      lastName: String(formValues.lastName ?? '')
    })
    toast.success('Conta criada com sucesso!')
    router.push({ name: 'dashboard' })
  } catch (error) {
    const err = error as { message?: string }
    apiError.value = err.message ?? 'Não foi possível criar a conta.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background p-4">
    <div class="w-full max-w-md">
      <div class="mb-6 text-center">
        <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded bg-primary text-xl font-bold text-white">
          F
        </div>
        <h1 class="text-xl font-semibold text-content">Criar sua conta</h1>
        <p class="mt-1 text-sm text-content-muted">Comece a organizar suas finanças</p>
      </div>

      <Form
        :validation-schema="toTypedSchema(registerSchema)"
        class="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-sm"
        @submit="onSubmit"
      >
        <div class="grid grid-cols-2 gap-3">
          <Field v-slot="{ field, errorMessage }" name="firstName">
            <BaseInput
              :model-value="field.value"
              label="Nome"
              placeholder="Ana"
              data-testid="firstName-input"
              :error="errorMessage"
              @input="field.onInput"
            />
          </Field>
          <Field v-slot="{ field, errorMessage }" name="lastName">
            <BaseInput
              :model-value="field.value"
              label="Sobrenome"
              placeholder="Silva"
              data-testid="lastName-input"
              :error="errorMessage"
              @input="field.onInput"
            />
          </Field>
        </div>
        <Field v-slot="{ field, errorMessage }" name="email">
          <BaseInput
            :model-value="field.value"
            label="E-mail"
            type="email"
            placeholder="voce@exemplo.com"
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
            placeholder="Mín. 8, maiúscula, minúscula, dígito e especial"
            data-testid="password-input"
            :error="errorMessage"
            @input="field.onInput"
          />
        </Field>
        <Field v-slot="{ field, errorMessage }" name="confirmPassword">
          <BaseInput
            :model-value="field.value"
            label="Confirmar senha"
            type="password"
            placeholder="Repita a senha"
            data-testid="confirmPassword-input"
            :error="errorMessage"
            @input="field.onInput"
          />
        </Field>

        <div
          v-if="apiError"
          class="rounded border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
          data-testid="register-error"
        >
          {{ apiError }}
        </div>

        <BaseButton type="submit" :loading="submitting" data-testid="register-submit">
          <UserPlus class="h-4 w-4" />
          Criar conta
        </BaseButton>
      </Form>

      <p class="mt-4 text-center text-sm text-content-muted">
        Já tem conta?
        <RouterLink class="font-medium text-primary hover:underline" :to="{ name: 'login' }">
          Entrar
        </RouterLink>
      </p>
    </div>
  </div>
</template>
