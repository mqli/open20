import { defineConfig } from 'vitest/config';
import { createVitestConfig } from '@open20/config/vitest';

const baseConfig = createVitestConfig({
  importMetaUrl: import.meta.url,
  aliasPath: './dist',
});

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ['tests/browser-artifact/**/*.test.ts'],
    exclude: ['node_modules', 'src'],
    environment: 'jsdom',
    name: 'artifact-browser',
    setupFiles: ['./tests/browser-artifact/setup.ts'],
  },
});
