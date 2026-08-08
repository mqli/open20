import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import cloudflareTunnel from 'vite-plugin-cloudflare-tunnel';
import QRCode from 'qrcode';
import { createAlias, createGithubPagesBase } from '@open20/config/vite';
import { tunnelQrcodePlugin } from '@open20/config/vite/plugin-tunnel-qrcode';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    // Cloudflare tunnel for mobile testing — opt-in via TUNNEL=true
    ...(process.env.TUNNEL === 'true'
      ? [cloudflareTunnel({ port: 5173 }), tunnelQrcodePlugin(QRCode)]
      : []),
  ],
  base: createGithubPagesBase({ pagesBase: '/open20/battlemap-splitter/' }),
  resolve: {
    alias: [
      ...Object.entries(createAlias(import.meta.url, './src')).map(([find, replacement]) => ({
        find,
        replacement: replacement as string,
      })),
    ],
  },
  build: {
    // Target modern browsers to reduce transpilation/polyfill overhead
    target: 'es2020',
    // Ensure CSS is minified (default is true, explicit for clarity)
    cssMinify: true,
    // Skip modulepreload polyfill — all modern browsers support it natively
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      output: {
        // Split vendor chunks for better long-term caching
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
        },
      },
    },
  },
});
