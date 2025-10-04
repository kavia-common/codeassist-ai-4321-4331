import { defineConfig, devices } from '@playwright/test';

// Base URL resolution:
// - Default to http://localhost:3000 (CRA dev server).
// - Allow override via E2E_BASE_URL environment variable (useful in CI or previews).
const baseURL = process.env.E2E_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:3000';

// Retry strategy:
// - In CI: retry failing tests to improve flake resilience.
// - Locally: no retries by default.
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: isCI ? 2 : 0,
  fullyParallel: true,
  reporter: [['list'], ...(isCI ? [['html', { open: 'never' }]] : [])],
  use: {
    baseURL,
    // Collect helpful artifacts on failures
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  // Projects for common browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to include more browsers if desired
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  // Opt-in webServer is intentionally omitted as we assume services are already running (per requirements).
});
