import { createAlias } from '../vite/index.js';

/**
 * @typedef {object} VitestConfigOptions
 * @property {string} importMetaUrl
 * @property {string} [aliasPath]
 * @property {Record<string, unknown>} [test]
 * @property {Record<string, unknown>} [resolve]
 */

/**
 * @param {VitestConfigOptions} options
 */
export function createVitestConfig({
  importMetaUrl,
  aliasPath = './src',
  test = {},
  resolve = {},
}) {
  return {
    test: {
      globals: true,
      ...test,
    },
    resolve: {
      alias: createAlias(importMetaUrl, aliasPath),
      ...resolve,
    },
  };
}
