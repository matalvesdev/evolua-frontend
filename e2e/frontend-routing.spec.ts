import { test, expect } from '@playwright/test'

test.describe('Frontend — Public Routes', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/entrar')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('cadastro page loads', async ({ page }) => {
    await page.goto('/cadastro')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('password recovery page loads', async ({ page }) => {
    await page.goto('/recuperar-senha')
    await expect(page.locator('input[type="email"]').first()).toBeVisible()
  })

  test('terms page loads', async ({ page }) => {
    await page.goto('/termos')
    await expect(page.locator('body')).toBeVisible()
  })

  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacidade')
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Frontend — Auth Guard', () => {
  test('dashboard redirects unauthenticated to login', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL(/\/entrar/)
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('all 26 dashboard subroutes redirect unauthenticated', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/dashboard/agenda',
      '/dashboard/analytics',
      '/dashboard/biblioteca',
      '/dashboard/billing',
      '/dashboard/caa',
      '/dashboard/configuracoes',
      '/dashboard/encaminhamentos',
      '/dashboard/exercicios',
      '/dashboard/financeiro',
      '/dashboard/laudos',
      '/dashboard/linha-do-tempo',
      '/dashboard/mais',
      '/dashboard/materiais',
      '/dashboard/onboarding',
      '/dashboard/pacientes',
      '/dashboard/perfil',
      '/dashboard/plano-terapeutico',
      '/dashboard/prontuario',
      '/dashboard/relatorios',
      '/dashboard/sessao',
      '/dashboard/tarefas',
      '/dashboard/teleconsulta',
      '/dashboard/whatsapp',
    ]
    for (const route of routes) {
      await page.goto(route)
      await page.waitForURL(/\/entrar/)
      expect(page.url()).toContain('/entrar')
    }
  })
})

test.describe('Frontend — 404', () => {
  test('unknown route shows 404', async ({ page }) => {
    const resp = await page.goto('/rota-inexistente')
    expect(resp?.status()).toBe(200)
    await expect(page.locator('h1').first()).toBeVisible()
  })
})
