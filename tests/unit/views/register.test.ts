import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRouter: () => fakeRouter,
    useRoute: () => ({ query: {} })
  }
})

vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: false }))
vi.mock('@/api/mocks/demoClient', async () => {
  const actual = await vi.importActual<typeof import('@/api/mocks/demoClient')>('@/api/mocks/demoClient')
  return actual
})

import RegisterView from '@/views/auth/RegisterView.vue'
import { authService } from '@/api/services/authService'

const fakeRouter = {
  push: vi.fn()
}

function mountRegister() {
  return mount(RegisterView, {
    global: {
      plugins: [createPinia()],
      stubs: {
        RouterLink: { template: '<a><slot /></a>' }
      }
    }
  })
}

function getInput(wrapper: ReturnType<typeof mountRegister>, testid: string) {
  return wrapper.find(`[data-testid="${testid}"] input`)
}

describe('RegisterView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    fakeRouter.push.mockClear()
  })

  it('renderiza todos os campos', () => {
    const wrapper = mountRegister()
    expect(wrapper.find('[data-testid="firstName-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="lastName-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="email-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="password-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="confirmPassword-input"]').exists()).toBe(true)
  })

  it('valida senha forte no envio', async () => {
    const wrapper = mountRegister()
    await getInput(wrapper, 'firstName-input').setValue('Ana')
    await getInput(wrapper, 'lastName-input').setValue('Silva')
    await getInput(wrapper, 'email-input').setValue('a@b.com')
    await getInput(wrapper, 'password-input').setValue('fraca')
    await getInput(wrapper, 'confirmPassword-input').setValue('fraca')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await new Promise((r) => setTimeout(r, 30))
    expect(wrapper.text()).toContain('8 caracteres')
  })

  it('registro com sucesso navega para /dashboard', async () => {
    vi.spyOn(authService, 'register').mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      accessToken: 'tok',
      expiresIn: 900,
      refreshToken: 'r'
    })
    const wrapper = mountRegister()
    await getInput(wrapper, 'firstName-input').setValue('Ana')
    await getInput(wrapper, 'lastName-input').setValue('Silva')
    await getInput(wrapper, 'email-input').setValue('a@b.com')
    await getInput(wrapper, 'password-input').setValue('Senha@123')
    await getInput(wrapper, 'confirmPassword-input').setValue('Senha@123')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await new Promise((r) => setTimeout(r, 50))
    expect(fakeRouter.push).toHaveBeenCalledWith({ name: 'dashboard' })
  })

  it('exibe erro de conflito (409) amigável', async () => {
    vi.spyOn(authService, 'register').mockRejectedValue({
      response: { status: 409, data: { title: 'Conflict', detail: 'Email já cadastrado', status: 409 } }
    })
    const wrapper = mountRegister()
    await getInput(wrapper, 'firstName-input').setValue('Ana')
    await getInput(wrapper, 'lastName-input').setValue('Silva')
    await getInput(wrapper, 'email-input').setValue('a@b.com')
    await getInput(wrapper, 'password-input').setValue('Senha@123')
    await getInput(wrapper, 'confirmPassword-input').setValue('Senha@123')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await new Promise((r) => setTimeout(r, 50))
    expect(wrapper.find('[data-testid="register-error"]').text()).toContain('Email já cadastrado')
  })
})
