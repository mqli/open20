import { defineConfig } from 'vitest/config';
import { createVitestConfig } from '@open20/config/vitest';

const baseConfig = createVitestConfig({
  importMetaUrl: import.meta.url,
});

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    exclude: ['**/node_modules/**', '**/dist/**'],
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
