import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { createAlias } from '@open20/config/vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: createAlias(import.meta.url, './src'),
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
    css: true,
  },
});
