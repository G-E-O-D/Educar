import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  outputDir: 'test-results',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 60_000,
    actionTimeout: 20_000,
  },
  expect: {
    timeout: 15_000,
  },
  projects: [
    {
      name: 'Desktop Chrome 1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'Tablet 768',
      use: { ...devices['iPad Mini'], browserName: 'chromium', viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'Mobile 390',
      use: { ...devices['iPhone 12'], browserName: 'chromium', viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env['CI'],
    timeout: 60_000,
  },
});
