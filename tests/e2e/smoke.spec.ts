import { test, expect } from '@playwright/test'

/**
 * Smoke E2E — fluxo principal (g0.8).
 * Requer o backend rodando em http://localhost:8080 (docker compose) e o
 * dev server em http://localhost:5173 (VITE_DEMO_MODE=false).
 *
 * Para rodar: npm run dev (terminal 1) + npx playwright test (terminal 2).
 */

test.describe('Smoke E2E — fluxo principal', () => {
  test('registrar → conta → transação → dashboard → chat', async ({ page }) => {
    const email = `e2e-${Date.now()}@test.com`

    // 1. Registrar
    await page.goto('/register')
    await page.getByTestId('firstName-input').locator('input').fill('E2E')
    await page.getByTestId('lastName-input').locator('input').fill('Teste')
    await page.getByTestId('email-input').locator('input').fill(email)
    await page.getByTestId('password-input').locator('input').fill('Senha@123')
    await page.getByTestId('confirmPassword-input').locator('input').fill('Senha@123')
    await page.getByTestId('register-submit').click()
    await page.waitForURL('**/dashboard', { timeout: 15_000 })
    await expect(page.getByText('Dashboard')).toBeVisible()

    // 2. Criar conta
    await page.goto('/accounts')
    await page.getByRole('button', { name: 'Nova conta' }).click()
    await page.getByTestId('account-name').locator('input').fill('E2E Nubank')
    await page.getByTestId('account-balance').locator('input').fill('1000')
    await page.getByRole('button', { name: 'Criar' }).click()
    await expect(page.getByText('E2E Nubank')).toBeVisible({ timeout: 10_000 })

    // 3. Criar transação
    await page.goto('/transactions')
    await page.getByRole('button', { name: 'Nova transação' }).click()
    await page.getByTestId('tx-description').locator('input').fill('UBER *TRIP')
    await page.getByTestId('tx-amount').locator('input').fill('-27.9')
    await page.getByRole('button', { name: 'Criar' }).click()
    await expect(page.getByText('UBER *TRIP')).toBeVisible({ timeout: 10_000 })

    // 4. Dashboard
    await page.goto('/dashboard')
    await expect(page.getByText('Balanço')).toBeVisible({ timeout: 10_000 })

    // 5. Chat
    await page.goto('/chat')
    await page.getByTestId('chat-input').fill('Quanto gastei este mês?')
    await page.getByTestId('chat-send').click()
    // O advisor pode demorar (Ollama) — espera generosa
    await expect(page.getByTestId('chat-assistant').last()).toBeVisible({ timeout: 120_000 })
  })
})
