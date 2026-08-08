import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import cloudflareTunnel from 'vite-plugin-cloudflare-tunnel';
import QRCode from 'qrcode';
import { createAlias, createGithubPagesBase, createTunnelPlugins } from '@open20/config/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false,
      },
      manifest: {
        name: 'Open20 Character Sheet',
        short_name: 'Character',
        description: 'D&D 5e 2024 Character Sheet — manage your characters',
        id: './',
        start_url: './',
        scope: './',
        theme_color: '#1A1A1E',
        background_color: '#1A1A1E',
        display: 'standalone',
        categories: ['games', 'reference'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
    ...createTunnelPlugins({ cloudflareTunnel, QRCode, port: 5173 }),
  ],
  base: createGithubPagesBase({ pagesBase: '/open20/character-sheet/' }),
  resolve: {
    alias: [
      ...Object.entries(createAlias(import.meta.url, './src')).map(([find, replacement]) => ({
        find,
        replacement: replacement as string,
      })),
    ],
  },
});
