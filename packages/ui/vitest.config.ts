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
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    server: {
      deps: {
        // Inline to fix ESM resolution issues in pnpm's virtual store:
        // jest-dom doesn't declare a peer on vitest, so pnpm may give it a
        // different `vitest` instance than the test runner — expect.extend()
        // then extends the wrong object and matchers like toBeInTheDocument
        // / toHaveAttribute appear missing (manifests on CI's clean install).
        inline: ['@testing-library/jest-dom'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/__tests__/**',
        'src/stories/**',
        'src/index.ts',
      ],
      thresholds: {
        lines: 70,
        branches: 65,
        functions: 70,
        statements: 70,
      },
    },
  },
});
