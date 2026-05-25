import { defineConfig } from 'vitest/config';
import { createVitestConfig } from '@open20/config/vitest';

const baseConfig = createVitestConfig({
  importMetaUrl: import.meta.url,
  aliasPath: './src',
});

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/index.ts'],
    },
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'tests/artifact', 'tests/browser-artifact'],
  },
});
