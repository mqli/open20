import type { Plugin } from 'vite';

export function dirnameFromImportMeta(importMetaUrl: string): string;

export function createAlias(
  importMetaUrl: string,
  relativePath?: string,
  alias?: string,
): {
  [alias]: string;
};

export function createGithubPagesBase(options?: GithubPagesBaseOptions): string;
export type GithubPagesBaseOptions = {
  envVar?: string;
  target?: string;
  pagesBase?: string;
  defaultBase?: string;
};

export function createTunnelPlugins(params: {
  cloudflareTunnel: (options?: { port?: number }) => Plugin;
  QRCode: typeof import('qrcode');
  port?: number;
}): Plugin[];
