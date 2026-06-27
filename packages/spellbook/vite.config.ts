import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { createAlias, createGithubPagesBase } from '@open20/config/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'Open20 Spellbook',
        short_name: 'Spellbook',
        description: 'D&D 5e 2024 Spellbook — search, prepare, and manage your spells',
        theme_color: '#1A1A1E',
        background_color: '#1A1A1E',
        display: 'standalone',
        categories: ['games', 'reference'],
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
    }),
  ],
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
