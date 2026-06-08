export declare function createPlaywrightConfig(
  options?: PlaywrightConfigOptions,
): import('@playwright/test').PlaywrightTestConfig;

export interface PlaywrightConfigOptions {
  baseURL: string;
  testDir?: string;
  webServerCommand?: string;
  webServerPort?: number;
  webServerTimeout?: number;
  headless?: boolean;
  browsers?: string[];
  use?: Record<string, unknown>;
  expect?: Record<string, unknown>;
  timeout?: number;
  retries?: number;
}
