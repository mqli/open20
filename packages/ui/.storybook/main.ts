import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';
import { createStorybookMainConfig } from '@open20/config/storybook';

const here = dirname(fileURLToPath(import.meta.url));
const uiSrc = resolve(here, '../src');

const config: StorybookConfig = {
  ...createStorybookMainConfig(),
  // Storybook bundles via Vite. Resolve package-local `@` imports
  // directly to source and let Vite apply extension lookup.
  viteFinal: async (cfg) => {
    cfg.resolve ??= {};
    const existing = cfg.resolve.alias;
    const extras = [
      { find: /^@$/, replacement: `${uiSrc}/index.ts` },
      { find: /^@\/(.*)$/, replacement: `${uiSrc}/$1` },
    ];
    cfg.resolve.alias = Array.isArray(existing)
      ? [...extras, ...existing]
      : [
          ...extras,
          ...Object.entries(existing ?? {}).map(([find, replacement]) => ({
            find,
            replacement: replacement as string,
          })),
        ];
    return cfg;
  },
};

export default config;
