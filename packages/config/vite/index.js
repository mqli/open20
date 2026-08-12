import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
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
 * `vite-plugin-cloudflare-tunnel` and `qrcode` are loaded dynamically
 * only when TUNNEL=true — they are never bundled into production builds.
 *
 * Usage in vite.config.ts:
 *
 *   import { createTunnelPlugins } from '@open20/config/vite';
 *
 *   export default defineConfig({
 *     plugins: [...createTunnelPlugins({ port: 5173 })],
 *   });
 *
 * @param {{ port?: number }} [options]
 * @returns {import('vite').Plugin[]}
 */
export function createTunnelPlugins({ port = 5173 } = {}) {
  if (process.env.TUNNEL !== 'true') return [];

  // Dynamically load optional dev deps – never evaluated during prod build.
  const require = createRequire(import.meta.url);
  const cloudflareTunnel = require('vite-plugin-cloudflare-tunnel').default;
  const QRCode = require('qrcode');

  return [cloudflareTunnel({ port }), tunnelQrcodePlugin(QRCode)];
}
