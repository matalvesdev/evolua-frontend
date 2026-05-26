import { test as setup } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  await page.goto('/entrar')
  await page.fill('[name="email"]', process.env.TEST_EMAIL || 'teste@evolua.com.br')
  await page.fill('[name="password"]', process.env.TEST_PASSWORD || 'teste123')
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')
  await page.context().storageState({ path: authFile })
})
