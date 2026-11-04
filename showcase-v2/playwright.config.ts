import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.E2E_PORT ?? 3210)
const baseURL = `http://localhost:${port}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Production build so tests exercise the same CSS output that ships.
    command: `pnpm run build && pnpm exec next start -p ${port}`,
    url: baseURL,
    // Opt-in only: silently reusing whatever owns the port can test another app.
    reuseExistingServer: process.env.E2E_REUSE_SERVER === '1',
    timeout: 10 * 60 * 1000,
  },
})
