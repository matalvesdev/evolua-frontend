import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testIgnore: ['**/auth.setup.ts', '**/dashboard-all-modules-auth.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'frontend-public',
      testMatch: /frontend-routing\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:5173',
      },
    },
    {
      name: 'landing-public',
      testMatch: /(landing|landing-comprehensive|seo)\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:5183',
      },
    },
  ],
  webServer: [
    {
      command: 'node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env.CI,
      cwd: 'frontend-core',
    },
    {
      command: 'node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5183',
      url: 'http://127.0.0.1:5183',
      reuseExistingServer: !process.env.CI,
      cwd: 'landing-core',
    },
  ],
});
