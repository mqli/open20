import { defineConfig, devices } from '@playwright/test';
import { createPlaywrightConfig } from '@open20/config/playwright';

const isCI = process.env.CI === 'true';

const baseConfig = createPlaywrightConfig({
  baseURL: 'http://localhost:4173',
  testDir: './e2e',
  webServerCommand: isCI
    ? 'pnpm run build && pnpm run preview -- --port 4173'
    : 'pnpm run preview -- --port 4173',
  webServerPort: 4173,
  webServerTimeout: 120000,
  headless: isCI,
  browsers: ['chromium'],
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  timeout: 5000,
  retries: isCI ? 2 : 0,
});

/**
 * Spellbook E2E config with desktop + mobile projects
 */
export default defineConfig({
  ...baseConfig,
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
