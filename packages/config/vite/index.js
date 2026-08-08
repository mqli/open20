import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tunnelQrcodePlugin } from './plugin-tunnel-qrcode.js';

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

// ── Cloudflare Tunnel Plugin Helpers ──

/**
 * Creates Vite plugins for Cloudflare tunnel mobile testing.
 * Opt-in via `TUNNEL=true` env var. When enabled, starts a Cloudflare quick
 * tunnel and prints a QR code to the terminal for easy mobile access.
 *
 * Requires `vite-plugin-cloudflare-tunnel` and `qrcode` as devDependencies
 * in the consuming package. The caller must pass the imported modules to
 * avoid bundling them in every build.
 *
 * Usage in vite.config.ts:
 *
 *   import cloudflareTunnel from 'vite-plugin-cloudflare-tunnel';
 *   import QRCode from 'qrcode';
 *   import { createTunnelPlugins } from '@open20/config/vite';
 *
 *   export default defineConfig({
 *     plugins: [
 *       ...otherPlugins,
 *       ...createTunnelPlugins({ cloudflareTunnel, QRCode, port: 5173 }),
 *     ],
 *   });
 *
 * @param {{
 *   cloudflareTunnel: import('vite-plugin-cloudflare-tunnel').default,
 *   QRCode: typeof import('qrcode'),
 *   port?: number,
 * }} params
 * @returns {import('vite').Plugin[]}
 */
export function createTunnelPlugins({ cloudflareTunnel, QRCode, port = 5173 }) {
  if (process.env.TUNNEL !== 'true') return [];

  return [cloudflareTunnel({ port }), tunnelQrcodePlugin(QRCode)];
}
