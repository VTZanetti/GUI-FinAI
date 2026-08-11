import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Mocka vue-router para a view usar o router fake
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRouter: () => fakeRouter,
    useRoute: () => fakeRoute
  }
})

vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: false }))
vi.mock('@/api/mocks/demoClient', async () => {
  const actual = await vi.importActual<typeof import('@/api/mocks/demoClient')>('@/api/mocks/demoClient')
  return actual
})

import LoginView from '@/views/auth/LoginView.vue'
import { authService } from '@/api/services/authService'

const fakeRouter = {
  push: vi.fn()
}

const fakeRoute = { query: {} }

function mountLogin(routeQuery: Record<string, string> = {}) {
  fakeRoute.query = routeQuery
  return {
    wrapper: mount(LoginView, {
      global: {
        plugins: [createPinia()],
        stubs: {
          RouterLink: { template: '<a><slot /></a>' }
        }
      }
    }),
    router: fakeRouter
  }
}

function getInput(wrapper: ReturnType<typeof mountLogin>['wrapper'], testid: string) {
  return wrapper.find(`[data-testid="${testid}"] input`)
}

function fillField(wrapper: ReturnType<typeof mountLogin>['wrapper'], testid: string, value: string) {
  return getInput(wrapper, testid).setValue(value)
}

describe('LoginView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    fakeRouter.push.mockClear()
  })

  it('renderiza campos de email e senha', () => {
    const { wrapper } = mountLogin()
    expect(wrapper.find('[data-testid="email-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="password-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="login-submit"]').exists()).toBe(true)
  })

  it('mostra erro de validação ao enviar vazio', async () => {
    const { wrapper } = mountLogin()
    const form = wrapper.find('form')
    await form.trigger('submit')
    await flushPromises()
    await new Promise((r) => setTimeout(r, 20))
    expect(wrapper.text()).toContain('Informe seu e-mail.')
    expect(wrapper.text()).toContain('Informe sua senha.')
  })

  it('login com sucesso navega para /dashboard', async () => {
    vi.spyOn(authService, 'login').mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      accessToken: 'tok',
      expiresIn: 900,
      refreshToken: 'r'
    })
    const { wrapper } = mountLogin()
    await fillField(wrapper, 'email-input', 'a@b.com')
    await fillField(wrapper, 'password-input', 'Senha@123')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await new Promise((r) => setTimeout(r, 50))
    expect(fakeRouter.push).toHaveBeenCalledWith('/dashboard')
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(true)
  })

  it('exibe erro amigável em falha 401', async () => {
    vi.spyOn(authService, 'login').mockRejectedValue({
      response: { status: 401, data: { title: 'Unauthorized', status: 401 } }
    })
    const { wrapper } = mountLogin()
    await fillField(wrapper, 'email-input', 'a@b.com')
    await fillField(wrapper, 'password-input', 'Senha@123')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await new Promise((r) => setTimeout(r, 50))
    expect(wrapper.find('[data-testid="login-error"]').text()).toContain('Sessão expirada')
  })
})
