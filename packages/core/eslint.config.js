// @ts-check
import { baseConfig } from '@open20/config/eslint';

export default [
  ...baseConfig,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['node:module'],
              message: 'Use ESM imports instead of createRequire for JSON imports in vitest.',
            },
          ],
        },
      ],
    },
  },
];
