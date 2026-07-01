import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  timeout: 30000,

  use: {
    baseURL: 'http://127.0.0.1:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true,
  },

  projects: [
    {
      name: 'iPhone 14',
      use: {
        ...devices['iPhone 14'],
        hasTouch: true,
      },
    },
    {
      name: 'Pixel 7',
      use: {
        ...devices['Pixel 7'],
        hasTouch: true,
      },
    },
  ],
})
