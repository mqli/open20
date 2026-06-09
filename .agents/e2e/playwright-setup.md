# Playwright Setup Guide for open20 Packages

This guide explains how to set up Playwright E2E testing for new packages in the open20 monorepo.

## Prerequisites

- Playwright config factory in `packages/config/playwright/`
- `@open20/config` package (provides shared config)
- `@playwright/test` dependency

## Setup Steps

### 1. Add Dependencies

Add `@playwright/test` to your package's `devDependencies`:

```json
{
  "devDependencies": {
    "@playwright/test": "catalog:"
  }
}
```

### 2. Add Scripts

Add E2E test scripts to your `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

### 3. Create Playwright Config

Create `playwright.config.ts` in your package root:

```typescript
import { defineConfig } from '@playwright/test';
import { createPlaywrightConfig } from '@open20/config/playwright';

const isCI = process.env.CI === 'true';

export default defineConfig(
  createPlaywrightConfig({
    // Base URL for your app
    baseURL: 'http://localhost:4173',

    // Directory containing E2E tests
    testDir: './e2e',

    // Command to start preview server (serves build artifact)
    webServerCommand: 'pnpm run preview --port 4173',
    webServerPort: 4173,
    webServerTimeout: 120000,

    // Browser configuration
    headless: isCI,
    browsers: ['chromium'], // Add 'firefox', 'webkit' as needed

    // Test behavior
    use: {
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
      trace: 'on-first-retry',
    },

    timeout: 30000,
    retries: isCI ? 2 : 0,
  }),
);
```

### 4. Create E2E Directory Structure

```bash
mkdir -p e2e/{fixtures,pages,specs}
```

### 5. Create First Test

Create `e2e/specs/smoke.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('should load the application', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Your App Title/);
});
```

### 6. Install Playwright Browsers

```bash
pnpm --filter <your-package> exec playwright install --with-deps chromium
```

### 7. Run Tests

```bash
# Run tests
pnpm --filter <your-package> run test:e2e

# Run with UI mode (great for development)
pnpm --filter <your-package> run test:e2e:ui

# Debug tests
pnpm --filter <your-package> run test:e2e:debug
```

## Configuration Options

### `createPlaywrightConfig` Options

| Option             | Type       | Default                | Description                    |
| ------------------ | ---------- | ---------------------- | ------------------------------ |
| `baseURL`          | `string`   | **required**           | Base URL for the web server    |
| `testDir`          | `string`   | `'./e2e'`              | Directory containing tests     |
| `webServerCommand` | `string`   | -                      | Command to start web server    |
| `webServerPort`    | `number`   | -                      | Port for web server            |
| `webServerTimeout` | `number`   | `120000`               | Timeout for web server startup |
| `headless`         | `boolean`  | `true`                 | Run browser in headless mode   |
| `browsers`         | `string[]` | `['chromium']`         | Browsers to test               |
| `use`              | `object`   | `{}`                   | Default use options            |
| `timeout`          | `number`   | `30000`                | Test timeout in ms             |
| `retries`          | `number`   | `2` in CI, `0` locally | Number of retries              |

## CI Integration

Add E2E tests to your CI workflow:

```yaml
- name: Install Playwright browsers
  run: pnpm --filter <package-name> exec playwright install --with-deps chromium

- name: Run E2E tests
  run: pnpm turbo run test:e2e --filter=<package-name>
  env:
    CI: 'true'

- name: Upload E2E test results (on failure)
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: packages/<package-name>/playwright-report/
    retention-days: 30
```

## Troubleshooting

### Tests fail with "webServer" timeout

- Increase `webServerTimeout`
- Check that `webServerCommand` correctly starts the server
- Verify `webServerPort` matches the server's actual port

### Tests pass locally but fail in CI

- Ensure `headless: true` in CI
- Check for race conditions (use `waitFor` methods)
- Verify all dependencies are installed in CI

### Can't find `@open20/config/playwright`

- Run `pnpm install` to link workspace dependencies
- Verify `packages/config/playwright/index.js` exists

### getByTestId() finds nothing / element not found

`data-testid` attributes are **stripped by Vite in production builds**. Playwright tests run against `vite preview`, not the dev server. Replace `getByTestId('x')` with a CSS class selector: add a stable class like `className="my-element"` to the component and use `page.locator('.my-element')` in tests.

### waitForLoadState('networkidle') hangs forever

This SPA makes background fetch requests after the DOM loads, so `networkidle` is never reached. Replace it with `domcontentloaded` followed by waiting for a specific element:

```typescript
await page.waitForLoadState('domcontentloaded');
await page.locator('.my-element').waitFor({ state: 'visible' });
```

### Locators intercepted by dialog backdrop

The app renders a `z-40` backdrop when a dialog is open. Elements outside the dialog will have pointer events blocked. Scope all locators to the dialog root:

```typescript
const sheet = page.locator('[role="dialog"]');
await sheet.locator('.slot-pip').first().click(); // not blocked
```

### Strict mode violation: getByText resolves to 2 elements

Use `{ exact: true }` to match only the full text string, not substrings:

```typescript
await page.getByText('Fireball', { exact: true }).first().click();
```

### localStorage fixture not working / character not loading

Common causes:

- `addInitScript()` must be called **before** `page.goto()`, not after
- `classId` must be capitalized: `'Wizard'` not `'wizard'`
- Ability score keys must be full names: `'Intelligence'` not `'int'`
- A spell can only appear in `preparedSpells` if it is also in `knownSpells` (for spellbook casters like Wizard)
