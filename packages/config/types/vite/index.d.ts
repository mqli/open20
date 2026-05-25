/**
 * @param {string} importMetaUrl
 */
export function dirnameFromImportMeta(importMetaUrl: string): string;
/**
 * @param {string} importMetaUrl
 * @param {string} [relativePath]
 * @param {string} [alias]
 */
export function createAlias(importMetaUrl: string, relativePath?: string, alias?: string): {
    [alias]: string;
};
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
export function createGithubPagesBase({ envVar, target, pagesBase, defaultBase, }?: GithubPagesBaseOptions): string;
export type GithubPagesBaseOptions = {
    envVar?: string | undefined;
    target?: string | undefined;
    pagesBase?: string | undefined;
    defaultBase?: string | undefined;
};
