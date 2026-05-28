import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createAlias, createGithubPagesBase } from '@open20/config/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: createGithubPagesBase({ pagesBase: '/open20/spellbook/' }),
  resolve: {
    alias: [
      ...Object.entries(createAlias(import.meta.url, './src')).map(([find, replacement]) => ({
        find,
        replacement: replacement as string,
      })),
    ],
  },
});
