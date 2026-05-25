// @ts-check
import baseConfig from '../../eslint.config.base.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['node:module'],
          message: 'Use ESM imports instead of createRequire for JSON imports in vitest.',
        }],
      }],
    },
  },
];
