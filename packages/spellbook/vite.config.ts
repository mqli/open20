import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createAlias, createGithubPagesBase } from '@open20/config/vite';

const here = dirname(fileURLToPath(import.meta.url));
const uiSrc = resolve(here, '../ui/src');

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: createGithubPagesBase({ pagesBase: '/open20/spellbook/' }),
  resolve: {
    alias: [
      // Resolve `@open20/ui/sub/path` and `@open20/ui` directly to source.
      // This lets Vite apply its own extension / index resolution, which the
      // `exports` field can't express for both files and directories.
      { find: /^@open20\/ui$/, replacement: `${uiSrc}/index.ts` },
      { find: /^@open20\/ui\/(.*)$/, replacement: `${uiSrc}/$1` },
      ...Object.entries(createAlias(import.meta.url, './src')).map(([find, replacement]) => ({
        find,
        replacement: replacement as string,
      })),
    ],
  },
});
