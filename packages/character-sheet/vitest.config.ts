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
    exclude: ['**/node_modules/**', '**/dist/**'],
    // happy-dom provides document + localStorage for component and store tests.
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    server: {
      deps: {
        // Inline open20-core to work around missing .js extensions in emitted imports.
        inline: ['open20-core'],
      },
    },
  },
});
