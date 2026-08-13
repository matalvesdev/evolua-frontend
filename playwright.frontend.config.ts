import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  reporter: 'line',
  timeout: 120_000,
  use: {
    baseURL: 'http://127.0.0.1:5174',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node .\\node_modules\\vite\\bin\\vite.js --host 127.0.0.1 --port 5174',
    url: 'http://127.0.0.1:5174/entrar',
    reuseExistingServer: false,
    timeout: 120_000,
    cwd: 'frontend-core',
  },
});
