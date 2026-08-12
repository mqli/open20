import { defineConfig } from '@playwright/test';

const isCI = process.env.CI === 'true';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: isCI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm run preview --port 4173',
    port: 4173,
    timeout: 120000,
    reuseExistingServer: !isCI,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
