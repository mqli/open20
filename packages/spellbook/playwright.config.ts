import { defineConfig } from '@playwright/test';
import { createPlaywrightConfig } from '@open20/config/playwright';

const isCI = process.env.CI === 'true';

/**
 * Playwright configuration for spellbook E2E tests
 * Runs against the build artifact served by `vite preview`
 */
export default defineConfig(
  createPlaywrightConfig({
    // Base URL for the running server
    baseURL: 'http://localhost:4173',

    // Directory containing E2E tests
    testDir: './e2e',

    // Command to start the web server (serves dist/)
    // Note: -- is required to pass args to the underlying script (vite preview)
    webServerCommand: 'pnpm run preview -- --port 4173',
    webServerPort: 4173,
    webServerTimeout: 120000,

    // Browser configuration
    headless: isCI,
    browsers: ['chromium'], // Add 'firefox', 'webkit' as needed

    // Default test behavior
    use: {
      // Take screenshot on failure
      screenshot: 'only-on-failure',
      // Record video on failure
      video: 'retain-on-failure',
      // Trace on first retry
      trace: 'on-first-retry',
    },

    // Test timeout (5 seconds)
    timeout: 5000,

    // Retries (2 in CI, 0 locally)
    retries: isCI ? 2 : 0,
  }),
);
