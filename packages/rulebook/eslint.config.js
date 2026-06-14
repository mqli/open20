import { baseConfig } from '@open20/config/eslint';

export default [
  ...baseConfig,
  {
    ignores: ['dist/'],
  },
];
