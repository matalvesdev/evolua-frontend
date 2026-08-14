import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL;

if (!baseURL) {
  throw new Error('BASE_URL is required for authenticated staging E2E tests');
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [['line'], ['html', { outputFolder: 'playwright-report-auth', open: 'never' }]]
    : 'line',
  timeout: 60_000,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'dashboard-authenticated',
      testMatch: /dashboard-all-modules-auth\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
    },
  ],
});
