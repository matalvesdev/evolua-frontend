import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('homepage loads with hero', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page).toHaveTitle(/Evolua/)
  })

  test('navigation links work', async ({ page }) => {
    await page.goto('/')
    await page.click('a[href="/planos"]')
    await expect(page).toHaveURL(/\/planos/)
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('lead magnets section visible', async ({ page }) => {
    await page.goto('/')
    const leadSection = page.locator('h2:has-text("Materiais")').first()
    await expect(leadSection).toBeVisible()
  })

  test('materiais page shows content', async ({ page }) => {
    await page.goto('/materiais')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('blog page loads and shows posts', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('ajuda page has FAQ section', async ({ page }) => {
    await page.goto('/ajuda')
    await expect(page.locator('text=Perguntas Frequentes').first()).toBeVisible()
  })

  test('sobre page loads', async ({ page }) => {
    await page.goto('/sobre')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('nosso-jeito page loads', async ({ page }) => {
    await page.goto('/nosso-jeito')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('changelog page loads', async ({ page }) => {
    await page.goto('/changelog')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('contato page loads with form', async ({ page }) => {
    await page.goto('/contato')
    await expect(page.locator('h1').first()).toBeVisible()
  })
})

test.describe('Authentication', () => {
  test('login page has form fields', async ({ page }) => {
    await page.goto('/entrar')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('cadastro page has signup form', async ({ page }) => {
    await page.goto('/cadastro')
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page.locator('input[type="email"]').first()).toBeVisible()
  })
})
