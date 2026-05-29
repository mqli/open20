import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @param {string} importMetaUrl
 */
export function dirnameFromImportMeta(importMetaUrl) {
  return path.dirname(fileURLToPath(importMetaUrl));
}

/**
 * @param {string} importMetaUrl
 * @param {string} [relativePath]
 * @param {string} [alias]
 */
export function createAlias(importMetaUrl, relativePath = './src', alias = '@') {
  const dirname = dirnameFromImportMeta(importMetaUrl);
  return {
    [alias]: path.resolve(dirname, relativePath),
  };
}

/**
 * @typedef {object} GithubPagesBaseOptions
 * @property {string} [envVar]
 * @property {string} [target]
 * @property {string} [pagesBase]
 * @property {string} [defaultBase]
 */

/**
 * @param {GithubPagesBaseOptions} [options]
 */
export function createGithubPagesBase({
  envVar = 'DEPLOY_TARGET',
  target = 'github-pages',
  pagesBase = '/',
  defaultBase = '/',
} = {}) {
  return process.env[envVar] === target ? pagesBase : defaultBase;
}
