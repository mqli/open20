/**
 * Vite plugin that prints a QR code to the terminal when a Cloudflare tunnel
 * URL is detected. The `vite-plugin-cloudflare-tunnel` package outputs the
 * URL via `console.log`, and this plugin intercepts that output.
 *
 * Usage in vite.config.ts:
 *
 *   import QRCode from 'qrcode';
 *   import { tunnelQrcodePlugin } from '@open20/config/vite/plugin-tunnel-qrcode';
 *   // Only add when tunnel is enabled:
 *   ...(process.env.TUNNEL === 'true' ? [tunnelQrcodePlugin(QRCode)] : []),
 *
 * Requires `qrcode` as a devDependency in the consuming package.
 */

/**
 * @param {import('qrcode')} QRCode - The qrcode module (passed from consuming package)
 * @returns {import('vite').Plugin}
 */
export function tunnelQrcodePlugin(QRCode) {
  let insideInterceptor = false;

  return {
    name: 'tunnel-qrcode',
    apply: (_config, env) => env.command === 'serve',
    configureServer() {
      const originalLog = console.log.bind(console);
      console.log = (/** @type {any[]} */ ...args) => {
        // Prevent recursion: if we're already handling a match, pass through
        if (insideInterceptor) {
          originalLog(...args);
          return;
        }

        originalLog(...args);
        const msg = args.join(' ');
        // cloudflareTunnel uses console.log: "🌐  Quick tunnel ready at: https://xxx.trycloudflare.com"
        const match = msg.match(/https:\/\/[^\s]+\.trycloudflare\.com/);
        if (match) {
          insideInterceptor = true;
          try {
            QRCode.toString(match[0], { type: 'terminal', small: true }, (_err, qrcode) => {
              insideInterceptor = false;
              if (qrcode) {
                originalLog(`\n${qrcode}\n  ${match[0]}\n`);
              }
            });
          } catch {
            insideInterceptor = false;
          }
        }
      };
    },
  };
}
