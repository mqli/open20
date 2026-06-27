import { defineConfig, devices } from '@playwright/test';
import { createPlaywrightConfig } from '@open20/config/playwright';

const isCI = process.env.CI === 'true';

const baseConfig = createPlaywrightConfig({
  baseURL: 'http://localhost:4173',
  testDir: './e2e',
  // In CI, turbo manages build (dependsOn: ["build"]), so webServerCommand only needs preview.
  // Locally, run preview directly — ensure you've built first or use `pnpm run test:e2e` via turbo.
  webServerCommand: 'pnpm run preview -- --port 4173',
  webServerPort: 4173,
  webServerTimeout: 120000,
  headless: isCI,
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  timeout: 30000,
  retries: isCI ? 2 : 0,
});

/**
 * Spellbook E2E config with desktop + mobile projects.
 * Both use chromium — mobile tests validate responsive layout (viewport), not cross-engine.
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
      use: { ...devices['iPhone 13'], browserName: 'chromium' },
    },
  ],
});
