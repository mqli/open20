import { defineConfig } from 'vitest/config';
import { createVitestConfig } from '@open20/config/vitest';

const baseConfig = createVitestConfig({
  importMetaUrl: import.meta.url,
  aliasPath: './dist',
  resolve: {
    conditions: ['node', 'import', 'default'],
  },
});

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ['tests/artifact/**/*.test.ts'],
    exclude: ['node_modules', 'src'],
    environment: 'node',
    name: 'artifact-node',
  },
});
