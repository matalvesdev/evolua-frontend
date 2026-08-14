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
    await page.setExtraHTTPHeaders({
      'x-vercel-protection-bypass': vercelBypassSecret,
      'x-vercel-set-bypass-cookie': 'true',
    });
    await page.goto('/entrar', { waitUntil: 'domcontentloaded' });
    await page.setExtraHTTPHeaders({});
  } else {
    await page.goto('/entrar');
  }

  if (new URL(page.url()).hostname.endsWith('vercel.com')) {
    throw new Error('Vercel automation bypass failed: preview redirected to the Vercel login page');
  }

  await page.getByLabel(/e-?mail/i).fill(email);
  await page.locator('#senha').fill(password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard(?:\/|$)/, { timeout: 30_000 });
  await page.context().storageState({ path: authFile });
});
