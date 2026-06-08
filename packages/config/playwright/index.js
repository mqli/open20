/**
 * @typedef {object} PlaywrightConfigOptions
 * @property {string} baseURL - Base URL for the web server
 * @property {string} [testDir] - Directory containing tests (default: './e2e')
 * @property {string} [webServerCommand] - Command to start the web server
 * @property {number} [webServerPort] - Port for the web server
 * @property {string} [webServerTimeout] - Timeout for web server startup (default: 120000)
 * @property {boolean} [headless] - Run browser in headless mode (default: true)
 * @property {string[]} [browsers] - Browsers to test (default: ['chromium'])
 * @property {object} [use] - Default use options for all tests
 * @property {object} [expect] - Expect options
 * @property {number} [timeout] - Test timeout in ms (default: 30000)
 * @property {number} [retries] - Number of retries (default: 2 in CI, 0 locally)
 * @property {string[]|Array<array>} [reporters] - Reporters configuration (default: ['list'] local, ['list','github'] CI)
 */

/**
 * Create a shared Playwright configuration for open20 packages
 * @param {PlaywrightConfigOptions} options
 */
export function createPlaywrightConfig(options = {}) {
  const {
    baseURL,
    testDir = './e2e',
    webServerCommand,
    webServerPort,
    webServerTimeout = 120000,
    headless = true,
    browsers = ['chromium'],
    use = {},
    expect: expectOptions = {},
    timeout = 30000,
    retries,
    reporters,
  } = options;

  if (!baseURL) {
    throw new Error('baseURL is required in Playwright config');
  }

  const isCI = process.env.CI === 'true';

  // Default reporters: 'list' for local (no HTML report), 'list' + 'github' for CI
  const defaultReporters = isCI ? [['list'], ['github']] : [['list']];
  const finalReporters = reporters || defaultReporters;

  /** @type {import('@playwright/test').PlaywrightTestConfig} */
  const config = {
    testDir,
    timeout,
    retries: retries ?? (isCI ? 2 : 0),
    reporters: finalReporters,
    use: {
      baseURL,
      headless,
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
      trace: 'on-first-retry',
      ...use,
    },
    expect: {
      timeout: 5000,
      ...expectOptions,
    },
    projects: browsers.map((browserName) => ({
      name: browserName,
      use: {
        ...(browserName === 'chromium' && {}),
        ...(browserName === 'firefox' && { browserName: 'firefox' }),
        ...(browserName === 'webkit' && { browserName: 'webkit' }),
      },
    })),
  };

  // Add webServer config if provided
  if (webServerCommand && webServerPort) {
    config.webServer = {
      command: webServerCommand,
      port: webServerPort,
      timeout: webServerTimeout,
      reuseExistingServer: !isCI,
    };
  }

  return config;
}
