import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import cloudflareTunnel from 'vite-plugin-cloudflare-tunnel';
import QRCode from 'qrcode';
import { createAlias, createGithubPagesBase, createTunnelPlugins } from '@open20/config/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    ...createTunnelPlugins({ cloudflareTunnel, QRCode, port: 5173 }),
  ],
  base: createGithubPagesBase({ pagesBase: '/open20/rulebook/' }),
  resolve: {
    alias: [
      ...Object.entries(createAlias(import.meta.url, './src')).map(([find, replacement]) => ({
        find,
        replacement: replacement as string,
      })),
    ],
  },
});
