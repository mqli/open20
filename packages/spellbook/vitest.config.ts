import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    // Use node environment by default
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    // Use happy-dom for component tests (avoids jsdom's ESM compatibility issues
    // with cssstyle → @asamuzakjp/css-color → @csstools/css-calc)
    environmentMatchGlobs: [
      ['src/components/**', 'happy-dom'],
      ['src/components/**/__tests__/**', 'happy-dom'],
    ],
    server: {
      deps: {
        // Inline to fix ESM resolution issues in pnpm's virtual store:
        // open20-core: missing .js extensions; jest-dom: vitest peer not wired by pnpm
        inline: ['open20-core', '@testing-library/jest-dom'],
      },
    },
  },
});
