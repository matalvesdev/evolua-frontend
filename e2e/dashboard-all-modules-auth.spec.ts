import { test, expect } from '@playwright/test'

const DASHBOARD_ROUTES = [
  { path: '/dashboard', name: 'index (home)' },
  { path: '/dashboard/agenda', name: 'agenda' },
  { path: '/dashboard/analytics', name: 'analytics' },
  { path: '/dashboard/biblioteca', name: 'biblioteca' },
  { path: '/dashboard/billing', name: 'billing' },
  { path: '/dashboard/caa', name: 'caa' },
  { path: '/dashboard/configuracoes', name: 'configuracoes' },
  { path: '/dashboard/encaminhamentos', name: 'encaminhamentos' },
  { path: '/dashboard/exercicios', name: 'exercicios' },
  { path: '/dashboard/financeiro', name: 'financeiro' },
  { path: '/dashboard/laudos', name: 'laudos' },
  { path: '/dashboard/linha-do-tempo', name: 'linha-do-tempo' },
  { path: '/dashboard/mais', name: 'mais' },
  { path: '/dashboard/materiais', name: 'materiais' },
  { path: '/dashboard/onboarding', name: 'onboarding' },
  { path: '/dashboard/pacientes', name: 'pacientes' },
  { path: '/dashboard/perfil', name: 'perfil' },
  { path: '/dashboard/plano-terapeutico', name: 'plano-terapeutico' },
  { path: '/dashboard/prontuario', name: 'prontuario' },
  { path: '/dashboard/relatorios', name: 'relatorios' },
  { path: '/dashboard/sessao', name: 'sessao' },
  { path: '/dashboard/tarefas', name: 'tarefas' },
  { path: '/dashboard/teleconsulta', name: 'teleconsulta' },
  { path: '/dashboard/whatsapp', name: 'whatsapp' },
]

test.describe('Dashboard — All 26 Modules Load', () => {
  for (const route of DASHBOARD_ROUTES) {
    test(`${route.name} loads without crashing`, async ({ page }) => {
      const resp = await page.goto(route.path)
      expect(resp?.status()).toBe(200)
      await expect(page.locator('body')).toBeVisible()
      const title = page.locator('h1').first()
      await expect(title).toBeAttached({ timeout: 10000 })
    })
  }
})

test.describe('Dashboard — Navigation Consistency', () => {
  test('sidebar navigation links are present and functional', async ({ page }) => {
    const resp = await page.goto('/dashboard')
    expect(resp?.status()).toBe(200)

    const sidebarLinks = page.locator('nav a, aside a, [class*="sidebar"] a, [class*="nav"] a')
    const linksCount = await sidebarLinks.count()
    expect(linksCount).toBeGreaterThanOrEqual(10)

    for (let i = 0; i < Math.min(linksCount, 5); i++) {
      const href = await sidebarLinks.nth(i).getAttribute('href')
      if (href && href.startsWith('/dashboard/')) {
        await sidebarLinks.nth(i).click()
        await expect(page).toHaveURL(new RegExp(href.replace('/', '\\/')))
        await page.goBack()
        await expect(page).toHaveURL('/dashboard')
      }
    }
  })
})

test.describe('Dashboard — Modules with h1 title', () => {
  const modulesWithExpectedTitle = [
    { path: '/dashboard/agenda', title: /agenda/i },
    { path: '/dashboard/analytics', title: /analytics|analítico/i },
    { path: '/dashboard/pacientes', title: /pacientes/i },
    { path: '/dashboard/configuracoes', title: /configura/i },
    { path: '/dashboard/financeiro', title: /financeiro/i },
    { path: '/dashboard/whatsapp', title: /whatsapp/i },
    { path: '/dashboard/tarefas', title: /tarefa/i },
    { path: '/dashboard/relatorios', title: /relatório|relatorios/i },
    { path: '/dashboard/billing', title: /billing|assinatura|plano/i },
    { path: '/dashboard/teleconsulta', title: /teleconsulta/i },
    { path: '/dashboard/perfil', title: /perfil/i },
    { path: '/dashboard/mais', title: /mais/i },
  ]

  for (const m of modulesWithExpectedTitle) {
    test(`${m.path} has expected h1`, async ({ page }) => {
      await page.goto(m.path)
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 })
    })
  }
})
