import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { createVitestConfig } from '@open20/config/vitest';

const baseConfig = createVitestConfig({
  importMetaUrl: import.meta.url,
});

export default defineConfig({
  ...baseConfig,
  plugins: [react()],
  test: {
    ...baseConfig.test,
    // Exclude e2e tests from vitest (they're run by Playwright)
    exclude: ['e2e/**', '**/node_modules/**', '**/dist/**'],
    // Use node environment by default
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    // Use happy-dom for component tests (avoids jsdom's ESM compatibility issues
    // with cssstyle → @asamuzakjp/css-color → @csstools/css-calc)
    environmentMatchGlobs: [
      ['src/components/**', 'happy-dom'],
      ['src/components/**/__tests__/**', 'happy-dom'],
      ['src/core/__tests__/**', 'happy-dom'],
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/__tests__/**', 'src/test/**'],
      thresholds: {
        lines: 75,
        branches: 70,
        functions: 75,
        statements: 75,
      },
    },
    server: {
      deps: {
        // Inline open20-core to work around missing .js extensions in emitted imports.
        inline: ['open20-core'],
      },
    },
  },
});
