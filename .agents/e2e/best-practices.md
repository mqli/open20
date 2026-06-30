# E2E Testing Best Practices

This document outlines best practices for writing and maintaining E2E tests in the open20 project.

## Test Design

### 1. Test the Right Things

E2E tests are expensive (slow, flaky). Test only:

- Critical user flows (happy paths)
- Key business logic
- Regression cases for bugs

**Don't test:**

- Edge cases (use unit tests)
- Visual details (use visual regression tools)
- Every permutation (use unit tests)

### 2. Keep Tests Focused

Each test should verify one thing:

```typescript
// ✅ Good - focused test
test('should search spells by name', async ({ page }) => {
  await searchInput.fill('Fireball');
  await expect(spellCard).toHaveCount(1);
});

// ❌ Bad - testing too many things
test('should search, filter, and prepare spells', async ({ page }) => {
  // Too many things in one test
});
```

### 3. Use Descriptive Test Names

Test names should describe the expected behavior:

```typescript
// ✅ Good
test('should display error message when search term is empty');
test('should prepare spell when clicking prepare button');

// ❌ Bad
test('search test');
test('prepare spell');
```

## Selectors

### 4. CSS Classes as the Primary Selector

`data-testid` attributes are **stripped by Vite in production builds** in this project. Playwright E2E tests run against `vite preview` (the production artifact), so `getByTestId()` will never find anything.

Use a stable CSS class as the primary selector:

```typescript
// ✅ Preferred — stable against code changes
// In component
<IconButton className="prepare-spell-button" ... />

// In test
await page.locator('.prepare-spell-button').click();
```

### 5. Semantic Locators as a Supplement

For elements with ARIA attributes, semantic locators are also appropriate:

```typescript
// ✅ Fine — role with accessible name
await page.getByRole('tab').first().click();
await page.getByRole('button', { name: /close/i }).click();

// ✅ Fine — accessible label
await page.getByLabel('Search').fill('Fireball');
```

Semantic locators are safe for truly semantic elements (tabs, headings, buttons by aria-name), but rely on CSS classes when ARIA attributes are not present.

### 6. Use exact: true with getByText

`getByText('Fireball')` matches ANY element containing the substring "Fireball" — including "Delayed Blast Fireball". In strict mode (the default), this throws if more than one element matches.

```typescript
// ❌ Strict mode violation — matches "Fireball" and "Delayed Blast Fireball"
await page.getByText('Fireball').click();

// ✅ Matches only the exact text
await page.getByText('Fireball', { exact: true }).first().click();
```

## Reliability

### 7. Never Use waitForLoadState('networkidle') on This SPA

This app is a SPA that makes background fetch requests after the DOM loads. `networkidle` waits for all network activity to stop — it will hang indefinitely.

```typescript
// ❌ Hangs because background data fetches never fully stop
await page.waitForLoadState('networkidle');

// ✅ Wait for DOM, then wait for a specific element to appear
await page.waitForLoadState('domcontentloaded');
await page.locator('.spell-card').first().waitFor({ state: 'visible' });
```

### 8. The App Only Has One Route

This is a SPA with a single route. All tests navigate to `/`, not `/spells` or any sub-path.

```typescript
// ❌ Wrong — this route does not exist
await page.goto('/spells');

// ✅ Correct
await page.goto('/');
```

### 9. Isolate Test Data via addInitScript

Each test should set up its own fresh state. For character-dependent tests, seed localStorage before the page loads using `page.addInitScript()` — it runs before any page scripts execute.

```typescript
test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({ storageKey, activeKey, character }) => {
      localStorage.setItem(storageKey, JSON.stringify([character]));
      localStorage.setItem(activeKey, character.id);
    },
    { storageKey: STORAGE_KEY, activeKey: ACTIVE_CHARACTER_KEY, character: TEST_WIZARD },
  );
  // Navigate AFTER addInitScript is registered
  await page.goto('/');
});
```

See `e2e/fixtures/test-character.ts` for the canonical test character definition.

### 10. Scope Locators to Dialogs

Radix UI Dialog and Sheet both render with `role="dialog"`. The app has a backdrop (`z-40`) that can intercept pointer events for elements rendered outside the dialog. Always scope dialog-related locators:

```typescript
const sheet = page.locator('[role="dialog"]');

// ✅ Scoped to dialog — not intercepted by backdrop
await sheet.locator('.slot-pip').first().click();
await sheet.getByRole('tab').first().click();
```

When multiple dialogs could be open (spell flyout + character sheet), be explicit:

```typescript
// Two dialogs could match — scope to the specific one you want
const prepareButton = page.locator('[role="dialog"] .prepare-spell-button');
```

## Maintenance

### 11. Use Page Objects

Encapsulate page interactions in page objects (see `writing-tests.md`):

```typescript
// pages/SpellLibraryPage.ts
export class SpellLibraryPage {
  async searchSpell(name: string) {
    await this.searchInput.fill(name);
    await this.page.waitForTimeout(500);
  }
}
```

### 12. Avoid Test Coupling

Tests should not depend on each other:

```typescript
// ❌ Bad - test2 depends on test1
test('test1', async () => {
  /* create data */
});
test('test2', async () => {
  /* use data from test1 */
});

// ✅ Good - each test sets up its own data
test('test1', async () => {
  /* create data */
});
test('test2', async () => {
  /* create own data */
});
```

### 13. Check State Before Acting

When a test conditionally prepares/unprepares something, always check the current state first. Do not assume a fixture's initial state matches what you expect after `recompute()` runs.

```typescript
// ✅ Good - check before acting
const prepareButton = page.locator('[role="dialog"] .prepare-spell-button');
if (!/unprepare/i.test((await prepareButton.getAttribute('title')) ?? '')) {
  await prepareButton.click(); // prepare it first
}
await prepareButton.click(); // now unprepare
await expect(prepareButton).toHaveAttribute('title', /prepare spell/i);
```

## Performance

### 14. Run Tests in Parallel

Playwright runs test files in parallel by default. To enable parallelism within a file:

```typescript
test.describe.configure({ mode: 'parallel' });
```

### 15. Use test.describe.serial Sparingly

Only use serial mode when tests must run in order:

```typescript
test.describe.serial('Critical Flow', () => {
  test('step 1', async () => {
    /* ... */
  });
  test('step 2', async () => {
    /* depends on step 1 */
  });
});
```

## Debugging

### 16. Use UI Mode for Development

```bash
pnpm run test:e2e:ui
```

### 17. Use page.pause() for Debugging

```typescript
test('debug example', async ({ page }) => {
  await page.pause(); // Opens Playwright Inspector
});
```

### 18. Capture Screenshots and Videos

Configure in `playwright.config.ts`:

```typescript
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry',
}
```

## CI/CD

### 19. Run E2E Tests in CI

```yaml
- name: Run E2E tests
  run: pnpm turbo run test:e2e --filter=<package>
  env:
    CI: 'true'
```

### 20. Upload Test Artifacts on Failure

```yaml
- name: Upload test results
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
```

## Further Reading

- [Playwright Documentation](https://playwright.dev)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
