import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import { createVitestConfig } from '@open20/config/vitest';

const baseConfig = createVitestConfig({
  importMetaUrl: import.meta.url,
  aliasPath: './src',
});

const srcDir = resolve(dirname(fileURLToPath(import.meta.url)), 'src');

export default defineConfig({
  ...baseConfig,
  resolve: {
    ...baseConfig.resolve,
    alias: [
      // Resolve `@/sub/path` → `<src>/sub/path` (matches tsconfig paths).
      // The trailing-slash variant ensures we don't accidentally rewrite
      // `@` (bare specifier) — handled by the second entry.
      { find: /^@\/(.*)$/, replacement: `${srcDir}/$1` },
      { find: /^@$/, replacement: `${srcDir}/index.ts` },
      ...(Array.isArray(baseConfig.resolve?.alias)
        ? baseConfig.resolve.alias
        : Object.entries(baseConfig.resolve?.alias ?? {}).map(([find, replacement]) => ({
            find,
            replacement: replacement as string,
          }))),
    ],
  },
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
