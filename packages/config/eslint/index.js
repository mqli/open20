import js from '@eslint/js';
import globals from 'globals';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

export const baseConfig = tseslint.config(
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'unused-imports/no-unused-imports': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-undef': 'off',
    },
  },
  // Apply no-restricted-imports only to packages/ui/**
  {
    files: ['packages/ui/src/**/*.{ts,tsx}'],
    rules: { - only for UI package
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message:
                'Use absolute imports or workspace aliases (e.g. @open20/ui) instead of relative imports.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '.turbo/**', 'storybook-static/**'],
  },
);

export const browserConfig = {
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    globals: globals.browser,
  },
};
