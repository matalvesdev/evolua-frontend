import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;

  if (!email || !password) {
    throw new Error('TEST_EMAIL and TEST_PASSWORD are required for authenticated E2E tests');
  }

  const vercelBypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (vercelBypassSecret) {
    const response = await page.request.get('/', {
      headers: {
        'x-vercel-protection-bypass': vercelBypassSecret,
        'x-vercel-set-bypass-cookie': 'true',
      },
    });
    if (!response.ok()) {
      throw new Error(`Vercel automation bypass failed with HTTP ${response.status()}`);
    }
  }

  await page.goto('/entrar');
  await page.getByLabel(/e-?mail/i).fill(email);
  await page.locator('#senha').fill(password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard(?:\/|$)/, { timeout: 30_000 });
  await page.context().storageState({ path: authFile });
});
