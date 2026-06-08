# Playwright Shared Configuration

This package provides a shared Playwright configuration factory for open20 packages.

## Usage

```typescript
import { defineConfig } from '@playwright/test';
import { createPlaywrightConfig } from '@open20/config/playwright';

export default defineConfig(
  createPlaywrightConfig({
    baseURL: 'http://localhost:4173',
    webServerCommand: 'pnpm run preview --port 4173',
    webServerPort: 4173,
  }),
);
```

## Documentation

For detailed setup instructions, see:

- **Setup Guide**: [`.agents/e2e/playwright-setup.md`](../../.agents/e2e/playwright-setup.md)
- **Writing Tests**: [`.agents/e2e/writing-tests.md`](../../.agents/e2e/writing-tests.md)
- **Best Practices**: [`.agents/e2e/best-practices.md`](../../.agents/e2e/best-practices.md)

## API

### `createPlaywrightConfig(options)`

Creates a shared Playwright configuration.

**Options:**

- `baseURL` (required): Base URL for the web server
- `testDir`: Directory containing tests (default: `'./e2e'`)
- `webServerCommand`: Command to start the web server
- `webServerPort`: Port for the web server
- `headless`: Run browser in headless mode (default: `true`)
- `browsers`: Browsers to test (default: `['chromium']`)
- `use`: Default use options for all tests
- `timeout`: Test timeout in ms (default: `30000`)
- `retries`: Number of retries (default: `2` in CI, `0` locally)

## Examples

See `packages/spellbook/playwright.config.ts` for a complete example.
