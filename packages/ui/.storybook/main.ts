import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';
import { createStorybookMainConfig } from '@open20/config/storybook';

const here = dirname(fileURLToPath(import.meta.url));
const uiSrc = resolve(here, '../src');

const config: StorybookConfig = {
  ...createStorybookMainConfig(),
  // Storybook bundles via Vite. The `@open20/ui` package's `exports` field
  // can't express directory/index resolution for paths like
  // `@open20/ui/components/Button`, so we redirect those imports to the
  // source directly and let Vite apply its own extension lookup.
  viteFinal: async (cfg) => {
    cfg.resolve ??= {};
    const existing = cfg.resolve.alias;
    const extras = [
      { find: /^@open20\/ui$/, replacement: `${uiSrc}/index.ts` },
      { find: /^@open20\/ui\/(.*)$/, replacement: `${uiSrc}/$1` },
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
