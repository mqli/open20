import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createAlias, createGithubPagesBase } from '@open20/config/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: createGithubPagesBase({ pagesBase: '/open20/spellbook/' }),
  resolve: {
    alias: createAlias(import.meta.url, './src'),
  },
});
