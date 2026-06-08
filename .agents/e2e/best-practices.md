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

## Reliability

### 4. Handle Asynchronous Operations Properly

```typescript
// ✅ Good - explicit waiting
await expect(page.getByText('Success')).toBeVisible();
await expect(page.getByRole('button')).toBeEnabled();

// ❌ Bad - arbitrary timeouts
await page.waitForTimeout(5000);
```

### 5. Use `expect.poll()` for Async State

```typescript
// ✅ Good - poll for async state
await expect.poll(() => page.getByText('Loading').isVisible()).toBe(false);

// Or use waitFor
await page.getByText('Result').waitFor({ state: 'visible' });
```

### 6. Isolate Test Data

Each test should use fresh data:

```typescript
test.describe('Spell Preparation', () => {
  test.beforeEach(async ({ page }) => {
    // Reset to known state
    await resetTestData();
    await page.goto('/spells');
  });
});
```

## Maintenance

### 7. Use Page Objects

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

### 8. Create Reusable Fixtures

For complex setup, use fixtures:

```typescript
// fixtures/spellbook.fixture.ts
export const test = base.extend({
  authenticatedUser: async ({ page }, use) => {
    await login(page, 'testuser', 'password');
    await use(page);
  },
});
```

### 9. Avoid Test Coupling

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

## Performance

### 10. Run Tests in Parallel

Playwright runs test files in parallel by default. To enable parallelism within a file:

```typescript
test.describe.configure({ mode: 'parallel' });

test('test 1', async () => {
  /* ... */
});
test('test 2', async () => {
  /* ... */
});
```

### 11. Use `test.describe.serial` Sparingly

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

### 12. Mock External Dependencies

Use `page.route()` to mock API calls:

```typescript
await page.route('**/api/spells', async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify([{ name: 'Fireball' }]),
  });
});
```

## Debugging

### 13. Use UI Mode for Development

```bash
pnpm run test:e2e:ui
```

UI mode provides:

- Visual test runner
- Time travel debugging
- Element picker

### 14. Use `page.pause()` for Debugging

```typescript
test('debug example', async ({ page }) => {
  await page.pause(); // Opens Playwright Inspector
  // ... rest of test
});
```

### 15. Capture Screenshots and Videos

Configure in `playwright.config.ts`:

```typescript
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry',
}
```

## Code Quality

### 16. Use TypeScript Strictly

```typescript
// ✅ Good - type-safe
const spellName: string = (await page.getByRole('heading').textContent()) ?? '';

// ❌ Bad - using any
const data: any = await response.json();
```

### 17. Avoid Hardcoded Waits

```typescript
// ✅ Good - wait for specific condition
await expect(page.getByText('Loaded')).toBeVisible();

// ❌ Bad - arbitrary wait
await page.waitForTimeout(3000);
```

### 18. Use Data Attributes for Unstable Selectors

Add `data-testid` to elements:

```html
<button data-testid="submit-btn">Submit</button>
```

```typescript
await page.getByTestId('submit-btn').click();
```

## CI/CD

### 19. Run E2E Tests in CI

Add E2E tests to your CI pipeline (see `playwright-setup.md`):

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
