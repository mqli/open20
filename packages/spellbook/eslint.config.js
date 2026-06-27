import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { baseConfig, browserConfig } from '@open20/config/eslint';

export default [
  ...baseConfig,
  browserConfig,
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['e2e/**'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
];
